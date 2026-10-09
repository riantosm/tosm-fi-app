import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';

export interface CardProps {
  children: ReactNode;
  /** default: padding 20 · list: padding 4×14 untuk daftar baris berpemisah. */
  variant?: 'default' | 'list';
  style?: StyleProp<ViewStyle>;
}

const useStyles = makeStyles(({ colors, shadows }) => ({
  base: {
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  default: { padding: spacing.xl, gap: 14 },
  list: { paddingVertical: spacing.xs, paddingHorizontal: 14 },
}));

/** Kartu Mist: surface, radius 20, bayangan card, tanpa stroke. */
export default function Card({
  children,
  variant = 'default',
  style,
}: CardProps) {
  const styles = useStyles();
  return <View style={[styles.base, styles[variant], style]}>{children}</View>;
}
