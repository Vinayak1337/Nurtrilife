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
	calorieScore: number; // max 30
	proteinScore: number; // max 20
	macroBalance: number; // max 20
	fiberScore: number; // max 10
	sodiumScore: number; // max 10
	mealScore: number; // max 10
}

export interface HealthScoreResult {
	score: number; // 0-100
	breakdown: HealthScoreBreakdown;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	label: string;
}

function calculateCalorieScore(calories: number, calorieGoal: number): number {
	if (calorieGoal <= 0 || calories <= 0) return 0;

	const ratio = calories / calorieGoal;
	if (ratio >= 0.9 && ratio <= 1.1) return 30;

	const deviation = Math.abs(1 - ratio);
	return Math.max(0, 30 - deviation * 60);
}

function calculateProteinScore(protein: number, proteinGoal: number): number {
	if (proteinGoal <= 0 || protein <= 0) return 0;

	const ratio = protein / proteinGoal;
	return Math.min(20, (ratio / 0.8) * 20);
}

function calculateMacroBalance(
	carbs: number,
	fats: number,
	carbsGoal: number,
	fatsGoal: number
): number {
	if (carbsGoal <= 0 || fatsGoal <= 0) return 0;

	const carbsRatio = carbs / carbsGoal;
	const fatsRatio = fats / fatsGoal;

	const carbsDeviation = Math.abs(1 - carbsRatio);
	const fatsDeviation = Math.abs(1 - fatsRatio);

	const carbsPts =
		carbsDeviation <= 0.2 ? 10 : Math.max(0, 10 - carbsDeviation * 20);
	const fatsPts =
		fatsDeviation <= 0.2 ? 10 : Math.max(0, 10 - fatsDeviation * 20);

	return carbsPts + fatsPts;
}

function calculateFiberScore(fiber: number): number {
	return Math.min(10, (fiber / 25) * 10);
}

function calculateSodiumScore(sodium: number): number {
	if (sodium <= 2300) return 10;
	return Math.max(0, 10 - ((sodium - 2300) / 1000) * 10);
}

function calculateMealScore(mealCount: number): number {
	return Math.min(10, (mealCount / 3) * 10);
}

function getGradeAndLabel(
	score: number
): Pick<HealthScoreResult, 'grade' | 'label'> {
	if (score >= 85) return { grade: 'A', label: 'Excellent' };
	if (score >= 70) return { grade: 'B', label: 'Good' };
	if (score >= 55) return { grade: 'C', label: 'Fair' };
	if (score >= 40) return { grade: 'D', label: 'Needs Work' };
	return { grade: 'F', label: 'Poor' };
}

export function calculateHealthScore(
	input: HealthScoreInput
): HealthScoreResult {
	const {
		calories,
		protein,
		carbs,
		fats,
		fiber,
		sodium,
		mealCount,
		calorieGoal,
		proteinGoal,
		carbsGoal,
		fatsGoal
	} = input;

	const calorieScore = calculateCalorieScore(calories, calorieGoal);
	const proteinScore = calculateProteinScore(protein, proteinGoal);
	const macroBalance = calculateMacroBalance(carbs, fats, carbsGoal, fatsGoal);
	const fiberScore = calculateFiberScore(fiber);
	const sodiumScore = calculateSodiumScore(sodium);
	const mealScore = calculateMealScore(mealCount);

	const total =
		calorieScore +
		proteinScore +
		macroBalance +
		fiberScore +
		sodiumScore +
		mealScore;
	const score = Math.round(Math.max(0, Math.min(100, total)));

	const breakdown: HealthScoreBreakdown = {
		calorieScore: Math.round(calorieScore),
		proteinScore: Math.round(proteinScore),
		macroBalance: Math.round(macroBalance),
		fiberScore: Math.round(fiberScore),
		sodiumScore: Math.round(sodiumScore),
		mealScore: Math.round(mealScore)
	};

	const { grade, label } = getGradeAndLabel(score);

	return { score, breakdown, grade, label };
}
