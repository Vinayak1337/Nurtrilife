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
  meals: Meal[];     // ALL meals, newest first — source of truth
  isLoading: boolean;
  error: string | null;
}

const initialState: MealsState = {
  meals: [],
  isLoading: false,
  error: null,
};

export const mealsSlice = createSlice({
  name: 'meals',
  initialState,
  reducers: {
    // Add a single new meal (after camera save)
    saveMealRequest: (state, _action: PayloadAction<Omit<Meal, 'id' | 'createdAt'>>) => {
      state.isLoading = true;
      state.error = null;
    },
    saveMealSuccess: (state, action: PayloadAction<Meal>) => {
      state.meals.unshift(action.payload);
      state.isLoading = false;
    },
    saveMealFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Delete a meal
    deleteMealRequest: (state, _action: PayloadAction<string>) => {
      state.isLoading = true;
    },
    deleteMealSuccess: (state, action: PayloadAction<string>) => {
      state.meals = state.meals.filter((m) => m.id !== action.payload);
      state.isLoading = false;
    },
    deleteMealFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Bulk-merge meals from server (sign-in restore)
    setMeals: (state, action: PayloadAction<Meal[]>) => {
      const localIds = new Set(state.meals.map((m) => m.id));
      const incoming = action.payload.filter((m) => !localIds.has(m.id));
      state.meals = [...state.meals, ...incoming].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    },

    clearMeals: (state) => {
      state.meals = [];
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  saveMealRequest,
  saveMealSuccess,
  saveMealFailure,
  deleteMealRequest,
  deleteMealSuccess,
  deleteMealFailure,
  setMeals,
  clearMeals,
  clearError,
} = mealsSlice.actions;

export default mealsSlice.reducer;
