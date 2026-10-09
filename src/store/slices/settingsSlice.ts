import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LanguageCode, ThemePreference, UserSettings } from '@/types';

export interface SettingsState extends Omit<UserSettings, 'language'> {
  /** `null` = ikuti bahasa perangkat (lihat i18n/index.ts). */
  language: LanguageCode | null;
  /** Tema (lokal, tidak disinkronkan ke backend). */
  theme: ThemePreference;
  /** Tampilan halaman Dompet (lokal). */
  walletViewMode: WalletViewMode;
}

export type WalletViewMode = 'grid' | 'list';

const initialState: SettingsState = {
  currency: 'IDR',
  decimalPlaces: 0,
  language: null,
  theme: 'system',
  walletViewMode: 'grid',
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
