import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

export interface UIState {
  isOffline: boolean;
  activeDate: string; // YYYY-MM-DD
}

const initialState: UIState = {
  isOffline: false,
  activeDate: dayjs().format('YYYY-MM-DD'),
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
  },
});

export const { setOffline, setActiveDate, resetActiveDate } = uiSlice.actions;
export default uiSlice.reducer;
