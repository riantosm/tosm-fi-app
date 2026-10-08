import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { MotiView } from 'moti';
import Typography from '@/components/atoms/Typography';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/metrics';
import { fadeInUp } from '@/utils/motion';

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <MotiView {...fadeInUp} style={styles.container}>
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
    </MotiView>
  );
}

const styles = StyleSheet.create({
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
});
