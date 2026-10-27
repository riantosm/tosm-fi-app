import { memo, useEffect, useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '@/navigation/paths';
import type { RootStackParamList } from '@/navigation/types';
import MainTabNavigator from '@/navigation/MainTabNavigator';
import { navigationRef } from '@/navigation/navigationRef';
import AppLockScreen from '@/screens/AppLock';
import AppLockPinScreen from '@/screens/AppLockPin';
import AppLockSetupScreen from '@/screens/AppLockSetup';
import BalanceCorrectionScreen from '@/screens/BalanceCorrection';
import BudgetDetailScreen from '@/screens/BudgetDetail';
import BudgetFormScreen from '@/screens/BudgetForm';
import BudgetsScreen from '@/screens/Budgets';
import CategoriesScreen from '@/screens/Categories';
import InstrumentDetailScreen from '@/screens/InstrumentDetail';
import InstrumentFormScreen from '@/screens/InstrumentForm';
import InvestmentAccountFormScreen from '@/screens/InvestmentAccountForm';
import InvestmentProfitLossScreen from '@/screens/InvestmentProfitLoss';
import InvestmentTransactionEditScreen from '@/screens/InvestmentTransactionEdit';
import InvestmentTransferScreen from '@/screens/InvestmentTransfer';
import InvestmentWithdrawScreen from '@/screens/InvestmentWithdraw';
import LoginScreen from '@/screens/Login';
import PayOccurrenceScreen from '@/screens/PayOccurrence';
import ProfileScreen from '@/screens/Profile';
import QuickAddScreen from '@/screens/QuickAdd';
import RecentTransactionsScreen from '@/screens/RecentTransactions';
import RegisterScreen from '@/screens/Register';
import ReportCategoryDetailScreen from '@/screens/ReportCategoryDetail';
import ReportsScreen from '@/screens/Reports';
import ScanReceiptScreen from '@/screens/ScanReceipt';
import ScheduleScreen from '@/screens/Schedule';
import ScheduleFormScreen from '@/screens/ScheduleForm';
import SettingsScreen from '@/screens/Settings';
import SettingsCurrencyScreen from '@/screens/SettingsCurrency';
import SettingsWalletNotificationScreen from '@/screens/SettingsWalletNotification';
import SettingsErrorLogScreen from '@/screens/SettingsErrorLog';
import SettingsUserApprovalScreen from '@/screens/SettingsUserApproval';
import TransactionFormScreen from '@/screens/TransactionForm';
import TransactionsScreen from '@/screens/Transactions';
import WalletScreen from '@/screens/Wallet';
import WalletFormScreen from '@/screens/WalletForm';
import { useAppSelector } from '@/store/hooks';
import { selectIsAppLocked } from '@/store/slices/appLockSlice';
import { useTheme } from '@/contexts/ThemeContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Guard auth memakai pola resmi React Navigation: grup layar dipilih dari state login,
 * jadi layar yang tidak sesuai tidak pernah ter-mount (tidak bisa di-navigate).
 * - RequireGuest: Login, Register (hanya saat belum login)
 * - RequireAuth: semua layar lain (hanya saat sudah login)
 * - Locked: login tapi kunci aplikasi aktif & terkunci → Beranda kunci, PIN, dan pintasan
 *   tanpa kunci (Catat cepat + Catat manual, Dompet saya, Transaksi terakhir).
 * Login/logout/buka kunci otomatis berpindah grup tanpa navigate manual.
 */
function RootNavigator() {
  const isLogin = useAppSelector(state => state.auth.isLogin);
  const isAdmin = useAppSelector(state => state.auth.user?.role === 'admin');
  const isLocked = useAppSelector(selectIsAppLocked);
  const { colors } = useTheme();

  // Terkunci ↔ terbuka: stack direset ke Beranda kunci / Dashboard. Tanpa ini NavigationContainer
  // mempertahankan route lama yang terdaftar di kedua grup (AppLockPin, Wallet, QuickAdd, …),
  // jadi setelah buka kunci user tertinggal di layar PIN tanpa tombol kembali.
  const wasLocked = useRef(isLocked);
  useEffect(() => {
    if (wasLocked.current === isLocked) {
      return;
    }
    wasLocked.current = isLocked;
    if (isLogin && navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: isLocked ? ROUTES.APP_LOCK : ROUTES.MAIN_TABS }],
      });
    }
  }, [isLocked, isLogin]);

  const modalOptions = {
    presentation: 'modal',
    animation: 'slide_from_bottom',
  } as const;
  const sheetOptions = {
    presentation: 'transparentModal',
    animation: 'fade',
    contentStyle: { backgroundColor: colors.transparent },
  } as const;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}
    >
      {isLogin && isLocked ? (
        // Locked
        <Stack.Group>
          <Stack.Screen
            name={ROUTES.APP_LOCK}
            component={AppLockScreen}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen
            name={ROUTES.APP_LOCK_PIN}
            component={AppLockPinScreen}
          />
          <Stack.Screen name={ROUTES.WALLET} component={WalletScreen} />
          <Stack.Screen
            name={ROUTES.RECENT_TRANSACTIONS}
            component={RecentTransactionsScreen}
          />
          <Stack.Group screenOptions={modalOptions}>
            <Stack.Screen name={ROUTES.QUICK_ADD} component={QuickAddScreen} />
            <Stack.Screen
              name={ROUTES.SCAN_RECEIPT}
              component={ScanReceiptScreen}
            />
          </Stack.Group>
          <Stack.Group screenOptions={sheetOptions}>
            <Stack.Screen
              name={ROUTES.TRANSACTION_FORM}
              component={TransactionFormScreen}
            />
          </Stack.Group>
        </Stack.Group>
      ) : isLogin ? (
        // RequireAuth
        <Stack.Group>
          <Stack.Screen name={ROUTES.MAIN_TABS} component={MainTabNavigator} />
          <Stack.Screen name={ROUTES.WALLET} component={WalletScreen} />
          <Stack.Screen name={ROUTES.CATEGORIES} component={CategoriesScreen} />
          <Stack.Screen name={ROUTES.SCHEDULE} component={ScheduleScreen} />
          <Stack.Screen name={ROUTES.BUDGETS} component={BudgetsScreen} />
          <Stack.Screen
            name={ROUTES.BUDGET_DETAIL}
            component={BudgetDetailScreen}
          />
          <Stack.Screen
            name={ROUTES.INSTRUMENT_DETAIL}
            component={InstrumentDetailScreen}
          />
          <Stack.Screen name={ROUTES.REPORTS} component={ReportsScreen} />
          <Stack.Screen
            name={ROUTES.REPORT_CATEGORY_DETAIL}
            component={ReportCategoryDetailScreen}
          />
          <Stack.Screen
            name={ROUTES.REPORT_TRANSACTIONS}
            component={TransactionsScreen}
          />
          <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
          <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
          <Stack.Screen
            name={ROUTES.SETTINGS_CURRENCY}
            component={SettingsCurrencyScreen}
          />
          <Stack.Screen
            name={ROUTES.SETTINGS_WALLET_NOTIFICATION}
            component={SettingsWalletNotificationScreen}
          />
          <Stack.Screen
            name={ROUTES.APP_LOCK_PIN}
            component={AppLockPinScreen}
          />
          <Stack.Screen
            name={ROUTES.APP_LOCK_SETUP}
            component={AppLockSetupScreen}
          />
          {isAdmin && (
            // Admin saja (setara gate role di web)
            <Stack.Group>
              <Stack.Screen
                name={ROUTES.SETTINGS_USER_APPROVAL}
                component={SettingsUserApprovalScreen}
              />
              <Stack.Screen
                name={ROUTES.SETTINGS_ERROR_LOG}
                component={SettingsErrorLogScreen}
              />
            </Stack.Group>
          )}
          <Stack.Group screenOptions={modalOptions}>
            <Stack.Screen name={ROUTES.QUICK_ADD} component={QuickAddScreen} />
            <Stack.Screen
              name={ROUTES.SCAN_RECEIPT}
              component={ScanReceiptScreen}
            />
          </Stack.Group>
          {/* Sheet form: modal transparan, layar di belakang tetap terlihat di balik scrim. */}
          <Stack.Group screenOptions={sheetOptions}>
            <Stack.Screen
              name={ROUTES.TRANSACTION_FORM}
              component={TransactionFormScreen}
            />
            <Stack.Screen
              name={ROUTES.PAY_OCCURRENCE}
              component={PayOccurrenceScreen}
            />
            <Stack.Screen
              name={ROUTES.WALLET_FORM}
              component={WalletFormScreen}
            />
            <Stack.Screen
              name={ROUTES.BALANCE_CORRECTION}
              component={BalanceCorrectionScreen}
            />
            <Stack.Screen
              name={ROUTES.SCHEDULE_FORM}
              component={ScheduleFormScreen}
            />
            <Stack.Screen
              name={ROUTES.BUDGET_FORM}
              component={BudgetFormScreen}
            />
            <Stack.Screen
              name={ROUTES.INSTRUMENT_FORM}
              component={InstrumentFormScreen}
            />
            <Stack.Screen
              name={ROUTES.INVESTMENT_ACCOUNT_FORM}
              component={InvestmentAccountFormScreen}
            />
            <Stack.Screen
              name={ROUTES.INVESTMENT_WITHDRAW}
              component={InvestmentWithdrawScreen}
            />
            <Stack.Screen
              name={ROUTES.INVESTMENT_PROFIT_LOSS}
              component={InvestmentProfitLossScreen}
            />
            <Stack.Screen
              name={ROUTES.INVESTMENT_TRANSFER}
              component={InvestmentTransferScreen}
            />
            <Stack.Screen
              name={ROUTES.INVESTMENT_TX_EDIT}
              component={InvestmentTransactionEditScreen}
            />
          </Stack.Group>
        </Stack.Group>
      ) : (
        // RequireGuest
        <Stack.Group screenOptions={{ animationTypeForReplace: 'pop' }}>
          <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
          <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

// AppShell merender ulang setiap route berubah (untuk bottom nav); navigator tidak perlu ikut.
export default memo(RootNavigator);
