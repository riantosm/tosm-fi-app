export type InvestmentTransactionType = 'in' | 'out' | 'transfer' | 'pl';

export interface InvestmentTransaction {
  idInvestmentTransaction: string;
  type: InvestmentTransactionType;
  date: string;
  idInstrument: string;
  idInvestmentAccount: string;
  idInstrumentTo: string | null;
  idInvestmentAccountTo: string | null;
  /** Besaran tampilan: in/out/transfer = nominal positif; pl = delta bertanda (nilai baru - lama). */
  amount: number;
  /**
   * Delta bertanda yang BENAR-BENAR diterapkan ke investedAmount/currentValue akun sumber
   * saat entri dibuat (invested tidak pernah di bawah 0), supaya edit/hapus bisa dibalik persis.
   * Untuk transfer, akun tujuan selalu menerima pasangan (+amount, +amount).
   */
  investedDelta: number;
  currentDelta: number;
  /** in: id transaksi pengeluaran dompet. out: id transaksi pemasukan dompet jika disetor ke dompet. transfer/pl: null. */
  idTransaction: string | null;
  note?: string;
}

export interface UpdateInvestmentTransactionInput {
  amount: number;
  date: string;
  note?: string;
}

export interface MoneyInInput {
  idInstrument: string;
  idInvestmentAccount: string;
  amount: number;
  date: string;
  idTransaction: string;
}

export interface MoneyOutInput {
  idInstrument: string;
  idInvestmentAccount: string;
  amount: number;
  date: string;
  idTransaction: string | null;
  note?: string;
}

export interface TransferInput {
  idInstrument: string;
  idInvestmentAccount: string;
  idInstrumentTo: string;
  idInvestmentAccountTo: string;
  amount: number;
  date: string;
}

export interface ProfitLossInput {
  idInstrument: string;
  idInvestmentAccount: string;
  newCurrentValue: number;
  date: string;
}

export type InvestmentTransactionSortOption =
  | 'dateDesc'
  | 'dateAsc'
  | 'amountDesc'
  | 'amountAsc';

export interface InvestmentTransactionListParams {
  /** Cocok dengan idInstrument ATAU idInstrumentTo (sumber atau tujuan transfer). */
  idInstrument?: string;
  /** Cocok dengan idInvestmentAccount ATAU idInvestmentAccountTo. */
  idInvestmentAccount?: string;
  type?: InvestmentTransactionType;
  /** "YYYY-MM-DD" */
  dateFrom?: string;
  /** "YYYY-MM-DD" */
  dateTo?: string;
  /** Cocok dengan note, atau nama instrumen/akun. */
  search?: string;
  sort?: InvestmentTransactionSortOption;
  page?: number;
  limit?: number;
}

export interface InvestmentTransactionListResult {
  investmentTransactions: InvestmentTransaction[];
  total: number | null;
  page: number | null;
  limit: number | null;
  totalPages: number | null;
}

export type NetWorthTimelineGranularity = 'day' | 'month' | 'year';

export interface NetWorthTimelineParams {
  granularity: NetWorthTimelineGranularity;
  /** "YYYY-MM-DD" */
  dateFrom: string;
  /** "YYYY-MM-DD" */
  dateTo: string;
  locale: string;
  /** Subset id instrumen; kosongkan untuk seluruh portofolio. */
  idInstrument?: string[];
}

export interface NetWorthTimelinePoint {
  label: string;
  date: string;
  invested: number;
  current: number;
}

export interface TimelinePoint {
  /** Tanggal ISO entri ledger yang menghasilkan titik ini (tidak di-bucket). */
  date: string;
  /** Total berjalan per titik ini. */
  invested: number;
  current: number;
}

export interface InvestmentTimelinesResult {
  /** Key: idInvestmentAccount. */
  accounts: Record<string, TimelinePoint[]>;
  /** Key: idInstrument. */
  instruments: Record<string, TimelinePoint[]>;
}
