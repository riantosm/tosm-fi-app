import type { ReactNode } from 'react';
import { View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';

export interface SectionHeadProps {
  eyebrow?: string;
  title: string;
  /** Tautan "Lihat semua →" di kanan. */
  actionLabel?: string;
  onAction?: () => void;
  /** Kontrol kanan lain (legend, toggle) — menggantikan tautan. */
  right?: ReactNode;
}

const useStyles = makeStyles(() => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titles: { flex: 1, gap: spacing.xxs },
  link: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
}));

/** Kepala kartu (pen V2/SectionHead): eyebrow + judul Outfit 18, tautan di kanan. */
export default function SectionHead({
  eyebrow,
  title,
  actionLabel,
  onAction,
  right,
}: SectionHeadProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.titles}>
        {!!eyebrow && (
          <Typography variant="eyebrow" tone="subtle" numberOfLines={1}>
            {eyebrow}
          </Typography>
        )}
        <Typography variant="cardTitle" numberOfLines={1}>
          {title}
        </Typography>
      </View>
      {right ??
        (!!actionLabel && (
          <PressableScale
            accessibilityRole="link"
            hitSlop={8}
            onPress={onAction}
            style={styles.link}
          >
            <Typography variant="fieldLabel" tone="primary">
              {actionLabel}
            </Typography>
            <ArrowRight size={14} color={colors.primaryText} />
          </PressableScale>
        ))}
    </View>
  );
}
