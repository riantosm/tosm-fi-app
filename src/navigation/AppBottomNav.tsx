import { StackActions } from '@react-navigation/native';
import {
  ArrowLeftRight,
  LayoutGrid,
  Menu,
  Sparkles,
  TrendingUp,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import TabBar from '@/components/organisms/TabBar';
import { useMoreSheet } from '@/contexts/MoreSheetContext';
import MoreMenuSheet, { type MoreRoute } from '@/navigation/MoreMenuSheet';
import { navigationRef } from '@/navigation/navigationRef';
import { MORE_ROUTES, ROUTES, ROUTES_WITHOUT_NAV } from '@/navigation/paths';
import type { MainTabParamList } from '@/navigation/types';

type TabRoute = keyof MainTabParamList;

const TABS: { route: TabRoute; labelKey: string; Icon: typeof LayoutGrid }[] = [
  { route: ROUTES.DASHBOARD, labelKey: 'nav.dashboard', Icon: LayoutGrid },
  {
    route: ROUTES.TRANSACTIONS,
    labelKey: 'nav.transactions',
    Icon: ArrowLeftRight,
  },
  { route: ROUTES.INVESTMENT, labelKey: 'nav.investment', Icon: TrendingUp },
];

export interface AppBottomNavProps {
  /** Nama route paling atas saat ini (dari NavigationContainer). */
  currentRoute?: string;
}

/**
 * Bottom nav global (DESIGN_SYSTEM.md §5.4): Beranda · Transaksi · AI · Investasi · Lainnya.
 * Dirender di atas semua layar login kecuali modal; Lainnya membuka sheet, bukan halaman.
 */
export default function AppBottomNav({ currentRoute }: AppBottomNavProps) {
  const { t } = useTranslation();
  const {
    isOpen: sheetOpen,
    open: openSheet,
    close: closeSheet,
  } = useMoreSheet();

  const hidden =
    !currentRoute ||
    (ROUTES_WITHOUT_NAV as readonly string[]).includes(currentRoute);
  const onMorePage = (MORE_ROUTES as readonly string[]).includes(
    currentRoute ?? '',
  );

  const goToTab = (route: TabRoute) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(ROUTES.MAIN_TABS, { screen: route });
    }
  };

  const goToMore = (route: MoreRoute) => {
    closeSheet();
    if (!navigationRef.isReady() || currentRoute === route) {
      return;
    }
    // Antar-halaman Lainnya: ganti layar, jangan menumpuk stack.
    if (onMorePage) {
      navigationRef.dispatch(StackActions.replace(route));
    } else {
      navigationRef.navigate(route);
    }
  };

  return (
    <>
      {!hidden && (
        <TabBar
          items={[
            ...TABS.map(({ route, labelKey, Icon }) => ({
              key: route,
              label: t(labelKey),
              renderIcon: (color: string, size: number) => (
                <Icon color={color} size={size} />
              ),
              active:
                !sheetOpen &&
                (currentRoute === route ||
                  // Detail instrumen adalah turunan tab Investasi.
                  (route === ROUTES.INVESTMENT &&
                    currentRoute === ROUTES.INSTRUMENT_DETAIL)),
              onPress: () => goToTab(route),
            })),
            {
              key: 'more',
              label: t('nav.more'),
              renderIcon: (color: string, size: number) => (
                <Menu color={color} size={size} />
              ),
              active: sheetOpen || onMorePage,
              onPress: openSheet,
            },
          ]}
          centerAction={{
            label: t('nav.quickAdd'),
            renderIcon: (color, size) => <Sparkles color={color} size={size} />,
            onPress: () =>
              navigationRef.isReady() &&
              navigationRef.navigate(ROUTES.QUICK_ADD),
          }}
        />
      )}
      <MoreMenuSheet
        visible={sheetOpen}
        onClose={closeSheet}
        onNavigate={goToMore}
      />
    </>
  );
}
