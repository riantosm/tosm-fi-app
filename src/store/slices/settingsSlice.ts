import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { LanguageCode, ThemePreference, UserSettings } from '@/types';

export interface SettingsState extends Omit<UserSettings, 'language'> {
  /** `null` = ikuti bahasa perangkat (lihat i18n/index.ts). */
  language: LanguageCode | null;
  /** Tema (lokal, tidak disinkronkan ke backend). */
  theme: ThemePreference;
  /** Tampilan halaman Dompet (lokal). */
  walletViewMode: WalletViewMode;
  /**
   * Notifikasi saldo dompet (Android). Opsional karena state lama yang di-persist belum
   * punya key ini: baca lewat `selectWalletNotificationPrefs` (diisi default).
   */
  walletNotification?: Partial<WalletNotificationPrefs>;
}

export type WalletViewMode = 'grid' | 'list';

/** Isi notifikasi saldo: total saja, total + dompet utama, atau semua dompet (diperluas). */
export type WalletNotificationContent = 'total' | 'primary' | 'all';

export interface WalletNotificationPrefs {
  enabled: boolean;
  content: WalletNotificationContent;
  /** Nominal tampil sebagai •••• sampai user mengetuk "Tampilkan". */
  hideAmounts: boolean;
}

export const DEFAULT_WALLET_NOTIFICATION: WalletNotificationPrefs = {
  enabled: true,
  content: 'all',
  hideAmounts: false,
};

const initialState: SettingsState = {
  currency: 'IDR',
  decimalPlaces: 0,
  language: null,
  theme: 'system',
  walletViewMode: 'grid',
  walletNotification: DEFAULT_WALLET_NOTIFICATION,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<Partial<SettingsState>>) => ({
      ...state,
      ...action.payload,
    }),
    setWalletNotification: (
      state,
      action: PayloadAction<Partial<WalletNotificationPrefs>>,
    ) => {
      state.walletNotification = {
        ...state.walletNotification,
        ...action.payload,
      };
    },
  },
});

export const { setSettings, setWalletNotification } = settingsSlice.actions;

export const selectWalletNotificationPrefs = createSelector(
  [(state: { settings: SettingsState }) => state.settings.walletNotification],
  (prefs): WalletNotificationPrefs => ({
    ...DEFAULT_WALLET_NOTIFICATION,
    ...prefs,
  }),
);

export default settingsSlice.reducer;
