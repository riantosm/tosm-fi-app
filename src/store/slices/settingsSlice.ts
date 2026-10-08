import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LanguageCode, UserSettings } from '@/types';

export interface SettingsState extends Omit<UserSettings, 'language'> {
  /** `null` = ikuti bahasa perangkat (lihat i18n/index.ts). */
  language: LanguageCode | null;
}

const initialState: SettingsState = {
  currency: 'IDR',
  decimalPlaces: 0,
  language: null,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<Partial<SettingsState>>) => ({
      ...state,
      ...action.payload,
    }),
  },
});

export const { setSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
