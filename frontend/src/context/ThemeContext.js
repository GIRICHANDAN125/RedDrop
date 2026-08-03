import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../utils/theme';

// ─────────────────────────────────────────────────────────────
// THEME CONTEXT — RedDrop AI V2
// Provides persistent Dark/Light theme across the app.
// Preference is stored in expo-secure-store so it survives
// app restarts. Defaults to Dark mode on first launch.
// ─────────────────────────────────────────────────────────────

const THEME_STORE_KEY = '@reddrop_theme';

const ThemeContext = createContext({
  isDark:      true,
  colors:      Colors,         // active color set (dark by default)
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);  // dark-first default

  // ── Restore persisted preference on mount ────────────────
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(THEME_STORE_KEY);
        if (stored !== null) {
          setIsDark(stored === 'dark');
        }
      } catch {
        // Silently fall back to default dark mode
      }
    })();
  }, []);

  // ── Toggle and persist ───────────────────────────────────
  const toggleTheme = useCallback(async () => {
    setIsDark(prev => {
      const next = !prev;
      SecureStore.setItemAsync(THEME_STORE_KEY, next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  }, []);

  // ── Resolve active color set ─────────────────────────────
  // Dark mode  → top-level Colors object
  // Light mode → Colors.light sub-object merged with brand tokens
  const colors = isDark
    ? Colors
    : {
        ...Colors,               // brand / emergency tokens remain constant
        bgDark:          Colors.light.bg,
        bgCard:          Colors.light.bgCard,
        bgCardSecondary: Colors.light.bgCard,
        bgModal:         Colors.light.bgModal,
        glass:           Colors.light.glass,
        glassBorder:     Colors.light.glassBorder,
        glassStrong:     'rgba(0, 0, 0, 0.06)',
        textPrimary:     Colors.light.textPrimary,
        textSecondary:   Colors.light.textSecondary,
        textMuted:       Colors.light.textMuted,
        divider:         Colors.light.divider,
        border:          Colors.light.border,
      };

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ── Named context export for advanced consumers ──────────────
export { ThemeContext };

export default ThemeProvider;
