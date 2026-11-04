import { launchImageLibrary } from 'react-native-image-picker';
import { Images } from 'react-native-nitro-image';
import type { WalletLogoImage } from '@/types';
import { bytesToBase64 } from '@/utils/base64';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
/** Dicek sebelum diperkecil; hasil unggahan selalu jauh lebih kecil. */
const MAX_BYTES = 5 * 1024 * 1024;
/** Logo cukup ~256px (sama dengan web). */
const MAX_SIDE = 256;

export type WalletLogoError = 'unsupported' | 'tooLarge';

export interface PickedWalletLogo {
  image: WalletLogoImage;
  /** file:// gambar yang sudah diperkecil, untuk pratinjau sebelum diunggah. */
  previewUri: string;
}

const stripFileUrl = (uri: string) =>
  decodeURIComponent(uri.replace(/^file:\/\//, ''));

/**
 * Pilih gambar dari galeri lalu perkecil ke maks 256px (rasio tetap, tidak
 * diperbesar) sebagai PNG supaya latar transparan logo tetap. `null` = batal.
 * Gagal → `Error` dengan pesan `WalletLogoError`.
 */
export async function pickWalletLogo(): Promise<PickedWalletLogo | null> {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
    restrictMimeTypes: ACCEPTED_TYPES,
  });
  const asset = result.assets?.[0];
  if (result.didCancel || !asset?.uri) {
    return null;
  }
  if (
    result.errorCode ||
    (asset.type && !ACCEPTED_TYPES.includes(asset.type))
  ) {
    throw new Error('unsupported' satisfies WalletLogoError);
  }
  if ((asset.fileSize ?? 0) > MAX_BYTES) {
    throw new Error('tooLarge' satisfies WalletLogoError);
  }

  const full = await Images.loadFromFileAsync(stripFileUrl(asset.uri));
  const scale = Math.min(1, MAX_SIDE / Math.max(full.width, full.height));
  const image =
    scale < 1
      ? await full.resizeAsync(
          Math.max(1, Math.round(full.width * scale)),
          Math.max(1, Math.round(full.height * scale)),
        )
      : full;
  const [path, encoded] = await Promise.all([
    image.saveToTemporaryFileAsync('png'),
    image.toEncodedImageDataAsync('png'),
  ]);
  return {
    previewUri: path.startsWith('file://') ? path : `file://${path}`,
    image: {
      mimeType: 'image/png',
      data: bytesToBase64(new Uint8Array(encoded.buffer)),
    },
  };
}
