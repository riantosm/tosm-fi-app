export interface WalletAccount {
  idWallet: string;
  nameWallet: string;
  color: string;
  balance: number;
  transactionCount: number;
  isPrimary: boolean;
  /** Logo yang diunggah (Cloudinary). Kosong/null → ikon dompet default. */
  logoUrl?: string | null;
}

export interface WalletInput {
  nameWallet: string;
  color: string;
  balance?: number;
}

/** Gambar yang sudah diperkecil, siap dikirim sebagai base64 (lihat utils/walletLogo.ts). */
export interface WalletLogoImage {
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  /** Base64 tanpa awalan "data:...;base64,". */
  data: string;
}

/** Perubahan logo saat simpan: unggah baru, hapus, atau (undefined) tidak berubah. */
export type WalletLogoChange =
  | { type: 'upload'; image: WalletLogoImage }
  | { type: 'remove' };
