import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Typography, Spacing, Radius, Shadows, Animation, Overlay, TouchTarget } from '../utils/theme';

// ─────────────────────────────────────────────────────────────
// useTheme — RedDrop AI V2
//
// Convenience hook for any component that needs theme tokens.
// Returns the full design system for the active theme mode.
//
// Usage:
//   const { colors, typography, isDark, toggleTheme } = useTheme();
//
// ─────────────────────────────────────────────────────────────
const useTheme = () => {
  const { isDark, colors, toggleTheme } = useContext(ThemeContext);

  return {
    // ── Active color set (dark or light resolved) ────────
    colors,

    // ── Static token sets (theme-independent) ────────────
    typography:  Typography,
    spacing:     Spacing,
    radius:      Radius,
    shadows:     Shadows,
    animation:   Animation,
    overlay:     Overlay,
    touchTarget: TouchTarget,

    // ── Theme state ──────────────────────────────────────
    isDark,
    isLight: !isDark,
    toggleTheme,

    // ── Utility: resolve a value by theme ────────────────
    // e.g. theme.resolve('#fff', '#000') → '#fff' in dark, '#000' in light
    resolve: (darkValue, lightValue) => isDark ? darkValue : lightValue,
  };
};

export default useTheme;
