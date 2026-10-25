import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import notifee from '@notifee/react-native';
import { useTranslation } from 'react-i18next';
import { useWallets } from '@/hooks/useWallets';
import { navigationRef } from '@/navigation/navigationRef';
import { ROUTES } from '@/navigation/paths';
import {
  cancelWalletRefresh,
  scheduleWalletRefresh,
} from '@/services/native/walletRefresh';
import { requestNotificationPermission } from '@/services/notification/scheduleReminder';
import {
  cancelWalletNotification,
  handleWalletNotificationEvent,
  routeForWalletNotificationPress,
  setWalletNotificationRouteListener,
  showWalletNotification,
  takePendingWalletNotificationRoute,
  WALLET_NOTIFICATION_ID,
  type WalletNotificationRoute,
} from '@/services/notification/walletNotification';
import { useAppSelector } from '@/store/hooks';
import { selectWalletNotificationPrefs } from '@/store/slices/settingsSlice';

/** Saldo dimuat ulang saat app kembali dibuka kalau sinkron terakhir lebih lama dari ini. */
const RESUME_RELOAD_MS = 60 * 1000;

function openRoute(route: WalletNotificationRoute, attempt = 0) {
  // Cold start: NavigationContainer belum siap saat notifikasi awal dibaca.
  if (!navigationRef.isReady()) {
    if (attempt < 20) {
      setTimeout(() => openRoute(route, attempt + 1), 150);
    }
    return;
  }
  navigationRef.navigate(
    route === 'quickAdd' ? ROUTES.QUICK_ADD : ROUTES.WALLET,
  );
}

/**
 * Notifikasi saldo dompet (Android). Dipanggil sekali di AppShell:
 * - tampil/perbarui setiap daftar dompet, pengaturan, mata uang, atau bahasa berubah (termasuk
 *   setelah transaksi, karena mutasi menyinkronkan dompet);
 * - muat ulang saldo saat app dibuka lagi;
 * - pasang jadwal WorkManager tiap jam untuk saat app tidak dipakai;
 * - logout / fitur dimatikan → notifikasi & jadwal dibatalkan;
 * - tap notifikasi / tombol Catat / Buka dompet → buka layarnya.
 */
export function useWalletNotification() {
  const isAndroid = Platform.OS === 'android';
  const isLogin = useAppSelector(state => state.auth.isLogin);
  const prefs = useAppSelector(selectWalletNotificationPrefs);
  const currency = useAppSelector(state => state.settings.currency);
  const decimalPlaces = useAppSelector(state => state.settings.decimalPlaces);
  const active = isAndroid && isLogin && prefs.enabled;
  const { wallets, status, loadWallets } = useWallets({ autoLoad: active });
  const { i18n } = useTranslation();
  const syncedAt = useRef(Date.now());

  // Jadwal latar belakang + izin notifikasi (Android 13+).
  useEffect(() => {
    if (!isAndroid) {
      return;
    }
    if (!active) {
      cancelWalletNotification().catch(() => {});
      cancelWalletRefresh().catch(() => {});
      return;
    }
    requestNotificationPermission().catch(() => false);
    scheduleWalletRefresh().catch(() => {});
  }, [isAndroid, active]);

  useEffect(() => {
    syncedAt.current = Date.now();
  }, [wallets]);

  useEffect(() => {
    if (!active || status !== 'loaded') {
      return;
    }
    showWalletNotification(wallets, syncedAt.current).catch(() => {});
  }, [
    active,
    status,
    wallets,
    prefs.content,
    prefs.hideAmounts,
    currency,
    decimalPlaces,
    i18n.language,
  ]);

  // Saldo bisa berubah dari perangkat lain (web): muat ulang saat app dibuka lagi.
  useEffect(() => {
    if (!active) {
      return;
    }
    const subscription = AppState.addEventListener('change', state => {
      if (
        state === 'active' &&
        Date.now() - syncedAt.current > RESUME_RELOAD_MS
      ) {
        loadWallets();
      }
    });
    return () => subscription.remove();
  }, [active, loadWallets]);

  // Tap notifikasi / tombol aksi.
  useEffect(() => {
    if (!isAndroid || !isLogin) {
      return;
    }
    setWalletNotificationRouteListener(openRoute);
    const pending = takePendingWalletNotificationRoute();
    if (pending) {
      openRoute(pending);
    }
    notifee
      .getInitialNotification()
      .then(initial => {
        if (initial?.notification.id === WALLET_NOTIFICATION_ID) {
          const route = routeForWalletNotificationPress(initial.pressAction.id);
          if (route) {
            openRoute(route);
          }
        }
      })
      .catch(() => {});
    const unsubscribe = notifee.onForegroundEvent(event => {
      handleWalletNotificationEvent(event).catch(() => {});
    });
    return () => {
      unsubscribe();
      setWalletNotificationRouteListener(null);
    };
  }, [isAndroid, isLogin]);
}
