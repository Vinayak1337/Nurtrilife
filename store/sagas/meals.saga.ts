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
  fetchMealsRequest,
  fetchMealsSuccess,
  fetchMealsFailure,
  deleteMealRequest,
  deleteMealSuccess,
  deleteMealFailure,
  Meal,
} from '../slices/meals.slice';
import { analyzeFood } from '@/services/claude.service';
import {
  insertMeal,
  getMealsByDate,
  deleteMeal as dbDeleteMeal,
  ensureMealsDirectory,
} from '@/services/database.service';
import type { RootState } from '@/store';

function generateId(): string {
  return `meal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function* analyzeImageSaga(action: PayloadAction<string>): Generator {
  try {
    const imageUri = action.payload;
    // Read userId from Redux auth state (API requires it for MongoDB persistence)
    const userId = (yield select((state: RootState) => state.auth.user?.id ?? 'anonymous')) as string;
    const result = (yield call(analyzeFood, imageUri, userId)) as NutritionData;
    yield put(analyzeImageSuccess(result));
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

    // Copy photo to permanent storage
    yield call(ensureMealsDirectory);
    const permanentUri = `${FileSystem.documentDirectory}meals/${id}.jpg`;
    yield call([FileSystem, FileSystem.copyAsync], {
      from: action.payload.photoUri,
      to: permanentUri,
    });

    const meal: Meal = {
      ...action.payload,
      id,
      photoUri: permanentUri,
      createdAt: now,
    };

    yield call(insertMeal, meal);
    yield put(saveMealSuccess(meal));

    // Refresh today's meals
    const today = dayjs().format('YYYY-MM-DD');
    yield put(fetchMealsRequest(today));

    router.replace('/(app)/(tabs)/home');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save meal';
    yield put(saveMealFailure(message));
  }
}

function* fetchMealsSaga(action: PayloadAction<string | undefined>): Generator {
  try {
    const date = action.payload ?? dayjs().format('YYYY-MM-DD');
    const meals = (yield call(getMealsByDate, date)) as Meal[];
    yield put(fetchMealsSuccess(meals));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch meals';
    yield put(fetchMealsFailure(message));
  }
}

function* deleteMealSaga(action: PayloadAction<string>): Generator {
  try {
    yield call(dbDeleteMeal, action.payload);
    yield put(deleteMealSuccess(action.payload));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete meal';
    yield put(deleteMealFailure(message));
  }
}

export default function* mealsSaga() {
  yield takeLatest(analyzeImageRequest.type, analyzeImageSaga);
  yield takeLatest(saveMealRequest.type, saveMealSaga);
  yield takeLatest(fetchMealsRequest.type, fetchMealsSaga);
  yield takeLatest(deleteMealRequest.type, deleteMealSaga);
}
