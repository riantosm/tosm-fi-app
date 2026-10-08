import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PressableScale from '@/components/atoms/PressableScale';
import { colors } from '@/theme/colors';
import { layout, radius, spacing } from '@/theme/metrics';
import { shadows } from '@/theme/shadows';
import { transitions } from '@/utils/motion';

export interface TabBarItem {
  key: string;
  label: string;
  /** Render ikon (ukuran 21) dengan warna state. */
  renderIcon: (color: string, size: number) => ReactNode;
  active: boolean;
  onPress: () => void;
}

export interface TabBarCenterAction {
  /** Render ikon (ukuran 22) berwarna primaryFg. */
  renderIcon: (color: string, size: number) => ReactNode;
  label: string;
  onPress: () => void;
}

export interface TabBarProps {
  items: TabBarItem[];
  /** Tombol bulat primary di tengah (Catat cepat). */
  centerAction?: TabBarCenterAction;
}

/**
 * Bottom nav mengambang Mist (DESIGN_SYSTEM.md §5.4): pill 64, slot ikon 44,
 * tombol tengah 48. Dirender absolut di atas layar.
 */
export default function TabBar({ items, centerAction }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const centerIndex = Math.ceil(items.length / 2);

  const slots = items.map(item => {
    const iconColor = item.active ? colors.primaryText : colors.text3;
    return (
      <PressableScale
        key={item.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: item.active }}
        accessibilityLabel={item.label}
        onPress={item.onPress}
        style={styles.slot}
      >
        <View style={styles.slotInner}>
          <MotiView
            animate={{
              opacity: item.active ? 1 : 0,
              scale: item.active ? 1 : 0.6,
            }}
            transition={transitions.indicator}
            style={styles.indicator}
          />
          {item.renderIcon(iconColor, 21)}
        </View>
      </PressableScale>
    );
  });

  if (centerAction) {
    slots.splice(
      centerIndex,
      0,
      <View key="center-action" style={styles.slot}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={centerAction.label}
          onPress={centerAction.onPress}
          style={styles.centerButton}
        >
          {centerAction.renderIcon(colors.primaryFg, 22)}
        </PressableScale>
      </View>,
    );
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, spacing.xl) },
      ]}
    >
      <View accessibilityRole="tablist" style={styles.bar}>
        {slots}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    height: layout.bottomNavHeight,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    ...shadows.nav,
  },
  slot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  slotInner: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  centerButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
});
