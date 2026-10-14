import type { TextStyle } from 'react-native';

/**
 * Font Mist (DESIGN_SYSTEM.md §3). Berat ditentukan oleh FILE font, jadi jangan menambahkan
 * fontWeight di style (Android akan mensintesis tebal palsu). Maksimal semibold (600).
 */
export const fonts = {
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodyStrong: 'Inter-SemiBold',
  display: 'Outfit-SemiBold',
  displayMedium: 'Outfit-Medium',
  num: 'Outfit-SemiBold',
  numRegular: 'Outfit-Regular',
} as const;

/** Gaya teks per peran; dipakai lewat `<Typography variant="…">`. */
export const textStyles = {
  /** Angka hero Dashboard: Outfit 42/600. */
  heroAmount: {
    fontFamily: fonts.num,
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: -1,
  },
  /** Angka uang di sheet/AmountCard: Outfit 40/600. */
  amount: {
    fontFamily: fonts.num,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  /** Headline auth & judul form auth: Outfit 26/600. */
  headline: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  /** Judul app bar: Outfit 22/600 (= web PageHeader di HP). */
  pageTitle: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28 },
  /** Judul sheet / dialog: Outfit 21/600. */
  sheetTitle: { fontFamily: fonts.display, fontSize: 21, lineHeight: 26 },
  /** Wordmark "TosmFi": Outfit 19/600. */
  wordmark: { fontFamily: fonts.display, fontSize: 19, lineHeight: 24 },
  /** Judul kartu / empty state: Outfit 18/600. */
  cardTitle: { fontFamily: fonts.display, fontSize: 18, lineHeight: 24 },
  /** Sapaan hero: Outfit 17/500. */
  greeting: { fontFamily: fonts.displayMedium, fontSize: 17, lineHeight: 22 },
  /** Body: Inter 14/400. */
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  /** Label / judul baris / tombol: Inter 14/600. */
  label: { fontFamily: fonts.bodyStrong, fontSize: 14, lineHeight: 20 },
  /** Angka di baris: Outfit 14/600. */
  num: { fontFamily: fonts.num, fontSize: 14, lineHeight: 20 },
  /** Label field: Inter 13/600. */
  fieldLabel: { fontFamily: fonts.bodyStrong, fontSize: 13, lineHeight: 18 },
  /** Teks sekunder (subjudul halaman): Inter 13/400. */
  secondary: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  /** Meta baris: Inter 12.5/400. */
  meta: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 17 },
  /** Label tile kecil: Inter 12.5/600. */
  tileLabel: { fontFamily: fonts.bodyStrong, fontSize: 12.5, lineHeight: 17 },
  /** Helper / waktu: Inter 12/400. */
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16 },
  /** Tautan kecil: Inter 12/600. */
  captionStrong: { fontFamily: fonts.bodyStrong, fontSize: 12, lineHeight: 16 },
  /** Eyebrow / judul seksi: Inter 11/600 CAPS. */
  eyebrow: {
    fontFamily: fonts.bodyStrong,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  /** Badge: Inter 11/600. */
  badge: { fontFamily: fonts.bodyStrong, fontSize: 11, lineHeight: 14 },
  /** Angka kecil tanpa tebal (web `font-num` 400): Outfit 14 / 13 / 12.5 / 12. */
  numBody: { fontFamily: fonts.numRegular, fontSize: 14, lineHeight: 20 },
  numSecondary: { fontFamily: fonts.numRegular, fontSize: 13, lineHeight: 18 },
  numMeta: { fontFamily: fonts.numRegular, fontSize: 12.5, lineHeight: 17 },
  numCaption: { fontFamily: fonts.numRegular, fontSize: 12, lineHeight: 16 },
  /** Label sedang (web `font-medium`): Inter 13 / 12.5 / 12 / 500. */
  secondaryMedium: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  metaMedium: { fontFamily: fonts.bodyMedium, fontSize: 12.5, lineHeight: 17 },
  captionMedium: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16 },
  /** Label sumbu grafik: Inter 11/400. */
  axis: { fontFamily: fonts.body, fontSize: 11, lineHeight: 14 },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textStyles;
