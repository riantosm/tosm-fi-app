import type { TransactionCategoryBreakdown } from './transaction.types';

export interface ReportMetricDelta {
  value: number;
  /** Persentase perubahan vs periode sebelumnya dengan panjang yang sama. */
  changePercent: number;
}

export interface ReportSummary {
  totalIncome: ReportMetricDelta;
  totalExpense: ReportMetricDelta;
  netCashFlow: ReportMetricDelta;
  transactionCount: ReportMetricDelta;
}

/** Hasil `GET /reports/summary` yang sudah dipisah: kartu ringkasan + breakdown kategori. */
export interface ReportSummaryResult {
  summary: ReportSummary;
  categoryBreakdown: TransactionCategoryBreakdown[];
}

export interface CashFlowPoint {
  label: string;
  income: number;
  expense: number;
  isToday: boolean;
}

/** Bentuk mentah `GET /reports/monthly-trend` — pemasukan & pengeluaran per bulan. */
export interface MonthlyTrendRawPoint {
  label: string;
  income: number;
  expense: number;
}

export interface WalletUsageItem {
  idWallet: string;
  nameWallet: string;
  color: string;
  transactionCount: number;
  percentage: number;
}

export interface TopSpendingItem {
  idTransaction: string;
  rank: number;
  title: string;
  categoryName: string;
  subCategoryName: string | null;
  amount: number;
  date: string;
}

export type FinancialHealthStatus =
  | 'excellent'
  | 'good'
  | 'fair'
  | 'needsAttention';

export interface FinancialHealth {
  score: number;
  status: FinancialHealthStatus;
  savingRate: number;
  isCashFlowPositive: boolean;
  isExpenseStable: boolean;
}

export interface DashboardSummary {
  wallet: { totalBalance: number; walletCount: number };
  investment: { totalCurrentValue: number; instrumentCount: number };
  monthly: {
    income: number;
    expense: number;
    savings: number;
    investmentInflow: number;
  };
  financialHealth: FinancialHealth;
}
