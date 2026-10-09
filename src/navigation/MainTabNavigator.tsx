import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ROUTES } from '@/navigation/paths';
import type { MainTabParamList } from '@/navigation/types';
import DashboardScreen from '@/screens/Dashboard';
import InvestmentScreen from '@/screens/Investment';
import TransactionsScreen from '@/screens/Transactions';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Tab utama. Tab bar bawaan disembunyikan: bottom nav dirender global oleh `AppBottomNav`
 * supaya tetap terlihat di halaman stack (Pengaturan, Dompet, …) seperti di design.
 */
const hideTabBar = () => null;

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        // Tab yang tidak aktif tidak ikut dirender ulang (lihat enableFreeze di index.js).
        freezeOnBlur: true,
      }}
      tabBar={hideTabBar}
    >
      <Tab.Screen name={ROUTES.DASHBOARD} component={DashboardScreen} />
      <Tab.Screen name={ROUTES.TRANSACTIONS} component={TransactionsScreen} />
      <Tab.Screen name={ROUTES.INVESTMENT} component={InvestmentScreen} />
    </Tab.Navigator>
  );
}
