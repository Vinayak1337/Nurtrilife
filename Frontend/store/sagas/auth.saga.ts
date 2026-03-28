import { call, put, select, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { router } from 'expo-router';

import { logoutRequest, logout, completeOnboarding, updateGoals, updateProfile, User } from '../slices/auth.slice';
import { clearAnalysis } from '../slices/analysis.slice';
import { clearMeals } from '../slices/meals.slice';
import { clearEntries } from '../slices/water.slice';
import { cancelAllReminders } from '@/services/notifications.service';
import { syncUserToServer } from '@/services/sync.service';
import type { RootState } from '@/store';

function* logoutSaga() {
  try {
    yield cancelAllReminders();
    yield put(logout());
    yield put(clearAnalysis());
    yield put(clearMeals());
    yield put(clearEntries());
    router.replace('/(auth)/welcome');
  } catch (error) {
    console.warn('Logout error:', error);
    yield put(logout());
    router.replace('/(auth)/welcome');
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

export default function* authSaga() {
  yield takeLatest(logoutRequest.type, logoutSaga);
  yield takeLatest(completeOnboarding.type, saveUserOnOnboardingSaga);
  yield takeLatest(updateGoals.type, syncUserProfileSaga);
  yield takeLatest(updateProfile.type, syncUserProfileSaga);
}
