import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Spec codegen untuk jadwal pembaruan notifikasi saldo (Android saja,
 * `android/app/.../walletrefresh`). Jangan dipakai langsung: lewat `services/native/walletRefresh.ts`.
 */
export interface Spec extends TurboModule {
  /** WorkManager periodik (min 15 menit, butuh koneksi) → task headless `WalletNotificationRefresh`. */
  schedulePeriodicRefresh(intervalMinutes: number): Promise<void>;
  cancelPeriodicRefresh(): Promise<void>;
  /** true = app dikecualikan dari optimasi baterai ("Unrestricted"), tetap jalan saat Hemat daya. */
  isIgnoringBatteryOptimizations(): Promise<boolean>;
  /** Buka dialog sistem untuk mengecualikan app dari optimasi baterai (user yang memilih). */
  requestIgnoreBatteryOptimizations(): Promise<void>;
}

export default TurboModuleRegistry.get<Spec>('NativeWalletRefresh');
