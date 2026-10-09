import { numberFormat } from '@/utils/intl';
/** Placeholder pengganti nominal saat "sembunyikan saldo" aktif. */
export const AMOUNT_MASK = '••••••••';

/** Minus asli (U+2212) untuk nominal negatif, sama dengan web. */
export const MINUS = '−';

export function formatNumber(
  value: number,
  locale: string,
  decimalPlaces: number,
): string {
  return numberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
}

/** Satuan ringkas per locale mata uang (Hermes belum tentu mendukung `notation: 'compact'`). */
const COMPACT_UNITS: Record<string, [number, string][]> = {
  'id-ID': [
    [1e12, ' T'],
    [1e9, ' M'],
    [1e6, ' jt'],
    [1e3, ' rb'],
  ],
  'en-US': [
    [1e12, 'T'],
    [1e9, 'B'],
    [1e6, 'M'],
    [1e3, 'K'],
  ],
  'ja-JP': [
    [1e12, '兆'],
    [1e8, '億'],
    [1e4, '万'],
  ],
};

/** "9,24 jt" / "18.5M" / "1.2万" — label grafik & tempat sempit. Maks 2 desimal. */
export function formatCompact(value: number, locale: string): string {
  const units = COMPACT_UNITS[locale] ?? COMPACT_UNITS['en-US'];
  const abs = Math.abs(value);
  const unit = units.find(([threshold]) => abs >= threshold);
  if (!unit) {
    return numberFormat(locale, { maximumFractionDigits: 0 }).format(value);
  }
  const [threshold, suffix] = unit;
  const scaled = numberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(value / threshold);
  return `${scaled}${suffix}`;
}
