import { memo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '@/navigation/paths';
import type { RootStackParamList } from '@/navigation/types';
import MainTabNavigator from '@/navigation/MainTabNavigator';
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
import RegisterScreen from '@/screens/Register';
import ReportsScreen from '@/screens/Reports';
import ScanReceiptScreen from '@/screens/ScanReceipt';
import ScheduleScreen from '@/screens/Schedule';
import ScheduleFormScreen from '@/screens/ScheduleForm';
import SettingsScreen from '@/screens/Settings';
import SettingsCurrencyScreen from '@/screens/SettingsCurrency';
import SettingsErrorLogScreen from '@/screens/SettingsErrorLog';
import SettingsUserApprovalScreen from '@/screens/SettingsUserApproval';
import TransactionFormScreen from '@/screens/TransactionForm';
import WalletScreen from '@/screens/Wallet';
import WalletFormScreen from '@/screens/WalletForm';
import { useAppSelector } from '@/store/hooks';
import { useTheme } from '@/contexts/ThemeContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Guard auth memakai pola resmi React Navigation: grup layar dipilih dari state login,
 * jadi layar yang tidak sesuai tidak pernah ter-mount (tidak bisa di-navigate).
 * - RequireGuest: Login, Register (hanya saat belum login)
 * - RequireAuth: semua layar lain (hanya saat sudah login)
 * Login/logout otomatis berpindah grup tanpa navigate manual.
 */
function RootNavigator() {
  const isLogin = useAppSelector(state => state.auth.isLogin);
  const isAdmin = useAppSelector(state => state.auth.user?.role === 'admin');
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}
    >
      {isLogin ? (
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
          <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
          <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
          <Stack.Screen
            name={ROUTES.SETTINGS_CURRENCY}
            component={SettingsCurrencyScreen}
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
          <Stack.Group
            screenOptions={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          >
            <Stack.Screen name={ROUTES.QUICK_ADD} component={QuickAddScreen} />
            <Stack.Screen
              name={ROUTES.SCAN_RECEIPT}
              component={ScanReceiptScreen}
            />
          </Stack.Group>
          {/* Sheet form: modal transparan, layar di belakang tetap terlihat di balik scrim. */}
          <Stack.Group
            screenOptions={{
              presentation: 'transparentModal',
              animation: 'fade',
              contentStyle: { backgroundColor: colors.transparent },
            }}
          >
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
