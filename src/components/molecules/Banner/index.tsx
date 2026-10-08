import { StyleSheet, View, type ViewStyle } from 'react-native';
import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
} from 'lucide-react-native';
import Typography, { type TypographyTone } from '@/components/atoms/Typography';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/metrics';

export type BannerTone = 'error' | 'warning' | 'info' | 'success';

export interface BannerProps {
  tone: BannerTone;
  title: string;
  message?: string;
}

const toneConfig: Record<
  BannerTone,
  { box: ViewStyle; Icon: typeof Info; color: string; title: TypographyTone }
> = {
  error: {
    box: { backgroundColor: colors.expenseSoft },
    Icon: CircleAlert,
    color: colors.expenseText,
    title: 'expense',
  },
  warning: {
    box: { backgroundColor: colors.warningSoft },
    Icon: TriangleAlert,
    color: colors.warningText,
    title: 'investment',
  },
  info: {
    box: { backgroundColor: colors.primarySoft },
    Icon: Info,
    color: colors.primaryText,
    title: 'primary',
  },
  success: {
    box: { backgroundColor: colors.incomeSoft },
    Icon: CircleCheck,
    color: colors.incomeText,
    title: 'income',
  },
};

/** Pesan inline (error login, info persetujuan, dll.). */
export default function Banner({ tone, title, message }: BannerProps) {
  const { box, Icon, color, title: titleTone } = toneConfig[tone];
  return (
    <View
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      style={[styles.base, box]}
    >
      <View style={styles.iconWrap}>
        <Icon size={16} color={color} />
      </View>
      <View style={styles.texts}>
        <Typography variant="label" tone={titleTone} style={styles.title}>
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

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderRadius: radius.field,
  },
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
});
