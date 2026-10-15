import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Spec codegen untuk modul native kunci aplikasi (Android saja, `android/app/.../applock`).
 * Jangan dipakai langsung: lewat `services/native/appLock.ts`.
 */
export interface Spec extends TurboModule {
  /** `available` · `none_enrolled` (sensor ada, sidik jari belum didaftarkan) · `unavailable`. */
  getBiometricStatus(): Promise<string>;
  /** BiometricPrompt sistem: `success` · `fallback` (tombol negatif) · `cancel` · `lockout` · `error`. */
  authenticate(
    title: string,
    subtitle: string,
    negativeText: string,
  ): Promise<string>;
  /** Salt acak (hex) untuk PIN baru. */
  generateSalt(): Promise<string>;
  /** Hash PBKDF2 PIN, format `<alg>$<hex>`. */
  hashPin(pin: string, salt: string): Promise<string>;
  /** Bandingkan PIN dengan hash tersimpan (waktu konstan). */
  verifyPin(pin: string, salt: string, hash: string): Promise<boolean>;
}

export default TurboModuleRegistry.get<Spec>('NativeAppLock');
