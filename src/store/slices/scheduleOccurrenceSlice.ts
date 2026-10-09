import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { resetOnSignOut } from '@/store/slices/resetOnSignOut';
import type { LoadStatus, ScheduleOccurrence } from '@/types';

export interface ScheduleOccurrenceState {
  occurrences: ScheduleOccurrence[];
  status: LoadStatus;
}

const initialState: ScheduleOccurrenceState = {
  occurrences: [],
  status: 'idle',
};

/** Tagihan jadwal yang menunggu dibayar (Dashboard, Transaksi, Jadwal). */
export const scheduleOccurrenceSlice = createSlice({
  name: 'scheduleOccurrence',
  initialState,
  reducers: {
    setOccurrencesLoading: state => {
      state.status = 'loading';
    },
    setOccurrences: (state, action: PayloadAction<ScheduleOccurrence[]>) => {
      state.occurrences = action.payload;
      state.status = 'loaded';
    },
    setOccurrencesFailed: state => {
      state.status = 'loaded';
    },
  },
  extraReducers: builder => resetOnSignOut(builder, initialState),
});

export const { setOccurrencesLoading, setOccurrences, setOccurrencesFailed } =
  scheduleOccurrenceSlice.actions;

export default scheduleOccurrenceSlice.reducer;
