import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ROUTES } from '@/navigation/paths';
import type {
  Budget,
  Instrument,
  InvestmentAccount,
  InvestmentTransaction,
  Schedule,
  ScheduleOccurrence,
  Transaction,
  WalletAccount,
} from '@/types';
import type { CategorySlice } from '@/utils/categoryBreakdown';

/** Filter awal halaman Transaksi (dari Dashboard / Laporan). `requestId` membuat navigasi berulang tetap terdeteksi. */
export interface TransactionsParams {
  requestId: number;
  type?: 'income' | 'expense';
  idCategory?: string;
  idSubCategory?: string;
  /** Subkategori "Lainnya" (tanpa subkategori): sembunyikan semua subkategori ini. */
  excludeSubCategoryIds?: string[];
  /** Rentang tanggal "YYYY-MM-DD" (periode laporan); tab bulan = bulan ini bila masuk rentang, selain itu bulan `dateTo`. */
  dateFrom?: string;
  dateTo?: string;
  focusSearch?: boolean;
}

/**
 * Layar PIN: `unlock` = buka app yang terkunci, `disable` = konfirmasi mematikan kunci,
 * `change` = verifikasi PIN lama sebelum Ubah PIN.
 */
export type AppLockPinMode = 'unlock' | 'disable' | 'change';

/** Buat PIN: `enable` = mengaktifkan kunci aplikasi, `change` = ganti PIN. */
export type AppLockSetupMode = 'enable' | 'change';

export type MainTabParamList = {
  [ROUTES.DASHBOARD]: undefined;
  [ROUTES.TRANSACTIONS]: TransactionsParams | undefined;
  [ROUTES.INVESTMENT]: undefined;
};

export type RootStackParamList = {
  [ROUTES.LOGIN]: undefined;
  [ROUTES.REGISTER]: undefined;

  [ROUTES.APP_LOCK]: undefined;
  [ROUTES.APP_LOCK_PIN]: { mode: AppLockPinMode };
  [ROUTES.APP_LOCK_SETUP]: { mode: AppLockSetupMode };
  [ROUTES.RECENT_TRANSACTIONS]: undefined;

  [ROUTES.MAIN_TABS]: NavigatorScreenParams<MainTabParamList>;
  [ROUTES.WALLET]: undefined;
  [ROUTES.CATEGORIES]: undefined;
  [ROUTES.SCHEDULE]: undefined;
  [ROUTES.BUDGETS]: undefined;
  [ROUTES.BUDGET_DETAIL]: { idBudget: string };
  [ROUTES.INSTRUMENT_DETAIL]: { idInstrument: string };
  [ROUTES.REPORTS]: undefined;
  /** Rincian satu kategori dari Laporan; `subtitle` = rentang periode laporan. */
  [ROUTES.REPORT_CATEGORY_DETAIL]: {
    category: CategorySlice;
    subtitle: string;
    dateFrom: string;
    dateTo: string;
  };
  /** Layar Transaksi yang di-push di atas Laporan, jadi back kembali ke halaman sebelumnya. */
  [ROUTES.REPORT_TRANSACTIONS]: TransactionsParams;
  [ROUTES.PROFILE]: undefined;
  [ROUTES.SETTINGS]: undefined;
  [ROUTES.SETTINGS_CURRENCY]: undefined;
  [ROUTES.SETTINGS_WALLET_NOTIFICATION]: undefined;
  [ROUTES.SETTINGS_USER_APPROVAL]: undefined;
  [ROUTES.SETTINGS_ERROR_LOG]: undefined;

  [ROUTES.QUICK_ADD]: undefined;
  [ROUTES.SCAN_RECEIPT]: undefined;
  [ROUTES.PRO_CHECKOUT]: undefined;
  /** Tanpa transaksi = catat baru. */
  [ROUTES.TRANSACTION_FORM]: { transaction?: Transaction } | undefined;
  [ROUTES.PAY_OCCURRENCE]: { occurrence: ScheduleOccurrence };
  /** Tanpa dompet = tambah dompet baru. */
  [ROUTES.WALLET_FORM]: { wallet?: WalletAccount } | undefined;
  /** Dengan transaksi = edit koreksi yang sudah ada. */
  [ROUTES.BALANCE_CORRECTION]: { idWallet: string; transaction?: Transaction };
  /** Tanpa jadwal = tambah jadwal baru. */
  [ROUTES.SCHEDULE_FORM]: { schedule?: Schedule } | undefined;
  /** Tanpa budget = tambah budget baru. */
  [ROUTES.BUDGET_FORM]: { budget?: Budget } | undefined;
  /** Tanpa instrumen = tambah instrumen baru. */
  [ROUTES.INSTRUMENT_FORM]: { instrument?: Instrument } | undefined;
  /** Tanpa akun = tambah akun di instrumen itu. */
  [ROUTES.INVESTMENT_ACCOUNT_FORM]: {
    idInstrument: string;
    account?: InvestmentAccount;
  };
  [ROUTES.INVESTMENT_WITHDRAW]: {
    idInstrument: string;
    idInvestmentAccount: string;
  };
  [ROUTES.INVESTMENT_PROFIT_LOSS]: {
    idInstrument: string;
    idInvestmentAccount: string;
  };
  [ROUTES.INVESTMENT_TRANSFER]: { idInvestmentAccount?: string } | undefined;
  [ROUTES.INVESTMENT_TX_EDIT]: { transaction: InvestmentTransaction };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
