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

    // Bulk-merge entries from server (sign-in restore)
    setEntries: (state, action: PayloadAction<WaterEntry[]>) => {
      const localIds = new Set(state.entries.map((e) => e.id));
      const incoming = action.payload.filter((e) => !localIds.has(e.id));
      state.entries = [...state.entries, ...incoming].sort(
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
  clearEntries,
} = waterSlice.actions;

export default waterSlice.reducer;
