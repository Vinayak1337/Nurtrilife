import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

export interface UIState {
  isOffline: boolean;
  activeDate: string; // YYYY-MM-DD
  lastCustomWaterMl: number | null; // last amount the user typed in the custom water input
}

const initialState: UIState = {
  isOffline: false,
  activeDate: dayjs().format('YYYY-MM-DD'),
  lastCustomWaterMl: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setOffline: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
    setActiveDate: (state, action: PayloadAction<string>) => {
      state.activeDate = action.payload;
    },
    resetActiveDate: (state) => {
      state.activeDate = dayjs().format('YYYY-MM-DD');
    },
    setLastCustomWaterMl: (state, action: PayloadAction<number>) => {
      state.lastCustomWaterMl = action.payload;
    },
  },
});

export const { setOffline, setActiveDate, resetActiveDate, setLastCustomWaterMl } = uiSlice.actions;
export default uiSlice.reducer;
