/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee from '@notifee/react-native';
import { enableFreeze } from 'react-native-screens';
import App from './App';
import { name as appName } from './app.json';
import { WALLET_REFRESH_TASK } from '@/services/native/walletRefresh';
import {
  handleWalletNotificationEvent,
  refreshWalletNotification,
} from '@/services/notification/walletNotification';

// Event notifikasi di latar belakang. Pengingat Jadwal cukup membuka app (tidak perlu diproses);
// notifikasi saldo punya tombol Sembunyikan/Tampilkan dan muncul lagi saat digeser.
// Wajib didaftarkan sebelum app terdaftar.
notifee.onBackgroundEvent(async event => {
  await handleWalletNotificationEvent(event);
});

// Dijalankan WorkManager tiap jam (android/.../walletrefresh/WalletRefreshWorker.kt).
AppRegistry.registerHeadlessTask(
  WALLET_REFRESH_TASK,
  () => refreshWalletNotification,
);

// Layar yang tidak terlihat (di bawah stack / tab lain) dibekukan: perubahan data, bahasa, atau
// tema tidak merender ulang semuanya sekaligus; layar dirender ulang saat terlihat lagi.
enableFreeze(true);

AppRegistry.registerComponent(appName, () => App);
