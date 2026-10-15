import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { onLogin, onLogout, onSessionExpired } from '@/store/slices/authSlice';

/** PIN salah berturut-turut sebanyak ini → logout. */
export const MAX_PIN_ATTEMPTS = 5;

export interface AppLockState {
  /** Kunci aplikasi aktif (opsional, Android saja). Default mati; kembali mati setelah logout. */
  enabled: boolean;
  /** Boleh membuka dengan sidik jari (PIN tetap jadi cadangan). */
  biometricEnabled: boolean;
  /** Hash PBKDF2 + salt dari modul native; PIN-nya sendiri tidak disimpan. */
  pinHash: string;
  pinSalt: string;
  /** Di-persist, jadi menutup lalu membuka app tidak mereset hitungan. */
  failedAttempts: number;
  /** Popup "Kunci TosmFi?" ditawarkan sekali setelah login, sampai dijawab. */
  offerPending: boolean;
  /**
   * TIDAK di-persist (lihat store/index.ts): selalu `true` saat app dibuka, jadi app terkunci
   * kalau `enabled`. Diset lagi saat app kembali dari latar belakang (hooks/useAppLockLifecycle).
   */
  isLocked: boolean;
}

const initialState: AppLockState = {
  enabled: false,
  biometricEnabled: false,
  pinHash: '',
  pinSalt: '',
  failedAttempts: 0,
  offerPending: false,
  isLocked: true,
};

export const appLockSlice = createSlice({
  name: 'appLock',
  initialState,
  reducers: {
    enableAppLock: (
      state,
      action: PayloadAction<{
        pinHash: string;
        pinSalt: string;
        biometricEnabled: boolean;
      }>,
    ) => {
      state.enabled = true;
      state.pinHash = action.payload.pinHash;
      state.pinSalt = action.payload.pinSalt;
      state.biometricEnabled = action.payload.biometricEnabled;
      state.failedAttempts = 0;
      state.offerPending = false;
      state.isLocked = false;
    },
    changePin: (
      state,
      action: PayloadAction<{ pinHash: string; pinSalt: string }>,
    ) => {
      state.pinHash = action.payload.pinHash;
      state.pinSalt = action.payload.pinSalt;
      state.failedAttempts = 0;
    },
    disableAppLock: () => ({ ...initialState, isLocked: false }),
    setBiometricEnabled: (state, action: PayloadAction<boolean>) => {
      state.biometricEnabled = action.payload;
    },
    lockApp: state => {
      state.isLocked = true;
    },
    unlockApp: state => {
      state.isLocked = false;
      state.failedAttempts = 0;
    },
    registerFailedPin: state => {
      state.failedAttempts += 1;
    },
    dismissAppLockOffer: state => {
      state.offerPending = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(onLogin, () => ({
        ...initialState,
        offerPending: true,
        isLocked: false,
      }))
      .addCase(onLogout, () => initialState)
      .addCase(onSessionExpired, () => initialState);
  },
});

export const {
  enableAppLock,
  changePin,
  disableAppLock,
  setBiometricEnabled,
  lockApp,
  unlockApp,
  registerFailedPin,
  dismissAppLockOffer,
} = appLockSlice.actions;

/** App sedang terkunci: hanya Beranda kunci + pintasan (Catat cepat, Dompet saya) yang terbuka. */
export const selectIsAppLocked = (state: RootState) =>
  state.auth.isLogin && state.appLock.enabled && state.appLock.isLocked;

export default appLockSlice.reducer;
