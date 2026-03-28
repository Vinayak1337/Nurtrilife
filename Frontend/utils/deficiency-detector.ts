import { DailyNutritionSummary } from '@/store/slices/insights.slice';

export type AlertSeverity = 'warning' | 'alert';

export interface DeficiencyAlert {
  severity: AlertSeverity;
  nutrient: string;
  icon: string;
  color: string;
  message: string;
  recommendation: string;
}

interface Goals {
  proteinGoal: number;
  carbsGoal: number;
  fatsGoal: number;
}

export function detectDeficiencies(
  summaries: DailyNutritionSummary[],
  goals: Goals,
): DeficiencyAlert[] {
  if (summaries.length < 3) return [];

  const alerts: DeficiencyAlert[] = [];
  const days = summaries.length;
  const halfDays = Math.ceil(days / 2); // threshold: ≥50% of days

  // All checks use per-day counts (≥50% threshold) for consistency
  const lowProteinDays = summaries.filter((d) => d.protein < goals.proteinGoal * 0.6).length;
  if (lowProteinDays >= halfDays) {
    alerts.push({
      severity: lowProteinDays >= days * 0.8 ? 'alert' : 'warning',
      nutrient: 'Protein',
      icon: 'dumbbell.fill',
      color: '#3B82F6',
      message: `Low protein intake on ${lowProteinDays} of the last ${days} days`,
      recommendation: 'Add lean meats, eggs, Greek yogurt, or legumes to your meals',
    });
  }

  const lowFiberDays = summaries.filter((d) => d.fiber < 15).length;
  if (lowFiberDays >= halfDays) {
    const avgFiber = summaries.reduce((s, d) => s + d.fiber, 0) / days;
    alerts.push({
      severity: avgFiber < 10 ? 'alert' : 'warning',
      nutrient: 'Fiber',
      icon: 'leaf.fill',
      color: '#10B981',
      message: `Low fiber intake on ${lowFiberDays} of the last ${days} days (avg ${Math.round(avgFiber)}g, target 25g+)`,
      recommendation: 'Include more vegetables, whole grains, fruits, and legumes',
    });
  }

  const highSodiumDays = summaries.filter((d) => d.sodium > 3000).length;
  if (highSodiumDays >= halfDays) {
    const avgSodium = summaries.reduce((s, d) => s + d.sodium, 0) / days;
    alerts.push({
      severity: avgSodium > 4000 ? 'alert' : 'warning',
      nutrient: 'Sodium',
      icon: 'exclamationmark.triangle.fill',
      color: '#8B5CF6',
      message: `High sodium on ${highSodiumDays} of the last ${days} days (avg ${Math.round(avgSodium)}mg, limit 2300mg)`,
      recommendation: 'Reduce processed foods, canned goods, and salty snacks',
    });
  }

  const lowFatDays = summaries.filter((d) => d.fats < 20).length;
  if (lowFatDays >= halfDays) {
    const avgFats = summaries.reduce((s, d) => s + d.fats, 0) / days;
    alerts.push({
      severity: 'warning',
      nutrient: 'Healthy Fats',
      icon: 'drop.fill',
      color: '#EF4444',
      message: `Very low fat intake on ${lowFatDays} of the last ${days} days (avg ${Math.round(avgFats)}g/day)`,
      recommendation: 'Essential fats are needed — include nuts, avocado, olive oil, or fatty fish',
    });
  }

  const highSugarDays = summaries.filter((d) => d.sugar > 50).length;
  if (highSugarDays >= halfDays) {
    const avgSugar = summaries.reduce((s, d) => s + d.sugar, 0) / days;
    alerts.push({
      severity: avgSugar > 75 ? 'alert' : 'warning',
      nutrient: 'Sugar',
      icon: 'exclamationmark.triangle.fill',
      color: '#EC4899',
      message: `High sugar intake on ${highSugarDays} of the last ${days} days (avg ${Math.round(avgSugar)}g/day)`,
      recommendation: 'Reduce sugary drinks, desserts, and processed snacks',
    });
  }

  return alerts;
}
