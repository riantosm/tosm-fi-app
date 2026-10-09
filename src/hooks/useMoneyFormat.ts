import { useCallback, useMemo } from 'react';
import { CURRENCIES } from '@/constants/currencies';
import { useAppSelector } from '@/store/hooks';
import {
  formatCompact as compact,
  formatNumber as number,
  MINUS,
} from '@/utils/money';

/**
 * Format uang dari pengaturan (mata uang + jumlah desimal), setara useMoneyFormat web:
 * `format` ("IDR 45.000"), `formatNumber` ("45.000"), `formatCompact` ("9,24 jt"),
 * `formatSigned` ("+9.260.000" / "−45.000"), dan `symbol` untuk tata letak "IDR" + angka besar.
 */
export function useMoneyFormat() {
  const currency = useAppSelector(state => state.settings.currency);
  const decimalPlaces = useAppSelector(state => state.settings.decimalPlaces);
  const option = useMemo(
    () => CURRENCIES.find(item => item.code === currency) ?? CURRENCIES[0],
    [currency],
  );
  const { locale, symbol } = option;

  const formatNumber = useCallback(
    (value: number) => number(value, locale, decimalPlaces),
    [locale, decimalPlaces],
  );

  const format = useCallback(
    (value: number) => `${symbol} ${formatNumber(value)}`,
    [symbol, formatNumber],
  );

  const formatCompact = useCallback(
    (value: number) => compact(value, locale),
    [locale],
  );

  const formatSigned = useCallback(
    (value: number) =>
      `${value > 0 ? '+' : value < 0 ? MINUS : ''}${formatNumber(
        Math.abs(value),
      )}`,
    [formatNumber],
  );

  return { symbol, format, formatNumber, formatCompact, formatSigned };
}
