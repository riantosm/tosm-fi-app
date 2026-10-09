import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { resetOnSignOut } from '@/store/slices/resetOnSignOut';
import type { LoadStatus, Schedule } from '@/types';

export interface ScheduleState {
  schedules: Schedule[];
  status: LoadStatus;
}

const initialState: ScheduleState = { schedules: [], status: 'idle' };

/** Jadwal transaksi berulang (halaman Jadwal + pengingat lokal). */
export const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    setSchedulesLoading: state => {
      state.status = 'loading';
    },
    setSchedules: (state, action: PayloadAction<Schedule[]>) => {
      state.schedules = action.payload;
      state.status = 'loaded';
    },
    setSchedulesFailed: state => {
      state.status = 'loaded';
    },
    addSchedule: (state, action: PayloadAction<Schedule>) => {
      state.schedules.push(action.payload);
    },
    updateSchedule: (state, action: PayloadAction<Schedule>) => {
      const index = state.schedules.findIndex(
        schedule => schedule.idSchedule === action.payload.idSchedule,
      );
      if (index !== -1) {
        state.schedules[index] = action.payload;
      }
    },
    removeSchedule: (state, action: PayloadAction<string>) => {
      state.schedules = state.schedules.filter(
        schedule => schedule.idSchedule !== action.payload,
      );
    },
  },
  extraReducers: builder => resetOnSignOut(builder, initialState),
});

export const {
  setSchedulesLoading,
  setSchedules,
  setSchedulesFailed,
  addSchedule,
  updateSchedule,
  removeSchedule,
} = scheduleSlice.actions;

export default scheduleSlice.reducer;
