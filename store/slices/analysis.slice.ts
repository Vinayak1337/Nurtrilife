import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MealType } from '@/constants/nutrition';

export interface NutritionData {
  foodName: string;
  description: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  ingredients: string[];
  mealType: MealType;
  confidence: 'high' | 'medium' | 'low';
}

export interface AnalysisState {
  capturedImageUri: string | null;
  analysisResult: NutritionData | null;
  isAnalyzing: boolean;
  error: string | null;
}

const initialState: AnalysisState = {
  capturedImageUri: null,
  analysisResult: null,
  isAnalyzing: false,
  error: null,
};

export const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setCapturedImage: (state, action: PayloadAction<string>) => {
      state.capturedImageUri = action.payload;
      state.analysisResult = null;
      state.error = null;
    },
    analyzeImageRequest: (state, _action: PayloadAction<string>) => {
      state.isAnalyzing = true;
      state.error = null;
    },
    analyzeImageSuccess: (state, action: PayloadAction<NutritionData>) => {
      state.analysisResult = action.payload;
      state.isAnalyzing = false;
      state.error = null;
    },
    analyzeImageFailure: (state, action: PayloadAction<string>) => {
      state.isAnalyzing = false;
      state.error = action.payload;
    },
    clearAnalysis: (state) => {
      state.capturedImageUri = null;
      state.analysisResult = null;
      state.isAnalyzing = false;
      state.error = null;
    },
    retryAnalysis: (state) => {
      state.isAnalyzing = false;
      state.error = null;
    },
  },
});

export const {
  setCapturedImage,
  analyzeImageRequest,
  analyzeImageSuccess,
  analyzeImageFailure,
  clearAnalysis,
  retryAnalysis,
} = analysisSlice.actions;

export default analysisSlice.reducer;
