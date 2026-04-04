import { all, call, put, select, takeLatest } from 'redux-saga/effects';
import dayjs from 'dayjs';

import {
  refreshGamificationRequest,
  setStreaks,
  setBadges,
  badgeUnlocked,
} from '../slices/gamification.slice';
import { syncBadgeToServer } from '@/services/sync.service';
import type { RootState } from '../root-reducer';
import type { Meal } from '../slices/meals.slice';
import type { WaterEntry } from '../slices/water.slice';

// ─── Pure helpers (replace SQLite queries) ───────────────────────────────────

function getUniqueDates(items: { date: string }[]): string[] {
  return [...new Set(items.map((i) => i.date))].sort();
}

function computeConsecutiveLogDays(meals: Meal[]): number {
  const dates = getUniqueDates(meals).reverse();
  if (!dates.length) return 0;
  const today = dayjs().format('YYYY-MM-DD');
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  if (dates[0] !== today && dates[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = dayjs(dates[i - 1]).diff(dayjs(dates[i]), 'day');
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function computeLongestStreak(meals: Meal[]): number {
  const dates = getUniqueDates(meals);
  if (!dates.length) return 0;
  let longest = 1, current = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = dayjs(dates[i]).diff(dayjs(dates[i - 1]), 'day');
    if (diff === 1) { current++; if (current > longest) longest = current; }
    else current = 1;
  }
  return longest;
}

function computeWaterStreak(entries: WaterEntry[]): number {
  const dates = getUniqueDates(entries).reverse();
  if (!dates.length) return 0;
  const today = dayjs().format('YYYY-MM-DD');
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  if (dates[0] !== today && dates[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = dayjs(dates[i - 1]).diff(dayjs(dates[i]), 'day');
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

// ─── Saga ─────────────────────────────────────────────────────────────────────

function* refreshGamificationSaga() {
  try {
    const state: RootState = yield select();
    const meals = state.meals.meals;
    const water = state.water.entries;
    const user = state.auth.user;
    const existingBadges = state.gamification.unlockedBadgeIds;

    // Streaks
    const currentStreak = computeConsecutiveLogDays(meals);
    const longestStreak = computeLongestStreak(meals);
    yield put(setStreaks({ current: currentStreak, longest: longestStreak }));
    yield put(setBadges(existingBadges));

    // Stats
    const totalMeals = meals.length;
    const uniqueFoods = new Set(meals.map((m) => m.foodName.toLowerCase())).size;
    const waterStreak = computeWaterStreak(water);

    // Badge: First Bite
    if (totalMeals >= 1 && !existingBadges.includes('first_bite')) {
      yield put(badgeUnlocked('first_bite'));
      yield call(syncBadgeToServer, 'first_bite');
    }

    // Badge: Week Warrior
    if (currentStreak >= 7 && !existingBadges.includes('week_warrior')) {
      yield put(badgeUnlocked('week_warrior'));
      yield call(syncBadgeToServer, 'week_warrior');
    }

    // Badge: Centurion
    if (totalMeals >= 100 && !existingBadges.includes('centurion')) {
      yield put(badgeUnlocked('centurion'));
      yield call(syncBadgeToServer, 'centurion');
    }

    // Badge: AI Explorer
    if (uniqueFoods >= 10 && !existingBadges.includes('ai_explorer')) {
      yield put(badgeUnlocked('ai_explorer'));
      yield call(syncBadgeToServer, 'ai_explorer');
    }

    // Badge: Hydration Hero
    if (waterStreak >= 5 && !existingBadges.includes('hydration_hero')) {
      yield put(badgeUnlocked('hydration_hero'));
      yield call(syncBadgeToServer, 'hydration_hero');
    }

    // Badge: Macro Master — check today's macros
    if (user) {
      const today = dayjs().format('YYYY-MM-DD');
      const todayMeals = meals.filter((m) => m.date === today);
      if (todayMeals.length > 0) {
        const totals = todayMeals.reduce(
          (acc, m) => ({
            protein: acc.protein + m.protein,
            carbs: acc.carbs + m.carbs,
            fats: acc.fats + m.fats,
          }),
          { protein: 0, carbs: 0, fats: 0 },
        );
        const hit =
          totals.protein >= user.dailyProteinGoal * 0.9 &&
          totals.carbs >= user.dailyCarbsGoal * 0.9 &&
          totals.fats >= user.dailyFatsGoal * 0.9;
        if (hit && !existingBadges.includes('macro_master')) {
          yield put(badgeUnlocked('macro_master'));
          yield call(syncBadgeToServer, 'macro_master');
        }
      }
    }
  } catch (error) {
    console.warn('Gamification refresh failed:', error);
  }
}

// ─── Watchers ─────────────────────────────────────────────────────────────────

function* watchRefreshGamification() {
  yield takeLatest(refreshGamificationRequest.type, refreshGamificationSaga);
}

// ─── Domain saga ──────────────────────────────────────────────────────────────

export default function* gamificationSaga() {
  yield all([
    call(watchRefreshGamification),
  ]);
}
