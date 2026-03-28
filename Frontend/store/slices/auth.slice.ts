import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_GOALS } from '@/constants/nutrition';

export interface User {
  id: string;
  clerkUserId?: string | null;
  name: string;
  email?: string;
  age?: number;
  weight?: number;
  height?: number;
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbsGoal: number;
  dailyFatsGoal: number;
  dailyWaterGoal: number;
  healthFocus?: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  user: User | null;
  pendingClerkId: string | null;
  pendingClerkEmail: string | undefined;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isOnboarded: false,
  user: null,
  pendingClerkId: null,
  pendingClerkEmail: undefined,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    completeOnboarding: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      // Merge any Clerk ID that arrived before the user object was created
      if (state.pendingClerkId) {
        state.user.clerkUserId = state.pendingClerkId;
        state.user.email = state.pendingClerkEmail ?? state.user.email;
        state.pendingClerkId = null;
        state.pendingClerkEmail = undefined;
      }
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
      // Only end the session — keep user profile and isOnboarded so returning
      // users are routed correctly to home (not setup) on their next sign-in.
      // Clerk's signOut() (called in useLogout) is what actually clears the
      // session token from SecureStore, handling security.
      state.isAuthenticated = false;
      state.pendingClerkId = null;
      state.pendingClerkEmail = undefined;
    },
    logoutRequest: () => {
      // Saga intercepts this — actual cleanup happens there
    },
    /** Restore a full user profile fetched from SQLite on sign-in.
     *  Used when Redux persist was wiped (e.g. reinstall) but the
     *  SQLite database still holds the user's profile. */
    restoreUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isOnboarded = true;
      state.pendingClerkId = null;
      state.pendingClerkEmail = undefined;
    },
    setClerkUser: (state, action: PayloadAction<{ clerkUserId: string; email?: string }>) => {
      if (state.user) {
        state.user.clerkUserId = action.payload.clerkUserId;
        if (action.payload.email) state.user.email = action.payload.email;
      } else {
        // User not created yet (mid sign-up) — park it until completeOnboarding runs
        state.pendingClerkId = action.payload.clerkUserId;
        state.pendingClerkEmail = action.payload.email;
      }
    },
  },
});

export const { completeOnboarding, updateGoals, updateProfile, logout, logoutRequest, setClerkUser, restoreUser } = authSlice.actions;
export default authSlice.reducer;

// Default user factory
export function createDefaultUser(
  name: string,
  calorieGoal: number = DEFAULT_GOALS.calories,
  proteinGoal: number = DEFAULT_GOALS.protein,
  carbsGoal: number = DEFAULT_GOALS.carbs,
  fatsGoal: number = DEFAULT_GOALS.fats,
  waterGoal: number = 2500,
): User {
  return {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    name,
    dailyCalorieGoal: calorieGoal,
    dailyProteinGoal: proteinGoal,
    dailyCarbsGoal: carbsGoal,
    dailyFatsGoal: fatsGoal,
    dailyWaterGoal: waterGoal,
  };
}
