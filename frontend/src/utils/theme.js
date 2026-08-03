// ============================================================
// Design System — RedDrop AI V2
// Phase 1 Implementation — Enterprise Token Foundation
// Aesthetic: Emergency Medical Dark — midnight abyss, crimson
//   pulse, glassmorphism surfaces, crisp geometric typography
// Inspired by: Apple Health, Stripe, Revolut, Google Material 3
// ============================================================

// ─────────────────────────────────────────────────────────────
// COLOR TOKENS
// ─────────────────────────────────────────────────────────────
export const Colors = {
  // ── Brand ──────────────────────────────────────────────────
  primary:      '#E63946',          // Crimson Pulse
  primaryDark:  '#C1121F',
  primaryLight: '#FF6B7A',
  primaryGlow:  'rgba(230, 57, 70, 0.18)',  // spec: 0.18

  // ── Dark Theme Backgrounds ─────────────────────────────────
  bgDark:           '#0A0A0F',      // Midnight Abyss
  bgCard:           '#13131A',      // Obsidian Card
  bgCardSecondary:  '#1A1A28',      // Elevated Glass Base
  bgModal:          'rgba(10, 10, 15, 0.85)',  // Overlay backdrop

  // ── Glassmorphism ──────────────────────────────────────────
  glass:       'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassStrong: 'rgba(255, 255, 255, 0.12)',  // spec: 0.12 (was 0.08)

  // ── Text (Dark Theme) ──────────────────────────────────────
  textPrimary:   '#FFFFFF',
  textSecondary: '#A0A0B8',
  textMuted:     '#5C5C7A',
  textAccent:    '#E63946',

  // ── Dividers & Borders ─────────────────────────────────────
  divider: 'rgba(255, 255, 255, 0.06)',
  border:  'rgba(255, 255, 255, 0.10)',

  // ── Status ─────────────────────────────────────────────────
  success:   '#2DC653',
  successBg: 'rgba(45, 198, 83, 0.12)',
  warning:   '#F4A261',
  warningBg: 'rgba(244, 162, 97, 0.12)',
  error:     '#E63946',
  errorBg:   'rgba(230, 57, 70, 0.12)',
  info:      '#4CC9F0',
  infoBg:    'rgba(76, 201, 240, 0.12)',

  // ── Emergency Urgency Levels ───────────────────────────────
  critical:   '#FF0040',
  criticalBg: 'rgba(255, 0, 64, 0.15)',
  high:       '#FF6B35',
  highBg:     'rgba(255, 107, 53, 0.15)',
  medium:     '#FFB703',
  mediumBg:   'rgba(255, 183, 3, 0.15)',
  low:        '#2DC653',
  lowBg:      'rgba(45, 198, 83, 0.15)',

  // ── Light Theme Sub-object ────────────────────────────────
  light: {
    bg:              '#F8F9FF',     // Ice White
    bgCard:          '#FFFFFF',
    border:          'rgba(0, 0, 0, 0.08)',
    textPrimary:     '#0A0A0F',
    textSecondary:   '#4A4A6A',
    textMuted:       '#8A8AAA',
    glass:           'rgba(0, 0, 0, 0.02)',
    glassBorder:     'rgba(0, 0, 0, 0.08)',
    divider:         'rgba(0, 0, 0, 0.06)',
    bgModal:         'rgba(248, 249, 255, 0.92)',
  }
};

// ─────────────────────────────────────────────────────────────
// BLOOD GROUP COLOR PALETTE
// ─────────────────────────────────────────────────────────────
export const BloodGroupColors = {
  'A+':  '#E63946',
  'A-':  '#FF6B7A',
  'B+':  '#4361EE',
  'B-':  '#4CC9F0',
  'AB+': '#7209B7',
  'AB-': '#9D4EDD',
  'O+':  '#F77F00',   // Universal Donor
  'O-':  '#E2711D',   // Universal Donor — highlight
};

// Background fills for blood group badges (15% opacity tints)
export const BloodGroupColorsBg = {
  'A+':  'rgba(230, 57, 70, 0.15)',
  'A-':  'rgba(255, 107, 122, 0.15)',
  'B+':  'rgba(67, 97, 238, 0.15)',
  'B-':  'rgba(76, 201, 240, 0.15)',
  'AB+': 'rgba(114, 9, 183, 0.15)',
  'AB-': 'rgba(157, 78, 221, 0.15)',
  'O+':  'rgba(247, 127, 0, 0.15)',
  'O-':  'rgba(226, 113, 29, 0.15)',
};

// ─────────────────────────────────────────────────────────────
// EMERGENCY COLORS (convenience re-export)
// ─────────────────────────────────────────────────────────────
export const EmergencyColors = {
  critical: Colors.critical,
  high:     Colors.high,
  medium:   Colors.medium,
  low:      Colors.low,
};

