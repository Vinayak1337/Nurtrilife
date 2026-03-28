import { Palette } from './theme';

export const DEFAULT_GOALS = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fats: 65,
  fiber: 25,
  sugar: 50,
  sodium: 2300,
} as const;

export const MACRO_PRESETS = {
  balanced: {
    label: 'Balanced',
    description: 'Equal distribution of macros',
    protein: 150,
    carbs: 200,
    fats: 65,
  },
  highProtein: {
    label: 'High Protein',
    description: 'Optimized for muscle building',
    protein: 200,
    carbs: 150,
    fats: 65,
  },
  keto: {
    label: 'Keto',
    description: 'Very low carb, high fat',
    protein: 150,
    carbs: 30,
    fats: 160,
  },
  lowCarb: {
    label: 'Low Carb',
    description: 'Reduced carbohydrates',
    protein: 175,
    carbs: 100,
    fats: 90,
  },
} as const;

export const CALORIE_PRESETS = [1500, 1800, 2000, 2200, 2500] as const;

// icon values are SF Symbol names (used with IconSymbol component)
export const NUTRIENT_META = {
  calories: {
    label: 'Calories',
    unit: 'kcal',
    color: Palette.secondary,
    mutedColor: Palette.secondaryMuted,
    icon: 'flame.fill' as const,
  },
  protein: {
    label: 'Protein',
    unit: 'g',
    color: Palette.protein,
    mutedColor: Palette.proteinMuted,
    icon: 'dumbbell.fill' as const,
  },
  carbs: {
    label: 'Carbs',
    unit: 'g',
    color: Palette.carbs,
    mutedColor: Palette.carbsMuted,
    icon: 'leaf.fill' as const,
  },
  fats: {
    label: 'Fats',
    unit: 'g',
    color: Palette.fats,
    mutedColor: Palette.fatsMuted,
    icon: 'drop.fill' as const,
  },
  fiber: {
    label: 'Fiber',
    unit: 'g',
    color: Palette.fiber,
    mutedColor: Palette.fiberMuted,
    icon: 'chart.bar.fill' as const,
  },
  sugar: {
    label: 'Sugar',
    unit: 'g',
    color: Palette.sugar,
    mutedColor: Palette.sugarMuted,
    icon: 'heart.fill' as const,
  },
  sodium: {
    label: 'Sodium',
    unit: 'mg',
    color: Palette.sodium,
    mutedColor: Palette.sodiumMuted,
    icon: 'exclamationmark.triangle.fill' as const,
  },
} as const;

export const MEAL_TYPE_META = {
  breakfast: {
    label: 'Breakfast',
    icon: 'sunrise.fill' as const,
    color: '#F59E0B',
    timeRange: '6am – 10am',
  },
  lunch: {
    label: 'Lunch',
    icon: 'sun.max.fill' as const,
    color: '#10B981',
    timeRange: '11am – 2pm',
  },
  dinner: {
    label: 'Dinner',
    icon: 'moon.fill' as const,
    color: '#3B82F6',
    timeRange: '5pm – 9pm',
  },
  snack: {
    label: 'Snack',
    icon: 'clock.fill' as const,
    color: '#8B5CF6',
    timeRange: 'Anytime',
  },
} as const;

export type MealType = keyof typeof MEAL_TYPE_META;
export type NutrientKey = keyof typeof NUTRIENT_META;
