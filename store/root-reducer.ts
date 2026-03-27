import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { fsStorage } from './fs-storage';
import authReducer from './slices/auth.slice';
import mealsReducer from './slices/meals.slice';
import analysisReducer from './slices/analysis.slice';
import uiReducer from './slices/ui.slice';

const authPersistConfig = {
  key: 'auth',
  storage: fsStorage,
  whitelist: ['isAuthenticated', 'isOnboarded', 'user'],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  meals: mealsReducer,
  analysis: analysisReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
