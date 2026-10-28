/** Satu-satunya sumber nama route (stack dan tab). Jangan menulis string route langsung di layar. */
export const ROUTES = {
  // Guest
  LOGIN: 'Login',
  REGISTER: 'Register',

  // Kunci aplikasi (Android): Beranda kunci + PIN saat terkunci, Buat/Ubah PIN dari Pengaturan
  APP_LOCK: 'AppLock',
  APP_LOCK_PIN: 'AppLockPin',
  APP_LOCK_SETUP: 'AppLockSetup',
  /** Pintasan tanpa kunci: transaksi 3 hari terakhir (hanya lihat). */
  RECENT_TRANSACTIONS: 'RecentTransactions',

  // Tab (di dalam MAIN_TABS)
  MAIN_TABS: 'MainTabs',
  DASHBOARD: 'Dashboard',
  TRANSACTIONS: 'Transactions',
  INVESTMENT: 'Investment',

  // Stack (dibuka dari sheet Lainnya / layar lain)
  WALLET: 'Wallet',
  CATEGORIES: 'Categories',
  SCHEDULE: 'Schedule',
  BUDGETS: 'Budgets',
  BUDGET_DETAIL: 'BudgetDetail',
  REPORTS: 'Reports',
  REPORT_CATEGORY_DETAIL: 'ReportCategoryDetail',
  /** Transaksi berfilter dari Laporan (stack, bukan tab). */
  REPORT_TRANSACTIONS: 'ReportTransactions',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  SETTINGS_CURRENCY: 'SettingsCurrency',
  SETTINGS_WALLET_NOTIFICATION: 'SettingsWalletNotification',
  SETTINGS_USER_APPROVAL: 'SettingsUserApproval',
  SETTINGS_ERROR_LOG: 'SettingsErrorLog',
  INSTRUMENT_DETAIL: 'InstrumentDetail',

  // Modal
  QUICK_ADD: 'QuickAdd',
  SCAN_RECEIPT: 'ScanReceipt',
  PRO_CHECKOUT: 'ProCheckout',
  TRANSACTION_FORM: 'TransactionForm',
  PAY_OCCURRENCE: 'PayOccurrence',
  WALLET_FORM: 'WalletForm',
  BALANCE_CORRECTION: 'BalanceCorrection',
  SCHEDULE_FORM: 'ScheduleForm',
  BUDGET_FORM: 'BudgetForm',
  INSTRUMENT_FORM: 'InstrumentForm',
  INVESTMENT_ACCOUNT_FORM: 'InvestmentAccountForm',
  INVESTMENT_WITHDRAW: 'InvestmentWithdraw',
  INVESTMENT_PROFIT_LOSS: 'InvestmentProfitLoss',
  INVESTMENT_TRANSFER: 'InvestmentTransfer',
  INVESTMENT_TX_EDIT: 'InvestmentTransactionEdit',
} as const;

type RouteName = (typeof ROUTES)[keyof typeof ROUTES];

/** Halaman yang dibuka dari sheet Lainnya (atau turunannya): slot Lainnya ditandai aktif. */
export const MORE_ROUTES: readonly RouteName[] = [
  ROUTES.WALLET,
  ROUTES.CATEGORIES,
  ROUTES.SCHEDULE,
  ROUTES.BUDGETS,
  ROUTES.BUDGET_DETAIL,
  ROUTES.REPORTS,
  ROUTES.REPORT_CATEGORY_DETAIL,
  ROUTES.REPORT_TRANSACTIONS,
  ROUTES.SETTINGS,
  ROUTES.SETTINGS_CURRENCY,
  ROUTES.SETTINGS_WALLET_NOTIFICATION,
  ROUTES.SETTINGS_USER_APPROVAL,
  ROUTES.SETTINGS_ERROR_LOG,
  ROUTES.PROFILE,
];

/** Layar tanpa bottom nav (guest + kunci aplikasi + modal). */
export const ROUTES_WITHOUT_NAV: readonly RouteName[] = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.APP_LOCK,
  ROUTES.APP_LOCK_PIN,
  ROUTES.APP_LOCK_SETUP,
  ROUTES.RECENT_TRANSACTIONS,
  ROUTES.QUICK_ADD,
  ROUTES.SCAN_RECEIPT,
  ROUTES.PRO_CHECKOUT,
  ROUTES.TRANSACTION_FORM,
  ROUTES.PAY_OCCURRENCE,
  ROUTES.WALLET_FORM,
  ROUTES.BALANCE_CORRECTION,
  ROUTES.SCHEDULE_FORM,
  ROUTES.BUDGET_FORM,
  ROUTES.INSTRUMENT_FORM,
  ROUTES.INVESTMENT_ACCOUNT_FORM,
  ROUTES.INVESTMENT_WITHDRAW,
  ROUTES.INVESTMENT_PROFIT_LOSS,
  ROUTES.INVESTMENT_TRANSFER,
  ROUTES.INVESTMENT_TX_EDIT,
];