// ─────────────────────────────────────────────────────────────
// TYPOGRAPHY SYSTEM
// ─────────────────────────────────────────────────────────────
export const Typography = {
  // Font families — loaded via expo-font in App.js
  heading:        'Sora-Bold',
  headingSemibold:'Sora-SemiBold',
  body:           'DMSans-Regular',
  bodyMedium:     'DMSans-Medium',
  mono:           'SpaceMono-Regular',  // OTPs, hashes, QR IDs

  // Type Scale Matrix
  sizes: {
    display: 38,   // Hero headers, splash
    h1:      30,   // Screen titles
    h2:      24,   // Section headers
    h3:      20,   // Card titles
    h4:      17,   // Sub-headers, modals
    body:    15,   // Paragraphs, form text
    caption: 13,   // Subtitles, meta labels
    small:   11,   // Badges, timestamp tags
    // aliases
    xs:   11,
    sm:   13,
    base: 15,
    md:   17,
    lg:   20,
    xl:   24,
    '2xl': 30,
    '3xl': 38,
    '4xl': 48,
  },

  // Line Heights (absolute px, matching spec matrix)
  lineHeights: {
    display: 44,
    h1:      36,
    h2:      30,
    h3:      26,
    h4:      22,
    body:    22,
    caption: 18,
    small:   15,
    // ratio aliases
    tight:   1.2,
    normal:  1.5,
    relaxed: 1.7,
  },

  // Letter Spacing
  letterSpacing: {
    tight:  -0.3,
    normal:  0.0,
    wide:    0.3,
    wider:   0.6,
  }
};

// ─────────────────────────────────────────────────────────────
// SPACING SYSTEM — Base-4 Grid
// ─────────────────────────────────────────────────────────────
export const Spacing = {
  xs:     4,
  sm:     8,
  md:     16,
  lg:     24,
  xl:     32,
  '2xl':  48,
  '3xl':  64,
  screen: 20,   // Horizontal screen padding
};

// ─────────────────────────────────────────────────────────────
// BORDER RADIUS SYSTEM
// ─────────────────────────────────────────────────────────────
export const Radius = {
  sm:   8,     // Chips, small badges
  md:   12,    // Inputs, small cards, buttons
  lg:   16,    // Standard cards, modals
  xl:   20,    // Action sheets, floating cards
  '2xl': 28,   // Hero cards, onboarding sheets
  full: 9999,  // Pills, FAB, avatar containers
};

// ─────────────────────────────────────────────────────────────
// ELEVATION & SHADOW LAYERS
// ─────────────────────────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor:   '#E63946',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius:  8,
    elevation:     3,
  },
  md: {
    shadowColor:   '#E63946',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius:  16,
    elevation:     8,
  },
  lg: {
    shadowColor:   '#E63946',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius:  32,
    elevation:     16,
  },
  card: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.35,            // spec: 0.35 (was 0.30)
    shadowRadius:  12,
    elevation:     6,
  },
  glow: {                           // NEW — ambient crimson glow
    shadowColor:   '#E63946',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.50,
    shadowRadius:  20,
    elevation:     10,
  },
};

// ─────────────────────────────────────────────────────────────
// ANIMATION CONSTANTS — Reanimated v3 Physics Presets
// ─────────────────────────────────────────────────────────────
export const Animation = {
  // Durations (ms)
  duration: {
    micro:   150,   // Button taps, micro-interactions
    card:    300,   // Card entrance, list stagger
    modal:   400,   // Modals, bottom sheets
    pulse:   900,   // Emergency alert pulsing loop
    shimmer: 1200,  // Skeleton shimmer
  },

  // Stagger delay per list item (ms)
  staggerDelay: 60,

  // Spring physics
  spring: {
    // Default springy feel — buttons, tabs
    gentle:   { damping: 15, stiffness: 120 },
    // Snappy — modals, bottom sheets
    snappy:   { damping: 15, stiffness: 120 },
    // Bouncy — FAB, avatar entrance
    bouncy:   { damping: 10, stiffness: 150 },
    // Stiff — critical alerts, presses
    stiff:    { damping: 20, stiffness: 200 },
  },

  // Cubic bezier easing
  easing: {
    // Standard — buttons, taps
    standard: [0.25, 0.1, 0.25, 1],
    // Decelerate — elements entering screen
    decelerate: [0.0, 0.0, 0.2, 1],
    // Accelerate — elements leaving screen
    accelerate: [0.4, 0.0, 1, 1],
  },

  // Emergency pulse scale
  pulseScale: 1.15,

  // Press feedback scale
  pressScale: 0.96,
};

// ─────────────────────────────────────────────────────────────
// BOTTOM SHEET & OVERLAY CONSTANTS
// ─────────────────────────────────────────────────────────────
export const Overlay = {
  backdropColor:  'rgba(10, 10, 15, 0.85)',
  dragHandle: {
    width:        36,
    height:       4,
    borderRadius: 2,
    color:        'rgba(255, 255, 255, 0.25)',
  },
};

// ─────────────────────────────────────────────────────────────
// MINIMUM TOUCH TARGET (WCAG 2.1 / HIG)
// ─────────────────────────────────────────────────────────────
export const TouchTarget = {
  min: 44,   // Minimum 44×44dp per WCAG 2.1 & Apple HIG
};
