import i18n from '@/i18n';
import {
  axiosInstance,
  getApiErrorMessage,
} from '@/services/api/axiosInstance';
import type {
  ApiResponse,
  CashFlowPoint,
  DashboardSummary,
  MonthlyTrendRawPoint,
  ReportSummary,
  ReportSummaryResult,
  TopSpendingItem,
  TransactionCategoryBreakdown,
  WalletUsageItem,
} from '@/types';

/** Agregat periode sekarang + sebelumnya beserta perbandingannya, dihitung server. */
export async function getReportSummaryApi(
  dateFrom: string,
  dateTo: string,
  previousDateFrom: string,
  previousDateTo: string,
): Promise<ReportSummaryResult> {
  try {
    const { data } = await axiosInstance.get<
      ApiResponse<
        ReportSummary & { categoryBreakdown: TransactionCategoryBreakdown[] }
      >
    >('/reports/summary', {
      params: { dateFrom, dateTo, previousDateFrom, previousDateTo },
    });
    const { categoryBreakdown, ...summary } = data.data;
    return { summary, categoryBreakdown };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('reports.genericError')), {
      cause: error,
    });
  }
}

/** Di-bucket per jam/hari/minggu/bulan oleh server. */
export async function getCashFlowApi(
  dateFrom: string,
  dateTo: string,
  locale: string,
): Promise<CashFlowPoint[]> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<CashFlowPoint[]>>(
      '/reports/cash-flow',
      { params: { dateFrom, dateTo, locale } },
    );
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('reports.genericError')), {
      cause: error,
    });
  }
}

/** Pemasukan & pengeluaran per bulan sekaligus, jadi toggle metrik tidak perlu refetch. */
export async function getMonthlyTrendApi(
  monthsCount: number,
  locale: string,
): Promise<MonthlyTrendRawPoint[]> {
  try {
    const { data } = await axiosInstance.get<
      ApiResponse<MonthlyTrendRawPoint[]>
    >('/reports/monthly-trend', { params: { months: monthsCount, locale } });
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('reports.genericError')), {
      cause: error,
    });
  }
}

export async function getWalletUsageApi(
  dateFrom: string,
  dateTo: string,
): Promise<WalletUsageItem[]> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<WalletUsageItem[]>>(
      '/reports/wallet-usage',
      { params: { dateFrom, dateTo } },
    );
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('reports.genericError')), {
      cause: error,
    });
  }
}

export async function getTopSpendingApi(
  dateFrom: string,
  dateTo: string,
  limit: number,
): Promise<TopSpendingItem[]> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<TopSpendingItem[]>>(
      '/reports/top-spending',
      { params: { dateFrom, dateTo, limit } },
    );
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('reports.genericError')), {
      cause: error,
    });
  }
}

/** Total dompet, total investasi, dan pemasukan/pengeluaran/tabungan bulan ini dalam satu call. */
export async function getDashboardSummaryApi(
  month?: string,
): Promise<DashboardSummary> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<DashboardSummary>>(
      '/reports/dashboard-summary',
      { params: month ? { month } : undefined },
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('dashboard.genericError')),
      { cause: error },
    );
  }
}
