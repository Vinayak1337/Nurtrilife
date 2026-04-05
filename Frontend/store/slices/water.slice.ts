import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Moved here from database.service.ts
export interface WaterEntry {
  id: string;
  amount: number;
  date: string;      // YYYY-MM-DD
  createdAt: string; // ISO string
}

export interface WaterState {
  entries: WaterEntry[]; // ALL entries, newest first — source of truth
  isLoading: boolean;
  error: string | null;
}

const initialState: WaterState = {
  entries: [],
  isLoading: false,
  error: null,
};

const waterSlice = createSlice({
  name: 'water',
  initialState,
  reducers: {
    addWaterRequest: (state, _action: PayloadAction<number>) => {
      state.isLoading = true;
      state.error = null;
    },
    addWaterSuccess: (state, action: PayloadAction<WaterEntry>) => {
      state.entries.unshift(action.payload);
      state.isLoading = false;
      state.error = null;
    },
    addWaterFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Full replace from server (sign-in restore) — server is source of truth.
    setEntries: (state, action: PayloadAction<WaterEntry[]>) => {
      state.entries = action.payload
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    // Replace entries for a single date, keep all other dates intact.
    replaceEntriesForDate: (state, action: PayloadAction<{ date: string; entries: WaterEntry[] }>) => {
      const { date, entries } = action.payload;
      const otherDays = state.entries.filter((e) => e.date !== date);
      state.entries = [...otherDays, ...entries].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    },

    clearEntries: (state) => {
      state.entries = [];
    },
  },
});

export const {
  addWaterRequest,
  addWaterSuccess,
  addWaterFailure,
  setEntries,
  replaceEntriesForDate,
  clearEntries,
} = waterSlice.actions;

export default waterSlice.reducer;
