import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { secureStorage } from './secure-storage';
import { fsStorage } from './fs-storage';
import authReducer from './slices/auth.slice';
import mealsReducer from './slices/meals.slice';
import analysisReducer from './slices/analysis.slice';
import uiReducer from './slices/ui.slice';
import waterReducer from './slices/water.slice';
import gamificationReducer from './slices/gamification.slice';
import insightsReducer from './slices/insights.slice';

// ─── Action to reset entire app state (dispatched on logout) ─────────────────

export const RESET_APP = 'app/RESET_APP';
export const resetApp = () => ({ type: RESET_APP });

// ─── Per-slice persist configs ────────────────────────────────────────────────
//
// secureStorage → auth only (iOS Keychain / Android Keystore)
//   Sensitive fields, stays tiny, safe in Expo Go.
//
// fsStorage → all bulk data (no size limit, works in Expo Go for named experiences)
//   Splits the state across separate files — eliminates the single-blob
//   Keychain 2 MB limit that would silently corrupt as meals accumulate.
//
// insights + analysis → NOT persisted (computed / transient — always reloaded)

const authPersistConfig = {
  key: 'auth',
  storage: secureStorage,
  whitelist: ['user', 'isOnboarded', 'isAuthenticated'],
  // pendingClerkId / pendingClerkEmail intentionally excluded (transient mid-signup)
};

const mealsPersistConfig = {
  key: 'meals',
  storage: fsStorage,
  whitelist: ['meals'],
  // isLoading / error excluded — meaningless across sessions
};

const waterPersistConfig = {
  key: 'water',
  storage: fsStorage,
  whitelist: ['entries'],
};

const gamificationPersistConfig = {
  key: 'gamification',
  storage: fsStorage,
  whitelist: ['unlockedBadgeIds', 'currentStreak', 'longestStreak', 'lastCheckedDate'],
  // newBadgeId excluded — transient celebration trigger, should not replay on restart
};

const uiPersistConfig = {
  key: 'ui',
  storage: fsStorage,
  whitelist: ['lastCustomWaterMl'],
  // isOffline / activeDate excluded — always recomputed on app start
};

// ─── Combined reducer ─────────────────────────────────────────────────────────

const appReducer = combineReducers({
  auth:         persistReducer(authPersistConfig,         authReducer),
  meals:        persistReducer(mealsPersistConfig,        mealsReducer),
  water:        persistReducer(waterPersistConfig,        waterReducer),
  gamification: persistReducer(gamificationPersistConfig, gamificationReducer),
  ui:           persistReducer(uiPersistConfig,           uiReducer),
  analysis:     analysisReducer,  // not persisted — transient AI result
  insights:     insightsReducer,  // not persisted — computed from meals on demand
});

// ─── Root reducer with full-reset support ────────────────────────────────────
//
// Dispatching resetApp() (from auth.saga on logout) passes undefined as state
// to every child reducer, which triggers each one's initialState reset.
// persistStore(store) manages all per-slice persist registrations automatically
// — no outer persistReducer wrapper needed.

export default function rootReducer(
  state: ReturnType<typeof appReducer> | undefined,
  action: { type: string },
) {
  if (action.type === RESET_APP) {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
}

export type RootState = ReturnType<typeof appReducer>;
