import { IconSymbolName } from '@/components/ui/icon-symbol';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: IconSymbolName;
  color: string;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: 'first_bite',
    name: 'First Bite',
    description: 'Log your first meal',
    icon: 'fork.knife',
    color: '#10B981',
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: '7-day logging streak',
    icon: 'flame.fill',
    color: '#F59E0B',
  },
  {
    id: 'macro_master',
    name: 'Macro Master',
    description: 'Hit all macro targets in a day',
    icon: 'sparkles',
    color: '#8B5CF6',
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Log 100 meals',
    icon: 'checkmark.circle.fill',
    color: '#EF4444',
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: '7 days with health score above 80',
    icon: 'heart.fill',
    color: '#EC4899',
  },
  {
    id: 'hydration_hero',
    name: 'Hydration Hero',
    description: 'Meet water goal 5 days in a row',
    icon: 'drop.fill',
    color: '#3B82F6',
  },
  {
    id: 'ai_explorer',
    name: 'AI Explorer',
    description: 'Analyze 10 different foods',
    icon: 'camera.fill',
    color: '#06B6D4',
  },
];
