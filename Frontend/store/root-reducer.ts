import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { secureStorage } from './secure-storage';
import authReducer from './slices/auth.slice';
import mealsReducer from './slices/meals.slice';
import analysisReducer from './slices/analysis.slice';
import uiReducer from './slices/ui.slice';
import waterReducer from './slices/water.slice';
import gamificationReducer from './slices/gamification.slice';
import insightsReducer from './slices/insights.slice';

// Action to reset entire app state (used on logout)
export const RESET_APP = 'app/RESET_APP';
export const resetApp = () => ({ type: RESET_APP });

const appReducer = combineReducers({
  auth: authReducer,
  meals: mealsReducer,
  analysis: analysisReducer,
  ui: uiReducer,
  water: waterReducer,
  gamification: gamificationReducer,
  insights: insightsReducer,
});

// Wrap with reset: when RESET_APP fires, pass undefined to reset all slices
function rootReducerWithReset(
  state: ReturnType<typeof appReducer> | undefined,
  action: { type: string },
) {
  if (action.type === RESET_APP) {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
}

const rootPersistConfig = {
  key: 'root',
  storage: secureStorage,
  whitelist: ['auth', 'meals', 'water', 'gamification', 'ui'],
};

const persistedReducer = persistReducer(rootPersistConfig, rootReducerWithReset);

export type RootState = ReturnType<typeof appReducer>;
export default persistedReducer;
