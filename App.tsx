import { useMemo, useState } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { LogBox, StatusBar } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import '@/i18n';
import { AssistantChatProvider } from '@/contexts/AssistantChatContext';
import { MoreSheetProvider } from '@/contexts/MoreSheetContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { ToastHost, ToastProvider } from '@/contexts/ToastContext';
import { useBackToExit } from '@/hooks/useBackToExit';
import { useLanguageSync } from '@/hooks/useLanguageSync';
import { useScheduleReminders } from '@/hooks/useScheduleReminders';
import { useSessionBootstrap } from '@/hooks/useSessionBootstrap';
import AppBottomNav from '@/navigation/AppBottomNav';
import { navigationRef } from '@/navigation/navigationRef';
import { ROUTES_WITHOUT_NAV } from '@/navigation/paths';
import RootNavigator from '@/navigation/RootNavigator';
import { persistor, store } from '@/store';
import { useAppSelector } from '@/store/hooks';
import { layout, spacing } from '@/theme/metrics';

// Warning dev dari moti 0.30 (bukan kode app): moti mengimpor SafeAreaView lama milik RN dan
// mengirim dependency array ke Reanimated. Aman diabaikan; hapus saat moti diperbarui.
LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
  '[Reanimated] Dependencies should only be used on the web',
]);

/** Efek global yang butuh store (dijalankan setelah rehydrate) + shell navigasi. */
function AppShell() {
  useLanguageSync();
  useSessionBootstrap();
  useBackToExit();
  useScheduleReminders();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const isLogin = useAppSelector(state => state.auth.isLogin);
  const [currentRoute, setCurrentRoute] = useState<string>();
  const navVisible =
    isLogin &&
    !!currentRoute &&
    !(ROUTES_WITHOUT_NAV as readonly string[]).includes(currentRoute);
  const syncRoute = () =>
    setCurrentRoute(navigationRef.getCurrentRoute()?.name);

  const navigationTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.bg,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
      },
    };
  }, [colors, isDark]);

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <NavigationContainer
        ref={navigationRef}
        theme={navigationTheme}
        onReady={syncRoute}
        onStateChange={syncRoute}
      >
        <RootNavigator />
        {isLogin && <AppBottomNav currentRoute={currentRoute} />}
      </NavigationContainer>
      <ToastHost
        offset={
          Math.max(insets.bottom, spacing.xl) +
          (navVisible ? layout.bottomNavHeight + spacing.md : spacing.sm)
        }
      />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <SafeAreaProvider>
            <ToastProvider>
              <MoreSheetProvider>
                <AssistantChatProvider>
                  <AppShell />
                </AssistantChatProvider>
              </MoreSheetProvider>
            </ToastProvider>
          </SafeAreaProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
