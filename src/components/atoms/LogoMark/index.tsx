import { StyleSheet, View } from 'react-native';
import { Sprout } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/metrics';

export type LogoMarkSize = 'xs' | 'sm' | 'md' | 'lg';

export interface LogoMarkProps {
  /** xs 20 · sm 32 (app bar, auth) · md 42 · lg 56. */
  size?: LogoMarkSize;
}

const SIZES: Record<LogoMarkSize, { box: number; icon: number }> = {
  xs: { box: 20, icon: 11 },
  sm: { box: 32, icon: 16 },
  md: { box: 42, icon: 20 },
  lg: { box: 56, icon: 28 },
};

/** Satu-satunya bentuk logo di dalam app: lingkaran primary + sprout. */
export default function LogoMark({ size = 'sm' }: LogoMarkProps) {
  const { box, icon } = SIZES[size];
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.base, { width: box, height: box }]}
    >
      <Sprout size={icon} color={colors.primaryFg} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
});
