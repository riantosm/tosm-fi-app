import { Platform } from 'react-native';
import NativeWalletRefresh from '@/specs/NativeWalletRefresh';

/** Nama task headless JS yang dijalankan `WalletRefreshWorker.kt` (didaftarkan di index.js). */
export const WALLET_REFRESH_TASK = 'WalletNotificationRefresh';

/** Interval pembaruan notifikasi saldo di latar belakang. */
export const WALLET_REFRESH_INTERVAL_MINUTES = 60;

/**
 * Jadwal WorkManager hanya untuk Android (modul native `WalletRefreshModule.kt`). `null` di iOS
 * atau build lama yang belum memuat modulnya: notifikasi tetap diperbarui saat app dipakai.
 */
const nativeModule = Platform.OS === 'android' ? NativeWalletRefresh : null;

export const isWalletRefreshSupported = nativeModule != null;

/** Pasang jadwal periodik (aman dipanggil berulang: jadwal yang sudah ada dipertahankan). */
export async function scheduleWalletRefresh(): Promise<void> {
  await nativeModule?.schedulePeriodicRefresh(WALLET_REFRESH_INTERVAL_MINUTES);
}

export async function cancelWalletRefresh(): Promise<void> {
  await nativeModule?.cancelPeriodicRefresh();
}

/** true = TosmFi dikecualikan dari optimasi baterai (update tiap jam tetap jalan saat Hemat daya). */
export async function isBatteryOptimizationIgnored(): Promise<boolean> {
  if (!nativeModule) {
    return false;
  }
  try {
    return await nativeModule.isIgnoringBatteryOptimizations();
  } catch {
    return false;
  }
}

/** Dialog sistem "izinkan berjalan di latar belakang"; hasilnya dicek ulang saat app aktif lagi. */
export async function requestBatteryOptimizationExemption(): Promise<void> {
  await nativeModule?.requestIgnoreBatteryOptimizations();
}
