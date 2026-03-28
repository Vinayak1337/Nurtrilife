import { put, select, takeLatest } from 'redux-saga/effects';
import dayjs from 'dayjs';

import {
  fetchInsightsRequest,
  fetchInsightsSuccess,
  fetchInsightsFailure,
  DailyNutritionSummary,
} from '../slices/insights.slice';
import type { RootState } from '../root-reducer';
import type { Meal } from '../slices/meals.slice';
import { calculateHealthScore } from '@/utils/health-score';
import { detectDeficiencies, DeficiencyAlert } from '@/utils/deficiency-detector';

// ─── Pure helper (replaces SQLite getDailyNutritionSummaries) ─────────────────

function computeDailyNutritionSummaries(
  meals: Meal[],
  startDate: string,
  endDate: string,
): DailyNutritionSummary[] {
  const filtered = meals.filter((m) => m.date >= startDate && m.date <= endDate);
  const byDate = new Map<string, DailyNutritionSummary>();

  for (const meal of filtered) {
    const existing = byDate.get(meal.date) ?? {
      date: meal.date,
      calories: 0, protein: 0, carbs: 0, fats: 0,
      fiber: 0, sugar: 0, sodium: 0, mealCount: 0,
    };
    byDate.set(meal.date, {
      date: meal.date,
      calories: existing.calories + meal.calories,
      protein: existing.protein + meal.protein,
      carbs: existing.carbs + meal.carbs,
      fats: existing.fats + meal.fats,
      fiber: existing.fiber + meal.fiber,
      sugar: existing.sugar + meal.sugar,
      sodium: existing.sodium + meal.sodium,
      mealCount: existing.mealCount + 1,
    });
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

// ─── Saga ─────────────────────────────────────────────────────────────────────

function* fetchInsightsSaga() {
  try {
    const state: RootState = yield select();
    const user = state.auth.user;
    if (!user) {
      yield put(fetchInsightsFailure());
      return;
    }

    const today = dayjs();
    const weekStart = today.subtract(6, 'day').format('YYYY-MM-DD');
    const todayStr = today.format('YYYY-MM-DD');

    const weeklyData = computeDailyNutritionSummaries(state.meals.meals, weekStart, todayStr);
    const todayData = weeklyData.find((d) => d.date === todayStr);
    const todayMeals = state.meals.meals.filter((m) => m.date === todayStr);

    const healthScore = calculateHealthScore({
      calories: todayData?.calories ?? 0,
      protein: todayData?.protein ?? 0,
      carbs: todayData?.carbs ?? 0,
      fats: todayData?.fats ?? 0,
      fiber: todayData?.fiber ?? 0,
      sodium: todayData?.sodium ?? 0,
      mealCount: todayMeals.length,
      calorieGoal: user.dailyCalorieGoal,
      proteinGoal: user.dailyProteinGoal,
      carbsGoal: user.dailyCarbsGoal,
      fatsGoal: user.dailyFatsGoal,
    });

    const deficiencyAlerts: DeficiencyAlert[] = detectDeficiencies(weeklyData, {
      proteinGoal: user.dailyProteinGoal,
      carbsGoal: user.dailyCarbsGoal,
      fatsGoal: user.dailyFatsGoal,
    });

    yield put(fetchInsightsSuccess({ weeklyData, healthScore, deficiencyAlerts }));
  } catch (error) {
    yield put(fetchInsightsFailure(error instanceof Error ? error.message : 'Failed to load insights'));
  }
}

export default function* insightsSaga() {
  yield takeLatest(fetchInsightsRequest.type, fetchInsightsSaga);
}
