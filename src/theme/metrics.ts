/** Skala jarak & radius Mist (DESIGN_SYSTEM.md §4). Pakai token ini, bukan angka acak. */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const layout = {
  /** Gutter kiri/kanan layar HP. */
  gutter: 16,
  /** Gutter header Login & hero Dashboard. */
  heroGutter: 20,
  appBarHeight: 64,
  /** Ruang bawah konten supaya tidak tertutup bottom nav mengambang. */
  bottomNavSpace: 130,
  bottomNavHeight: 64,
} as const;

export const radius = {
  /** Tombol ikon kotak, tile menu, kotak catatan, key keypad. */
  control: 12,
  /** Kotak field input, banner. */
  field: 14,
  /** Kartu, AmountCard. */
  card: 20,
  /** Bottom sheet & dialog. */
  sheet: 28,
  /** Hero band, sheet form auth. */
  hero: 32,
  pill: 999,
} as const;
