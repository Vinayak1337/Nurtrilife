import { call, put, select, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import * as FileSystem from 'expo-file-system/legacy';
import { router } from 'expo-router';
import dayjs from 'dayjs';

import {
  analyzeImageRequest,
  analyzeImageSuccess,
  analyzeImageFailure,
  NutritionData,
} from '../slices/analysis.slice';
import {
  saveMealRequest,
  saveMealSuccess,
  saveMealFailure,
  deleteMealRequest,
  deleteMealSuccess,
  deleteMealFailure,
  Meal,
} from '../slices/meals.slice';
import { analyzeFood } from '@/services/claude.service';
import { syncMealToServer, deleteMealFromServer } from '@/services/sync.service';
import { refreshGamificationRequest } from '../slices/gamification.slice';
import { fetchInsightsRequest } from '../slices/insights.slice';
import type { RootState } from '@/store';
import { race } from 'redux-saga/effects';

function generateId(): string {
  return `meal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const ANALYSIS_TIMEOUT_MS = 45_000;

async function ensureMealsDir(): Promise<void> {
  const dir = `${FileSystem.documentDirectory}meals/`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

function* analyzeImageSaga(action: PayloadAction<string>): Generator {
  try {
    const imageUri = action.payload;
    const userId = (yield select((s: RootState) => s.auth.user?.id ?? 'anonymous')) as string;

    const { result, timeout } = (yield race({
      result: call(analyzeFood, imageUri, userId),
      timeout: call(() => new Promise((resolve) => setTimeout(resolve, ANALYSIS_TIMEOUT_MS))),
    })) as { result?: NutritionData; timeout?: true };

    if (timeout) {
      yield put(analyzeImageFailure('Analysis timed out — please try again.'));
    } else {
      yield put(analyzeImageSuccess(result!));
    }
    router.push('/(app)/analysis');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to analyze image';
    yield put(analyzeImageFailure(message));
    router.push('/(app)/analysis');
  }
}

function* saveMealSaga(action: PayloadAction<Omit<Meal, 'id' | 'createdAt'>>): Generator {
  try {
    const id = generateId();
    const now = new Date().toISOString();

    // Try to copy photo to permanent local storage.
    // Falls back to the original URI when running in Expo Go (@anonymous
    // sandbox restriction prevents writes to ExponentExperienceData).
    let photoUri = action.payload.photoUri;
    try {
      yield call(ensureMealsDir);
      const permanentUri = `${FileSystem.documentDirectory}meals/${id}.jpg`;
      yield call([FileSystem, FileSystem.copyAsync], {
        from: action.payload.photoUri,
        to: permanentUri,
      });
      photoUri = permanentUri;
    } catch {
      // Expo Go — keep original URI, works fine for development
    }

    const meal: Meal = {
      ...action.payload,
      id,
      photoUri,
      createdAt: now,
    };

    yield put(saveMealSuccess(meal));

    // Fire-and-forget server sync
    yield call(syncMealToServer, meal);

    yield put(refreshGamificationRequest());
    router.replace('/(app)/(tabs)/home');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save meal';
    yield put(saveMealFailure(message));
  }
}

function* deleteMealSaga(action: PayloadAction<string>): Generator {
  try {
    yield put(deleteMealSuccess(action.payload));

    // Fire-and-forget server sync
    yield call(deleteMealFromServer, action.payload);

    // Recompute insights + streaks now that a meal is gone
    yield put(fetchInsightsRequest());
    yield put(refreshGamificationRequest());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete meal';
    yield put(deleteMealFailure(message));
  }
}

export default function* mealsSaga() {
  yield takeLatest(analyzeImageRequest.type, analyzeImageSaga);
  yield takeLatest(saveMealRequest.type, saveMealSaga);
  yield takeLatest(deleteMealRequest.type, deleteMealSaga);
}
