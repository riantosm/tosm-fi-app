import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  getCashFlowApi,
  getMonthlyTrendApi,
  getReportSummaryApi,
  getTopSpendingApi,
  getWalletUsageApi,
} from '@/services/api/report.service';
import { useAppSelector } from '@/store/hooks';
import type {
  CashFlowPoint,
  MonthlyTrendRawPoint,
  ReportSummary,
  TopSpendingItem,
  TransactionCategoryBreakdown,
  WalletUsageItem,
} from '@/types';
import { toIntlLocale } from '@/utils/locale';
import {
  resolveReportPeriod,
  type ReportPeriodFilter,
} from '@/utils/reportPeriod';

const TOP_SPENDING_LIMIT = 10;
export const MONTHLY_TREND_MONTHS = 12;

/**
 * Satu widget = satu endpoint, dimuat sendiri-sendiri (port `useReports` web). "Sedang memuat"
 * diturunkan dari kunci request vs kunci yang terakhir selesai, jadi kartu yang cepat tampil lebih
 * dulu dan data lama tetap terlihat (redup) saat periode diganti.
 */
function useReportResource<T>(
  key: string,
  initial: T,
  fetcher: () => Promise<T>,
) {
  const [data, setData] = useState<T>(initial);
  const [completedKey, setCompletedKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then(result => {
        if (!cancelled) {
          setData(result);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setCompletedKey(key);
        }
      });
    return () => {
      cancelled = true;
    };
    // fetcher dibuat ulang tiap render; kuncinya sudah memuat semua argumen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, isLoading: completedKey !== key };
}

export function useReports(period: ReportPeriodFilter, refreshKey = 0) {
  const { language } = useLanguage();
  const locale = toIntlLocale(language);
  // Transaksi dibuat/diubah/dihapus di layar lain → muat ulang.
  const version = useAppSelector(state => state.transaction.version);

  const resolvedPeriod = useMemo(
    () => resolveReportPeriod(period, new Date()),
    [period],
  );
  const periodKey = `${JSON.stringify(
    resolvedPeriod,
  )}|${version}|${refreshKey}`;

  const summary = useReportResource<{
    summary: ReportSummary | null;
    categoryBreakdown: TransactionCategoryBreakdown[];
  }>(periodKey, { summary: null, categoryBreakdown: [] }, () =>
    getReportSummaryApi(
      resolvedPeriod.dateFrom,
      resolvedPeriod.dateTo,
      resolvedPeriod.previousDateFrom,
      resolvedPeriod.previousDateTo,
    ),
  );

  const cashFlow = useReportResource<CashFlowPoint[]>(
    `${periodKey}|${locale}`,
    [],
    () =>
      getCashFlowApi(resolvedPeriod.dateFrom, resolvedPeriod.dateTo, locale),
  );

  // Selalu 12 bulan terakhir, tidak ikut periode terpilih.
  const monthlyTrend = useReportResource<MonthlyTrendRawPoint[]>(
    `${locale}|${version}|${refreshKey}`,
    [],
    () => getMonthlyTrendApi(MONTHLY_TREND_MONTHS, locale),
  );

  const walletUsage = useReportResource<WalletUsageItem[]>(periodKey, [], () =>
    getWalletUsageApi(resolvedPeriod.dateFrom, resolvedPeriod.dateTo),
  );

  const topSpending = useReportResource<TopSpendingItem[]>(periodKey, [], () =>
    getTopSpendingApi(
      resolvedPeriod.dateFrom,
      resolvedPeriod.dateTo,
      TOP_SPENDING_LIMIT,
    ),
  );

  return {
    resolvedPeriod,
    summary: summary.data.summary,
    categoryBreakdown: summary.data.categoryBreakdown,
    isSummaryLoading: summary.isLoading,
    cashFlow: cashFlow.data,
    isCashFlowLoading: cashFlow.isLoading,
    monthlyTrend: monthlyTrend.data,
    isMonthlyTrendLoading: monthlyTrend.isLoading,
    walletUsage: walletUsage.data,
    isWalletUsageLoading: walletUsage.isLoading,
    topSpending: topSpending.data,
    isTopSpendingLoading: topSpending.isLoading,
  };
}
