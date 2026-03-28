import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GamificationState {
  currentStreak: number;
  longestStreak: number;
  unlockedBadgeIds: string[];
  lastCheckedDate: string | null;
  newBadgeId: string | null; // triggers celebration overlay
}

const initialState: GamificationState = {
  currentStreak: 0,
  longestStreak: 0,
  unlockedBadgeIds: [],
  lastCheckedDate: null,
  newBadgeId: null,
};

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    refreshGamificationRequest: () => {},
    setStreaks: (state, action: PayloadAction<{ current: number; longest: number }>) => {
      state.currentStreak = action.payload.current;
      state.longestStreak = action.payload.longest;
      state.lastCheckedDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
    },
    setBadges: (state, action: PayloadAction<string[]>) => {
      state.unlockedBadgeIds = action.payload;
    },
    badgeUnlocked: (state, action: PayloadAction<string>) => {
      if (!state.unlockedBadgeIds.includes(action.payload)) {
        state.unlockedBadgeIds.push(action.payload);
      }
      state.newBadgeId = action.payload;
    },
    clearNewBadge: (state) => {
      state.newBadgeId = null;
    },
  },
});

export const {
  refreshGamificationRequest,
  setStreaks,
  setBadges,
  badgeUnlocked,
  clearNewBadge,
} = gamificationSlice.actions;
export default gamificationSlice.reducer;
