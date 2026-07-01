// Design System — Red Drop AI
// Aesthetic: Emergency Medical Dark — deep blacks, blood red, glass cards

export const Colors = {
  // Core brand
  primary: '#E63946',
  primaryDark: '#C1121F',
  primaryLight: '#FF6B7A',
  primaryGlow: 'rgba(230, 57, 70, 0.15)',

  // Backgrounds
  bgDark: '#0A0A0F',
  bgCard: '#13131A',
  bgCardSecondary: '#1A1A28',
  bgModal: 'rgba(10, 10, 15, 0.95)',

  // Glass effect
  glass: 'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassStrong: 'rgba(255, 255, 255, 0.08)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B8',
  textMuted: '#5C5C7A',
  textAccent: '#E63946',

  // Status
  success: '#2DC653',
  successBg: 'rgba(45, 198, 83, 0.12)',
  warning: '#F4A261',
  warningBg: 'rgba(244, 162, 97, 0.12)',
  error: '#E63946',
  errorBg: 'rgba(230, 57, 70, 0.12)',
  info: '#4CC9F0',
  infoBg: 'rgba(76, 201, 240, 0.12)',

  // Emergency levels
  critical: '#FF0040',
  criticalBg: 'rgba(255, 0, 64, 0.15)',
  high: '#FF6B35',
  highBg: 'rgba(255, 107, 53, 0.15)',
  medium: '#FFB703',
  mediumBg: 'rgba(255, 183, 3, 0.15)',
  low: '#2DC653',
  lowBg: 'rgba(45, 198, 83, 0.15)',

  // Dividers
  divider: 'rgba(255, 255, 255, 0.06)',
  border: 'rgba(255, 255, 255, 0.1)',

  // Light mode
  light: {
    bg: '#F8F9FF',
    bgCard: '#FFFFFF',
    textPrimary: '#0A0A0F',
    textSecondary: '#4A4A6A',
    glass: 'rgba(0,0,0,0.02)',
    glassBorder: 'rgba(0,0,0,0.08)',
    divider: 'rgba(0,0,0,0.06)'
  }
};

export const Typography = {
  // Fonts loaded via expo-font
  heading: 'Sora-Bold',
  headingSemibold: 'Sora-SemiBold',
  body: 'DMSans-Regular',
  bodyMedium: 'DMSans-Medium',
  mono: 'SpaceMono-Regular',

  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 30,
    '3xl': 38,
    '4xl': 48
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  screen: 20
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  full: 9999
};

export const Shadows = {
  sm: {
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  md: {
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8
  },
  lg: {
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 16
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6
  }
};

export const BloodGroupColors = {
  'A+': '#E63946',
  'A-': '#FF6B7A',
  'B+': '#4361EE',
  'B-': '#4CC9F0',
  'AB+': '#7209B7',
  'AB-': '#9D4EDD',
  'O+': '#F77F00',
  'O-': '#E2711D'
};

export const EmergencyColors = {
  critical: Colors.critical,
  high: Colors.high,
  medium: Colors.medium,
  low: Colors.low
};
