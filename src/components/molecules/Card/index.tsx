import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/metrics';
import { shadows } from '@/theme/shadows';

export interface CardProps {
  children: ReactNode;
  /** default: padding 20 · list: padding 4×14 untuk daftar baris berpemisah. */
  variant?: 'default' | 'list';
  style?: StyleProp<ViewStyle>;
}

/** Kartu Mist: surface, radius 20, bayangan card, tanpa stroke. */
export default function Card({
  children,
  variant = 'default',
  style,
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'list' ? styles.list : styles.default,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  default: { padding: spacing.xl, gap: 14 },
  list: { paddingVertical: spacing.xs, paddingHorizontal: 14 },
});
