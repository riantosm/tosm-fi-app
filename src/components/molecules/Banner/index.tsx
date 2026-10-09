import { View } from 'react-native';
import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
} from 'lucide-react-native';
import Typography, { type TypographyTone } from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';

export type BannerTone = 'error' | 'warning' | 'info' | 'success';

export interface BannerProps {
  tone: BannerTone;
  title: string;
  message?: string;
}

const ICONS: Record<BannerTone, typeof Info> = {
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
  success: CircleCheck,
};

const TITLE_TONE: Record<BannerTone, TypographyTone> = {
  error: 'expense',
  warning: 'investment',
  info: 'primary',
  success: 'income',
};

const useStyles = makeStyles(({ colors }) => ({
  base: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderRadius: radius.field,
  },
  error: { backgroundColor: colors.expenseSoft },
  warning: { backgroundColor: colors.warningSoft },
  info: { backgroundColor: colors.primarySoft },
  success: { backgroundColor: colors.incomeSoft },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  texts: { flex: 1, gap: spacing.xxs, justifyContent: 'center' },
  title: { fontSize: 13.5 },
}));

/** Pesan inline (error login, info persetujuan, dll.). */
export default function Banner({ tone, title, message }: BannerProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const Icon = ICONS[tone];
  const iconColor = {
    error: colors.expenseText,
    warning: colors.warningText,
    info: colors.primaryText,
    success: colors.incomeText,
  }[tone];

  return (
    <View
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      style={[styles.base, styles[tone]]}
    >
      <View style={styles.iconWrap}>
        <Icon size={16} color={iconColor} />
      </View>
      <View style={styles.texts}>
        <Typography
          variant="label"
          tone={TITLE_TONE[tone]}
          style={styles.title}
        >
          {title}
        </Typography>
        {!!message && (
          <Typography variant="secondary" tone="muted">
            {message}
          </Typography>
        )}
      </View>
    </View>
  );
}
