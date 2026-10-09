/** Satu-satunya sumber nama route (stack dan tab). Jangan menulis string route langsung di layar. */
export const ROUTES = {
  // Guest
  LOGIN: 'Login',
  REGISTER: 'Register',

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
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  SETTINGS_CURRENCY: 'SettingsCurrency',
  SETTINGS_USER_APPROVAL: 'SettingsUserApproval',
  SETTINGS_ERROR_LOG: 'SettingsErrorLog',
  INSTRUMENT_DETAIL: 'InstrumentDetail',

  // Modal
  QUICK_ADD: 'QuickAdd',
  SCAN_RECEIPT: 'ScanReceipt',
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
  ROUTES.SETTINGS,
  ROUTES.SETTINGS_CURRENCY,
  ROUTES.SETTINGS_USER_APPROVAL,
  ROUTES.SETTINGS_ERROR_LOG,
  ROUTES.PROFILE,
];

/** Layar tanpa bottom nav (guest + modal). */
export const ROUTES_WITHOUT_NAV: readonly RouteName[] = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.QUICK_ADD,
  ROUTES.SCAN_RECEIPT,
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
