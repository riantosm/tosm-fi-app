import type { CategoryType } from './category.types';

export type TransactionType = CategoryType | 'transfer' | 'correction';

export interface Transaction {
  idTransaction: string;
  type: TransactionType;
  idWallet: string | null;
  idCategory: string | null;
  idSubCategory: string | null;
  idWalletFrom: string | null;
  idWalletTo: string | null;
  title: string;
  notes: string;
  amount: number;
  date: string;
}

export type TransactionInput = Omit<Transaction, 'idTransaction'>;

export type TransactionSortOption =
  | 'dateDesc'
  | 'dateAsc'
  | 'amountDesc'
  | 'amountAsc';

export type TransactionFilterMode = 'include' | 'exclude';

export interface TransactionListParams {
  /** "YYYY-MM" */
  month?: string;
  type?: TransactionType;
  /** Satu id atau beberapa id dipisah koma. */
  idWallet?: string;
  /** Default "include"; "exclude" menyembunyikan transaksi yang menyentuh `idWallet`. */
  walletMode?: TransactionFilterMode;
  /** Satu id atau beberapa id dipisah koma. */
  idCategory?: string;
  /** Default "include"; "exclude" menyembunyikan transaksi di `idCategory`. */
  categoryMode?: TransactionFilterMode;
  /** Satu id atau beberapa id dipisah koma. */
  idSubCategory?: string;
  /** Default "include"; "exclude" menyembunyikan transaksi di `idSubCategory`. */
  subCategoryMode?: TransactionFilterMode;
  /** "YYYY-MM-DD" */
  dateFrom?: string;
  /** "YYYY-MM-DD" */
  dateTo?: string;
  search?: string;
  sort?: TransactionSortOption;
  page?: number;
  limit?: number;
}

export interface TransactionSubCategoryBreakdown {
  idSubCategory: string | null;
  nameSubCategory: string | null;
  icon: string | null;
  amount: number;
  transactionCount: number;
  /** Persentase terhadap total kategori induknya. */
  percentage: number;
}

export interface TransactionCategoryBreakdown {
  idCategory: string;
  nameCategory: string;
  color: string;
  icon: string;
  amount: number;
  transactionCount: number;
  /** Persentase terhadap total pengeluaran. */
  percentage: number;
  subCategoryBreakdown: TransactionSubCategoryBreakdown[];
}

export interface TransactionSummary {
  income: number;
  expense: number;
  net: number;
  /** Hanya pengeluaran, urut menurun berdasarkan amount. */
  categoryBreakdown: TransactionCategoryBreakdown[];
}

export interface TransactionListResult {
  transactions: Transaction[];
  total: number | null;
  page: number | null;
  limit: number | null;
  totalPages: number | null;
  summary: TransactionSummary;
}
