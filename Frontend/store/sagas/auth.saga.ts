import { all, call, put, select, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { router } from 'expo-router';
import dayjs from 'dayjs';

import { logoutRequest, logout, completeOnboarding, updateGoals, updateProfile, syncTodayRequest, User } from '../slices/auth.slice';
import { replaceMealsForDate } from '../slices/meals.slice';
import { replaceEntriesForDate } from '../slices/water.slice';
import { refreshGamificationRequest } from '../slices/gamification.slice';
import { cancelAllReminders } from '@/services/notifications.service';
import { syncUserToServer, fetchMealsFromServer, fetchWaterFromServer } from '@/services/sync.service';
import { resetApp } from '../root-reducer';
import type { RootState } from '@/store';
import type { Meal } from '../slices/meals.slice';
import type { WaterEntry } from '../slices/water.slice';

function* logoutSaga() {
  try {
    yield cancelAllReminders();
    yield put(logout());
    yield put(resetApp()); // resets all slices at once
    router.replace('/(auth)/welcome');
  } catch (error) {
    console.warn('Logout error:', error);
    yield put(logout());
    yield put(resetApp());
    router.replace('/(auth)/welcome');
  }
}

function* syncTodaySaga(): Generator {
  try {
    const today = dayjs().format('YYYY-MM-DD');
    const [serverMeals, serverWater] = (yield call(
      () => Promise.all([fetchMealsFromServer(today), fetchWaterFromServer(today)]),
    )) as [Meal[], WaterEntry[]];
    // Always replace today's data — reflects cross-device deletions.
    // fetchMeals/fetchWater now throw on HTTP errors so the catch below
    // protects local state if the server is unreachable.
    yield put(replaceMealsForDate({ date: today, meals: serverMeals }));
    yield put(replaceEntriesForDate({ date: today, entries: serverWater }));
    yield put(refreshGamificationRequest());
  } catch {
    // Non-fatal — network error; local state remains unchanged.
  }
}

function* saveUserOnOnboardingSaga(action: PayloadAction<User>) {
  try {
    const stored: User | null = yield select((s: RootState) => s.auth.user);
    yield call(syncUserToServer, stored ?? action.payload);
  } catch (err) {
    console.warn('Failed to sync user on onboarding:', err);
  }
}

function* syncUserProfileSaga() {
  try {
    const user: User | null = yield select((s: RootState) => s.auth.user);
    if (user?.id) {
      yield call(syncUserToServer, user);
    }
  } catch (err) {
    console.warn('Failed to sync user profile:', err);
  }
}

// ─── Watchers ─────────────────────────────────────────────────────────────────

function* watchLogout() {
  yield takeLatest(logoutRequest.type, logoutSaga);
}

function* watchCompleteOnboarding() {
  yield takeLatest(completeOnboarding.type, saveUserOnOnboardingSaga);
}

function* watchUpdateGoals() {
  yield takeLatest(updateGoals.type, syncUserProfileSaga);
}

function* watchUpdateProfile() {
  yield takeLatest(updateProfile.type, syncUserProfileSaga);
}

function* watchSyncToday() {
  yield takeLatest(syncTodayRequest.type, syncTodaySaga);
}

// ─── Domain saga ──────────────────────────────────────────────────────────────

export default function* authSaga() {
  yield all([
    call(watchLogout),
    call(watchCompleteOnboarding),
    call(watchUpdateGoals),
    call(watchUpdateProfile),
    call(watchSyncToday),
  ]);
}
