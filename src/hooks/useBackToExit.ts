import { useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/contexts/ToastContext';
import { navigationRef } from '@/navigation/navigationRef';

const EXIT_WINDOW_MS = 2000;

/**
 * Android: di layar paling awal (tidak ada lagi yang bisa di-back), back pertama hanya
 * menampilkan "Ketuk sekali lagi untuk keluar"; back kedua dalam 2 detik baru keluar.
 * Dipasang setelah NavigationContainer, jadi listener ini dipanggil lebih dulu dan
 * menyerahkan ke navigasi selama masih bisa kembali (stack, tab → Beranda, sheet/modal).
 */
export function useBackToExit() {
  const { t } = useTranslation();
  const showToast = useToast();
  const lastPress = useRef(0);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (navigationRef.isReady() && navigationRef.canGoBack()) {
          return false;
        }
        const now = Date.now();
        if (now - lastPress.current < EXIT_WINDOW_MS) {
          return false; // biarkan sistem menutup app
        }
        lastPress.current = now;
        showToast(t('common.pressBackAgainToExit'), 'info', EXIT_WINDOW_MS);
        return true;
      },
    );
    return () => subscription.remove();
  }, [showToast, t]);
}
