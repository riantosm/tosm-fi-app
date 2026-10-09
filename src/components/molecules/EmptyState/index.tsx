import type { ReactNode } from 'react';
import { View } from 'react-native';
import Typography from '@/components/atoms/Typography';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import Reveal from '@/components/atoms/Reveal';

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  /** inset: versi ringkas di dalam kartu (kotak `surface2`, ikon 40 di lingkaran `surface`). */
  variant?: 'default' | 'inset';
}

const useStyles = makeStyles(({ colors }) => ({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    marginBottom: spacing.xs,
  },
  inset: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    minHeight: 150,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.field,
    backgroundColor: colors.surface2,
  },
  insetIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
}));

export default function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  const styles = useStyles();
  if (variant === 'inset') {
    return (
      <Reveal style={styles.inset}>
        <View style={styles.insetIcon}>{icon}</View>
        <Typography variant="secondary" tone="muted" align="center">
          {title}
        </Typography>
        {action}
      </Reveal>
    );
  }
  return (
    <Reveal style={styles.container}>
      <View style={styles.iconWrap}>{icon}</View>
      <Typography variant="cardTitle" align="center">
        {title}
      </Typography>
      {!!description && (
        <Typography variant="secondary" tone="muted" align="center">
          {description}
        </Typography>
      )}
      {action}
    </Reveal>
  );
}
