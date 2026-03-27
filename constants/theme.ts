import { Platform } from 'react-native';

export const Palette = {
  // Brand
  primary: '#10B981',
  primaryDark: '#059669',
  primaryLight: '#34D399',
  primaryMuted: '#D1FAE5',

  // Calories / energy
  secondary: '#F59E0B',
  secondaryDark: '#D97706',
  secondaryLight: '#FCD34D',
  secondaryMuted: '#FEF3C7',

  // Warning / danger
  accent: '#EF4444',
  accentDark: '#DC2626',
  accentLight: '#FCA5A5',
  accentMuted: '#FEE2E2',

  // Macros
  protein: '#3B82F6',
  proteinMuted: '#DBEAFE',
  carbs: '#F59E0B',
  carbsMuted: '#FEF3C7',
  fats: '#EF4444',
  fatsMuted: '#FEE2E2',
  fiber: '#10B981',
  fiberMuted: '#D1FAE5',
  sugar: '#EC4899',
  sugarMuted: '#FCE7F3',
  sodium: '#8B5CF6',
  sodiumMuted: '#EDE9FE',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Dark surfaces
  dark900: '#0A0F1E',
  dark800: '#111827',
  dark700: '#1F2937',
  dark600: '#2D3748',

  transparent: 'transparent',
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.2)',
};

export const Colors = {
  light: {
    text: '#111827',
    textSecondary: '#374151',
    textTertiary: '#6B7280',
    textInverse: '#FFFFFF',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceSecondary: '#F3F4F6',
    surfaceElevated: '#FFFFFF',
    tint: Palette.primary,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: Palette.primary,
    border: '#E5E7EB',
    borderFocused: Palette.primary,
    primary: Palette.primary,
    primaryDark: Palette.primaryDark,
    primaryLight: Palette.primaryLight,
    primaryMuted: Palette.primaryMuted,
    secondary: Palette.secondary,
    secondaryMuted: Palette.secondaryMuted,
    accent: Palette.accent,
    accentMuted: Palette.accentMuted,
    protein: Palette.protein,
    proteinMuted: Palette.proteinMuted,
    carbs: Palette.carbs,
    carbsMuted: Palette.carbsMuted,
    fats: Palette.fats,
    fatsMuted: Palette.fatsMuted,
    fiber: Palette.fiber,
    fiberMuted: Palette.fiberMuted,
    sugar: Palette.sugar,
    sugarMuted: Palette.sugarMuted,
    sodium: Palette.sodium,
    sodiumMuted: Palette.sodiumMuted,
    cardShadowColor: '#000000',
    overlay: Palette.overlay,
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#E5E7EB',
    textTertiary: '#9CA3AF',
    textInverse: '#111827',
    background: '#0A0F1E',
    surface: '#111827',
    surfaceSecondary: '#1F2937',
    surfaceElevated: '#1F2937',
    tint: Palette.primary,
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: Palette.primary,
    border: '#374151',
    borderFocused: Palette.primary,
    primary: Palette.primary,
    primaryDark: Palette.primaryDark,
    primaryLight: Palette.primaryLight,
    primaryMuted: 'rgba(16,185,129,0.15)',
    secondary: Palette.secondary,
    secondaryMuted: 'rgba(245,158,11,0.15)',
    accent: Palette.accent,
    accentMuted: 'rgba(239,68,68,0.15)',
    protein: Palette.protein,
    proteinMuted: 'rgba(59,130,246,0.15)',
    carbs: Palette.carbs,
    carbsMuted: 'rgba(245,158,11,0.15)',
    fats: Palette.fats,
    fatsMuted: 'rgba(239,68,68,0.15)',
    fiber: Palette.fiber,
    fiberMuted: 'rgba(16,185,129,0.15)',
    sugar: Palette.sugar,
    sugarMuted: 'rgba(236,72,153,0.15)',
    sodium: Palette.sodium,
    sodiumMuted: 'rgba(139,92,246,0.15)',
    cardShadowColor: '#000000',
    overlay: Palette.overlay,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 64,
} as const;

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  full: 9999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  primary: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const FontFamily = {
  regular: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  semiBold: 'SpaceGrotesk_600SemiBold',
  bold: 'SpaceGrotesk_700Bold',
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 34,
  display: 42,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof Colors.light;
