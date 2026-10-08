import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '@/navigation/paths';
import type { RootStackParamList } from '@/navigation/types';
import MainTabNavigator from '@/navigation/MainTabNavigator';
import BudgetsScreen from '@/screens/Budgets';
import CategoriesScreen from '@/screens/Categories';
import LoginScreen from '@/screens/Login';
import ProfileScreen from '@/screens/Profile';
import QuickAddScreen from '@/screens/QuickAdd';
import RegisterScreen from '@/screens/Register';
import ReportsScreen from '@/screens/Reports';
import ScanReceiptScreen from '@/screens/ScanReceipt';
import ScheduleScreen from '@/screens/Schedule';
import SettingsScreen from '@/screens/Settings';
import SettingsCurrencyScreen from '@/screens/SettingsCurrency';
import SettingsErrorLogScreen from '@/screens/SettingsErrorLog';
import SettingsUserApprovalScreen from '@/screens/SettingsUserApproval';
import WalletScreen from '@/screens/Wallet';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Guard auth memakai pola resmi React Navigation: grup layar dipilih dari state login,
 * jadi layar yang tidak sesuai tidak pernah ter-mount (tidak bisa di-navigate).
 * - RequireGuest: Login, Register (hanya saat belum login)
 * - RequireAuth: semua layar lain (hanya saat sudah login)
 * Login/logout otomatis berpindah grup tanpa navigate manual.
 */
export default function RootNavigator() {
  const isLogin = useAppSelector(state => state.auth.isLogin);
  const isAdmin = useAppSelector(state => state.auth.user?.role === 'admin');

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
