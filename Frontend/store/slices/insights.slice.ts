import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DeficiencyAlert } from '@/utils/deficiency-detector';
import { HealthScoreResult } from '@/utils/health-score';

// Moved here from database.service.ts
export interface DailyNutritionSummary {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  mealCount: number;
}

export interface InsightsState {
  weeklyData: DailyNutritionSummary[];
  healthScore: HealthScoreResult | null;
  deficiencyAlerts: DeficiencyAlert[];
  isLoading: boolean;
  error: string | null;
}

const initialState: InsightsState = {
  weeklyData: [],
  healthScore: null,
  deficiencyAlerts: [],
  isLoading: false,
  error: null,
};

const insightsSlice = createSlice({
  name: 'insights',
  initialState,
  reducers: {
    fetchInsightsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchInsightsSuccess: (
      state,
      action: PayloadAction<{
        weeklyData: DailyNutritionSummary[];
        healthScore: HealthScoreResult;
        deficiencyAlerts: DeficiencyAlert[];
      }>,
    ) => {
      state.weeklyData = action.payload.weeklyData;
      state.healthScore = action.payload.healthScore;
      state.deficiencyAlerts = action.payload.deficiencyAlerts;
      state.isLoading = false;
      state.error = null;
    },
    fetchInsightsFailure: (state, action: PayloadAction<string | undefined>) => {
      state.isLoading = false;
      state.error = action.payload ?? 'Failed to load insights';
    },
  },
});

export const { fetchInsightsRequest, fetchInsightsSuccess, fetchInsightsFailure } =
  insightsSlice.actions;
export default insightsSlice.reducer;
