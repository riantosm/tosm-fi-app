import { View } from 'react-native';
import { CalendarClock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Gradient from '@/components/atoms/Gradient';
import Skeleton from '@/components/atoms/Skeleton';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { fonts } from '@/theme/typography';
import { MINUS } from '@/utils/money';

export interface NextDueInfo {
  title: string;
  /** "hari ini", "sel, 20 okt". */
  whenLabel: string;
  amount: number;
  isIncome: boolean;
}

export interface ScheduleSummaryProps {
  nextDue: NextDueInfo | null;
  monthlyExpense: number;
  monthlyIncome: number;
  loading?: boolean;
}

const useStyles = makeStyles(({ colors, shadows }) => ({
  wrap: { gap: 10 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
    borderRadius: radius.card,
  },
  heroIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  heroTexts: { flex: 1, gap: 2 },
  heroTitle: { fontFamily: fonts.display, fontSize: 15.5, lineHeight: 21 },
  stats: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1,
    gap: 2,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  statValue: { fontSize: 17, lineHeight: 22 },
}));

/** "Jatuh tempo berikutnya" + pengeluaran/pemasukan rutin per bulan (pen `a0SVGi`). */
export default function ScheduleSummary({
  nextDue,
  monthlyExpense,
  monthlyIncome,
  loading = false,
}: ScheduleSummaryProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { formatNumber, formatCompact } = useMoneyFormat();

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <Gradient />
        <View style={styles.heroIcon}>
          <CalendarClock size={20} color={colors.investmentText} />
        </View>
        <View style={styles.heroTexts}>
          <Typography variant="meta" tone="heroMuted" numberOfLines={1}>
            {t('schedule.nextDue')}
          </Typography>
          {loading ? (
            <Skeleton width={160} height={20} />
          ) : (
            <Typography tone="hero" numberOfLines={1} style={styles.heroTitle}>
              {nextDue
                ? t('schedule.nextDueTitle', {
                    title: nextDue.title,
                    when: nextDue.whenLabel,
                  })
                : t('schedule.noNextDue')}
            </Typography>
          )}
        </View>
        {nextDue && !loading && (
          <Typography variant="num" tone="hero" tabular>
            {nextDue.isIncome ? '+' : MINUS}
            {formatNumber(nextDue.amount)}
          </Typography>
        )}
      </View>
      <View style={styles.stats}>
        {[
          {
            key: 'expense',
            label: t('schedule.monthlyExpenseShort'),
            value: monthlyExpense,
            tone: 'expense' as const,
          },
          {
            key: 'income',
            label: t('schedule.monthlyIncomeShort'),
            value: monthlyIncome,
            tone: 'income' as const,
          },
        ].map(stat => (
          <View key={stat.key} style={styles.stat}>
            <Typography variant="caption" tone="subtle" numberOfLines={1}>
              {stat.label}
            </Typography>
            {loading ? (
              <Skeleton width={80} height={22} />
            ) : (
              <Typography
                variant="num"
                tone={stat.tone}
                tabular
                numberOfLines={1}
                style={styles.statValue}
              >
                {formatCompact(stat.value)}
              </Typography>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
