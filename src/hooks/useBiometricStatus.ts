import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import {
  getBiometricStatus,
  type BiometricStatus,
} from '@/services/native/appLock';

/**
 * Status sidik jari HP ini. Dicek ulang saat app aktif lagi, karena user bisa mendaftarkan
 * sidik jari di pengaturan HP lalu kembali ke app.
 */
export function useBiometricStatus() {
  const [status, setStatus] = useState<BiometricStatus>('unavailable');

  const refresh = useCallback(() => {
    getBiometricStatus().then(setStatus);
  }, []);

  useEffect(() => {
    refresh();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refresh();
      }
    });
    return () => subscription.remove();
  }, [refresh]);

  return status;
}
