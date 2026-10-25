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
import AppLockOfferSheet from '@/components/organisms/AppLockOfferSheet';
import ErrorBoundary from '@/components/organisms/ErrorBoundary';
import { AssistantChatProvider } from '@/contexts/AssistantChatContext';
import { MoreSheetProvider } from '@/contexts/MoreSheetContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { ToastHost, ToastProvider } from '@/contexts/ToastContext';
import { useAppLockLifecycle } from '@/hooks/useAppLockLifecycle';
import { useBackToExit } from '@/hooks/useBackToExit';
import { useLanguageSync } from '@/hooks/useLanguageSync';
import { useScheduleReminders } from '@/hooks/useScheduleReminders';
import { useSessionBootstrap } from '@/hooks/useSessionBootstrap';
import { useWalletNotification } from '@/hooks/useWalletNotification';
import AppBottomNav from '@/navigation/AppBottomNav';
import { navigationRef } from '@/navigation/navigationRef';
import { ROUTES, ROUTES_WITHOUT_NAV } from '@/navigation/paths';
import RootNavigator from '@/navigation/RootNavigator';
import { isAppLockSupported } from '@/services/native/appLock';
import { persistor, store } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  dismissAppLockOffer,
  selectIsAppLocked,
} from '@/store/slices/appLockSlice';
import { layout, spacing } from '@/theme/metrics';
import { setupGlobalErrorLogging } from '@/utils/crashLogger';

// Warning dev dari moti 0.30 (bukan kode app): moti mengimpor SafeAreaView lama milik RN dan
// mengirim dependency array ke Reanimated. Aman diabaikan; hapus saat moti diperbarui.
// Crash di luar render (handler, timer, promise) → Log Error admin, sama dengan web.
setupGlobalErrorLogging();

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
  useWalletNotification();
  useAppLockLifecycle();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const isLogin = useAppSelector(state => state.auth.isLogin);
  const isLocked = useAppSelector(selectIsAppLocked);
  const offerPending = useAppSelector(state => state.appLock.offerPending);
  const [currentRoute, setCurrentRoute] = useState<string>();
  const showNav = isLogin && !isLocked;
  const navVisible =
    showNav &&
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
        {showNav && <AppBottomNav currentRoute={currentRoute} />}
      </NavigationContainer>
      {/* Tawaran kunci aplikasi sekali setelah login, muncul di Dashboard. */}
      <AppLockOfferSheet
        visible={
          isAppLockSupported &&
          offerPending &&
          showNav &&
          currentRoute === ROUTES.DASHBOARD
        }
        onLater={() => dispatch(dismissAppLockOffer())}
        onEnable={() => {
          dispatch(dismissAppLockOffer());
          navigationRef.navigate(ROUTES.APP_LOCK_SETUP, { mode: 'enable' });
        }}
      />
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
                  <ErrorBoundary>
                    <AppShell />
                  </ErrorBoundary>
                </AssistantChatProvider>
              </MoreSheetProvider>
            </ToastProvider>
          </SafeAreaProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
