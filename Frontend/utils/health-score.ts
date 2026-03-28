export interface HealthScoreInput {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sodium: number;
  mealCount: number;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatsGoal: number;
}

export interface HealthScoreBreakdown {
  calorieScore: number;   // max 30
  proteinScore: number;   // max 20
  macroBalance: number;   // max 20
  fiberScore: number;     // max 10
  sodiumScore: number;    // max 10
  mealScore: number;      // max 10
}

export interface HealthScoreResult {
  score: number; // 0-100
  breakdown: HealthScoreBreakdown;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  label: string;
}

export function calculateHealthScore(input: HealthScoreInput): HealthScoreResult {
  const {
    calories, protein, carbs, fats, fiber, sodium, mealCount,
    calorieGoal, proteinGoal, carbsGoal, fatsGoal,
  } = input;

  // 1. Calorie adherence (30 pts): full if within ±10% of goal
  let calorieScore = 0;
  if (calorieGoal > 0 && calories > 0) {
    const ratio = calories / calorieGoal;
    if (ratio >= 0.9 && ratio <= 1.1) {
      calorieScore = 30;
    } else {
      const deviation = Math.abs(1 - ratio);
      calorieScore = Math.max(0, 30 - deviation * 60);
    }
  }

  // 2. Protein adherence (20 pts): full if >= 80% of goal
  let proteinScore = 0;
  if (proteinGoal > 0 && protein > 0) {
    const ratio = protein / proteinGoal;
    proteinScore = Math.min(20, (ratio / 0.8) * 20);
  }

  // 3. Macro balance (20 pts): full if each macro within ±20% of target
  let macroBalance = 0;
  if (carbsGoal > 0 && fatsGoal > 0) {
    const carbsRatio = carbsGoal > 0 ? carbs / carbsGoal : 1;
    const fatsRatio = fatsGoal > 0 ? fats / fatsGoal : 1;

    const carbsDeviation = Math.abs(1 - carbsRatio);
    const fatsDeviation = Math.abs(1 - fatsRatio);

    const carbsPts = carbsDeviation <= 0.2 ? 10 : Math.max(0, 10 - carbsDeviation * 20);
    const fatsPts = fatsDeviation <= 0.2 ? 10 : Math.max(0, 10 - fatsDeviation * 20);
    macroBalance = carbsPts + fatsPts;
  }

  // 4. Fiber intake (10 pts): full if >= 25g
  const fiberScore = Math.min(10, (fiber / 25) * 10);

  // 5. Sodium moderation (10 pts): full if <= 2300mg
  let sodiumScore = 10;
  if (sodium > 2300) {
    sodiumScore = Math.max(0, 10 - ((sodium - 2300) / 1000) * 10);
  }

  // 6. Meal consistency (10 pts): full if 3+ meals logged
  const mealScore = Math.min(10, (mealCount / 3) * 10);

  const score = Math.round(
    Math.max(0, Math.min(100, calorieScore + proteinScore + macroBalance + fiberScore + sodiumScore + mealScore))
  );

  const breakdown: HealthScoreBreakdown = {
    calorieScore: Math.round(calorieScore),
    proteinScore: Math.round(proteinScore),
    macroBalance: Math.round(macroBalance),
    fiberScore: Math.round(fiberScore),
    sodiumScore: Math.round(sodiumScore),
    mealScore: Math.round(mealScore),
  };

  let grade: HealthScoreResult['grade'];
  let label: string;
  if (score >= 85) { grade = 'A'; label = 'Excellent'; }
  else if (score >= 70) { grade = 'B'; label = 'Good'; }
  else if (score >= 55) { grade = 'C'; label = 'Fair'; }
  else if (score >= 40) { grade = 'D'; label = 'Needs Work'; }
  else { grade = 'F'; label = 'Poor'; }

  return { score, breakdown, grade, label };
}
