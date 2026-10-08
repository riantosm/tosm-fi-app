import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';

/** Ref NavigationContainer, dipakai shell di luar navigator (bottom nav global). */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
