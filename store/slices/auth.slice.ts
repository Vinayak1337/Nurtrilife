import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_GOALS } from '@/constants/nutrition';

export interface User {
  id: string;
  name: string;
  age?: number;
  weight?: number;
  height?: number;
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbsGoal: number;
  dailyFatsGoal: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  user: User | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isOnboarded: false,
  user: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    completeOnboarding: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isOnboarded = true;
    },
    updateGoals: (state, action: PayloadAction<Partial<Pick<User, 'dailyCalorieGoal' | 'dailyProteinGoal' | 'dailyCarbsGoal' | 'dailyFatsGoal'>>>) => {
      if (state.user) {
        Object.assign(state.user, action.payload);
      }
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        Object.assign(state.user, action.payload);
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.isOnboarded = false;
      state.user = null;
    },
  },
});

export const { completeOnboarding, updateGoals, updateProfile, logout } = authSlice.actions;
export default authSlice.reducer;

// Default user factory
export function createDefaultUser(name: string, calorieGoal: number = DEFAULT_GOALS.calories, proteinGoal: number = DEFAULT_GOALS.protein, carbsGoal: number = DEFAULT_GOALS.carbs, fatsGoal: number = DEFAULT_GOALS.fats): User {
  return {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    name,
    dailyCalorieGoal: calorieGoal,
    dailyProteinGoal: proteinGoal,
    dailyCarbsGoal: carbsGoal,
    dailyFatsGoal: fatsGoal,
  };
}
