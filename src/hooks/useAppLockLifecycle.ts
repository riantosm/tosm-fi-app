import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { lockApp } from '@/store/slices/appLockSlice';

/**
 * Lama di latar belakang sebelum app dikunci lagi. Jeda singkat (share sheet, izin kamera,
 * prompt sidik jari, pindah app sebentar) tidak membuat user harus membuka kunci ulang.
 */
const RELOCK_AFTER_MS = 30_000;

/**
 * Dipanggil di AppShell. Saat app dibuka, `appLock.isLocked` sudah `true` (tidak di-persist);
 * hook ini mengunci lagi setelah app kembali dari latar belakang ≥ 30 detik.
 */
export function useAppLockLifecycle() {
  const dispatch = useAppDispatch();
  const enabled = useAppSelector(
    state => state.auth.isLogin && state.appLock.enabled,
  );
  const backgroundAt = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'background') {
        backgroundAt.current = Date.now();
        return;
      }
      if (state === 'active' && backgroundAt.current != null) {
        const elapsed = Date.now() - backgroundAt.current;
        backgroundAt.current = null;
        if (elapsed >= RELOCK_AFTER_MS) {
          dispatch(lockApp());
        }
      }
    });
    return () => subscription.remove();
  }, [enabled, dispatch]);
}
