import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ROUTES } from '@/navigation/paths';

export type MainTabParamList = {
  [ROUTES.DASHBOARD]: undefined;
  [ROUTES.TRANSACTIONS]: undefined;
  [ROUTES.INVESTMENT]: undefined;
};

export type RootStackParamList = {
  [ROUTES.LOGIN]: undefined;
  [ROUTES.REGISTER]: undefined;

  [ROUTES.MAIN_TABS]: NavigatorScreenParams<MainTabParamList>;
  [ROUTES.WALLET]: undefined;
  [ROUTES.CATEGORIES]: undefined;
  [ROUTES.SCHEDULE]: undefined;
  [ROUTES.BUDGETS]: undefined;
  [ROUTES.REPORTS]: undefined;
  [ROUTES.PROFILE]: undefined;
  [ROUTES.SETTINGS]: undefined;
  [ROUTES.SETTINGS_CURRENCY]: undefined;
  [ROUTES.SETTINGS_USER_APPROVAL]: undefined;
  [ROUTES.SETTINGS_ERROR_LOG]: undefined;

  [ROUTES.QUICK_ADD]: undefined;
  [ROUTES.SCAN_RECEIPT]: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
