import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { navigationRef } from '@/navigation/navigationRef';
import { ROUTES } from '@/navigation/paths';
import {
  authenticateBiometric,
  getBiometricStatus,
  verifyPin,
  type BiometricResult,
} from '@/services/native/appLock';
import { store } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  MAX_PIN_ATTEMPTS,
  registerFailedPin,
  unlockApp,
} from '@/store/slices/appLockSlice';

/** Hasil satu percobaan PIN. `logout` = batas percobaan habis, sesi sudah dibersihkan. */
export type PinAttemptResult =
  | { status: 'ok' }
  | { status: 'wrong'; remaining: number }
  | { status: 'logout' };

/** Aksi kunci aplikasi bersama untuk layar Beranda kunci, PIN, pintasan, dan Pengaturan. */
export function useAppLock() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const { logout } = useAuth();
  const biometricEnabled = useAppSelector(
    state => state.appLock.biometricEnabled,
  );

  /** Prompt sidik jari sistem dengan teks app. */
  const promptBiometric = useCallback(
    (): Promise<BiometricResult> =>
      authenticateBiometric({
        title: t('appLock.biometricTitle'),
        subtitle: t('appLock.biometricSubtitle'),
        negativeText: t('appLock.usePin'),
      }),
    [t],
  );

  /**
   * Cek PIN (buka kunci, matikan kunci, atau ubah PIN). Salah dihitung bersama; salah ke-5 →
   * logout, jadi pengaturan kunci ikut kembali mati.
   */
  const attemptPin = useCallback(
    async (pin: string): Promise<PinAttemptResult> => {
      const { pinHash, pinSalt } = store.getState().appLock;
      if (await verifyPin(pin, { pinHash, pinSalt })) {
        return { status: 'ok' };
      }
      dispatch(registerFailedPin());
      const remaining =
        MAX_PIN_ATTEMPTS - store.getState().appLock.failedAttempts;
      if (remaining <= 0) {
        await logout();
        showToast(t('appLock.tooManyAttempts'), 'error', 4000);
        return { status: 'logout' };
      }
      return { status: 'wrong', remaining };
    },
    [dispatch, logout, showToast, t],
  );

  /**
   * Tombol "Masuk" (Beranda kunci, banner pintasan): sidik jari kalau aktif & tersedia, selain itu
   * (atau "Pakai PIN" / sidik jari terkunci) buka layar PIN. Sukses → RootNavigator pindah grup.
   */
  const startUnlock = useCallback(async () => {
    const openPin = () =>
      navigationRef.isReady() &&
      navigationRef.navigate(ROUTES.APP_LOCK_PIN, { mode: 'unlock' });

    if (!biometricEnabled || (await getBiometricStatus()) !== 'available') {
      openPin();
      return;
    }
    const result = await promptBiometric();
    if (result === 'success') {
      dispatch(unlockApp());
    } else if (result === 'lockout') {
      showToast(t('appLock.biometricLockout'), 'info');
      openPin();
    } else if (result !== 'cancel') {
      openPin();
    }
  }, [biometricEnabled, dispatch, promptBiometric, showToast, t]);

  return { promptBiometric, attemptPin, startUnlock };
}
