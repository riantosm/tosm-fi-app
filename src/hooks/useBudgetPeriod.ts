import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getCurrentMonthRange,
  type CurrentMonthRange,
} from '@/utils/budgetBreakdown';
import {
  formatDayMonth,
  formatMonthName,
  formatMonthYear,
  parseIsoDate,
} from '@/utils/calendar';
import { toIntlLocale } from '@/utils/locale';

export interface BudgetPeriod extends CurrentMonthRange {
  locale: string;
  /** "Oktober 2026" */
  monthLabel: string;
  /** "Oktober" */
  monthName: string;
  /** "1 Okt" / "31 Okt". */
  startLabel: string;
  endLabel: string;
}

/** Bulan berjalan yang dipakai semua budget, beserta labelnya (port useBudgetPeriod web). */
export function useBudgetPeriod(): BudgetPeriod {
  const { i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);

  return useMemo(() => {
    const range = getCurrentMonthRange();
    const start = parseIsoDate(range.dateFrom);
    return {
      ...range,
      locale,
      monthLabel: formatMonthYear(start, locale),
      monthName: formatMonthName(start, locale),
      startLabel: formatDayMonth(start, locale),
      endLabel: formatDayMonth(parseIsoDate(range.dateTo), locale),
    };
  }, [locale]);
}
