import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MealType } from '@/constants/nutrition';

export interface Meal {
  id: string;
  photoUri: string;
  foodName: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  ingredients: string[];
  mealType: MealType;
  date: string;      // YYYY-MM-DD
  createdAt: string; // ISO string
}

export interface MealsState {
  todayMeals: Meal[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MealsState = {
  todayMeals: [],
  isLoading: false,
  error: null,
};

export const mealsSlice = createSlice({
  name: 'meals',
  initialState,
  reducers: {
    fetchMealsRequest: (state, _action: PayloadAction<string | undefined>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchMealsSuccess: (state, action: PayloadAction<Meal[]>) => {
      state.todayMeals = action.payload;
      state.isLoading = false;
    },
    fetchMealsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    saveMealRequest: (state, _action: PayloadAction<Omit<Meal, 'id' | 'createdAt'>>) => {
      state.isLoading = true;
      state.error = null;
    },
    saveMealSuccess: (state, action: PayloadAction<Meal>) => {
      state.todayMeals.unshift(action.payload);
      state.isLoading = false;
    },
    saveMealFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    deleteMealRequest: (state, _action: PayloadAction<string>) => {
      state.isLoading = true;
    },
    deleteMealSuccess: (state, action: PayloadAction<string>) => {
      state.todayMeals = state.todayMeals.filter(m => m.id !== action.payload);
      state.isLoading = false;
    },
    deleteMealFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchMealsRequest,
  fetchMealsSuccess,
  fetchMealsFailure,
  saveMealRequest,
  saveMealSuccess,
  saveMealFailure,
  deleteMealRequest,
  deleteMealSuccess,
  deleteMealFailure,
  clearError,
} = mealsSlice.actions;

export default mealsSlice.reducer;
