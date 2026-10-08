import { useState } from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { LogBox, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import '@/i18n';
import { useLanguageSync } from '@/hooks/useLanguageSync';
import { useSessionBootstrap } from '@/hooks/useSessionBootstrap';
import AppBottomNav from '@/navigation/AppBottomNav';
import { navigationRef } from '@/navigation/navigationRef';
import RootNavigator from '@/navigation/RootNavigator';
import { persistor, store } from '@/store';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/colors';

// Warning dev dari moti 0.30 (bukan kode app): moti mengimpor SafeAreaView lama milik RN dan
// mengirim dependency array ke Reanimated. Aman diabaikan; hapus saat moti diperbarui.
LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
  '[Reanimated] Dependencies should only be used on the web',
]);

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

/** Efek global yang butuh store (dijalankan setelah rehydrate) + shell navigasi. */
function AppShell() {
  useLanguageSync();
  useSessionBootstrap();
  const isLogin = useAppSelector(state => state.auth.isLogin);
  const [currentRoute, setCurrentRoute] = useState<string>();
  const syncRoute = () =>
    setCurrentRoute(navigationRef.getCurrentRoute()?.name);

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navigationTheme}
      onReady={syncRoute}
      onStateChange={syncRoute}
    >
      <RootNavigator />
      {isLogin && <AppBottomNav currentRoute={currentRoute} />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" />
          <AppShell />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
