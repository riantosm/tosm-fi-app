import { Platform } from 'react-native';
import NativeAppLock from '@/specs/NativeAppLock';

export type BiometricStatus = 'available' | 'none_enrolled' | 'unavailable';

export type BiometricResult =
  | 'success'
  | 'fallback'
  | 'cancel'
  | 'lockout'
  | 'error';

export interface PinSecret {
  pinHash: string;
  pinSalt: string;
}

/** Panjang PIN kunci aplikasi. */
export const PIN_LENGTH = 6;

/**
 * Kunci aplikasi hanya untuk Android (modul native `AppLockModule.kt`). `null` di iOS atau
 * build lama yang belum memuat modulnya: fitur disembunyikan.
 */
const nativeModule = Platform.OS === 'android' ? NativeAppLock : null;

export const isAppLockSupported = nativeModule != null;

export async function getBiometricStatus(): Promise<BiometricStatus> {
  if (!nativeModule) {
    return 'unavailable';
  }
  try {
    return (await nativeModule.getBiometricStatus()) as BiometricStatus;
  } catch {
    return 'unavailable';
  }
}

export async function authenticateBiometric(texts: {
  title: string;
  subtitle: string;
  negativeText: string;
}): Promise<BiometricResult> {
  if (!nativeModule) {
    return 'error';
  }
  try {
    return (await nativeModule.authenticate(
      texts.title,
      texts.subtitle,
      texts.negativeText,
    )) as BiometricResult;
  } catch {
    return 'error';
  }
}

/** PIN baru → salt acak + hash PBKDF2. PIN-nya sendiri tidak pernah disimpan. */
export async function createPinSecret(pin: string): Promise<PinSecret> {
  if (!nativeModule) {
    throw new Error('App lock is not supported');
  }
  const pinSalt = await nativeModule.generateSalt();
  const pinHash = await nativeModule.hashPin(pin, pinSalt);
  return { pinHash, pinSalt };
}

export async function verifyPin(
  pin: string,
  secret: PinSecret,
): Promise<boolean> {
  if (!nativeModule || !secret.pinHash) {
    return false;
  }
  try {
    return await nativeModule.verifyPin(pin, secret.pinSalt, secret.pinHash);
  } catch {
    return false;
  }
}
