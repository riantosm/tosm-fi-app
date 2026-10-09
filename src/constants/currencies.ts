import type { CurrencyCode } from '@/types';

export interface CurrencyOption {
  code: CurrencyCode;
  symbol: string;
  /** Locale Intl untuk format angka mata uang ini (bukan bahasa UI). */
  locale: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'IDR', symbol: 'IDR', locale: 'id-ID' },
  { code: 'USD', symbol: '$', locale: 'en-US' },
  { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
];
