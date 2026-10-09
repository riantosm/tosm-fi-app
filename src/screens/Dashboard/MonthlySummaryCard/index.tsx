import { View } from 'react-native';
import { MotiView } from 'moti';
import { useTranslation } from 'react-i18next';
import PressableScale from '@/components/atoms/PressableScale';
import Skeleton from '@/components/atoms/Skeleton';
import Typography, { type TypographyTone } from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import SectionHead from '@/components/molecules/SectionHead';
import { useTheme } from '@/contexts/ThemeContext';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { DashboardSummary } from '@/types';
import { toIntlLocale } from '@/utils/locale';
import { transitions, withDelay } from '@/utils/motion';
import { dateTimeFormat } from '@/utils/intl';

export interface MonthlySummaryCardProps {
  summary: DashboardSummary | null;
  transactionCount: number;
  isLoading: boolean;
  onOpenIncome: () => void;
  onOpenExpense: () => void;
  onOpenInvestment: () => void;
}

const MAX_BAR = 150;
const MIN_BAR = 6;

const useStyles = makeStyles(({ colors }) => ({
  chart: {
    height: 200,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  column: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  bar: {
    width: 56,
    borderTopLeftRadius: radius.control,
    borderTopRightRadius: radius.control,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  labels: { flexDirection: 'row', gap: spacing.sm, paddingTop: 10 },
  label: { flex: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderRadius: radius.control,
  },
  footerPositive: { backgroundColor: colors.incomeSoft },
  footerNegative: { backgroundColor: colors.expenseSoft },
  footerLabel: { flex: 1 },
  footerValue: { fontSize: 16 },
  dim: { opacity: 0.6 },
}));

/** "Ringkasan · <bulan>" — bar pemasukan/pengeluaran/investasi + selisih bulan ini (pen `D2BEe`). */
export default function MonthlySummaryCard({
  summary,
  transactionCount,
  isLoading,
  onOpenIncome,
  onOpenExpense,
  onOpenInvestment,
}: MonthlySummaryCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { formatCompact, formatSigned } = useMoneyFormat();
  const initialLoading = isLoading && !summary;
  const savings = summary?.monthly.savings ?? 0;

  const monthLabel = dateTimeFormat(toIntlLocale(i18n.language), {
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const columns: {
    key: string;
    label: string;
    value: number;
    color: string;
    tone: TypographyTone;
    onPress: () => void;
  }[] = [
    {
      key: 'income',
      label: t('dashboard.income'),
      value: summary?.monthly.income ?? 0,
      color: colors.income,
      tone: 'income',
      onPress: onOpenIncome,
    },
    {
      key: 'expense',
      label: t('dashboard.expense'),
      value: summary?.monthly.expense ?? 0,
      color: colors.expense,
      tone: 'expense',
      onPress: onOpenExpense,
    },
    {
      key: 'investment',
      label: t('nav.investment'),
      value: summary?.monthly.investmentInflow ?? 0,
      color: colors.investment,
      tone: 'investment',
      onPress: onOpenInvestment,
    },
  ];
  const max = Math.max(...columns.map(c => Math.abs(c.value)), 1);

  return (
    <Card>
      <SectionHead
        eyebrow={t('dashboard.summaryEyebrow')}
        title={monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
      />
      <View style={isLoading && !initialLoading && styles.dim}>
        <View style={styles.chart}>
          {columns.map((column, index) => {
            const height =
              column.value > 0
                ? Math.max(MIN_BAR, (Math.abs(column.value) / max) * MAX_BAR)
                : 0;
            return (
              <PressableScale
                key={column.key}
                accessibilityRole="button"
                accessibilityLabel={column.label}
                onPress={column.onPress}
                style={styles.column}
              >
                {initialLoading ? (
                  <Skeleton
                    width={56}
                    height={[120, 80, 44][index]}
                    radius={radius.control}
                  />
                ) : (
                  <>
                    <Typography variant="num" tone={column.tone} tabular>
                      {formatCompact(column.value)}
                    </Typography>
                    <MotiView
                      from={{ height: 0 }}
                      animate={{ height }}
                      transition={withDelay(transitions.grow, index * 60)}
                      style={[styles.bar, { backgroundColor: column.color }]}
                    />
                  </>
                )}
              </PressableScale>
            );
          })}
        </View>
        <View style={styles.labels}>
          {columns.map(column => (
            <Typography
              key={column.key}
              variant="caption"
              tone="subtle"
              align="center"
              numberOfLines={1}
              style={styles.label}
            >
              {column.label}
            </Typography>
          ))}
        </View>
      </View>
      {initialLoading ? (
        <Skeleton height={44} radius={radius.control} />
      ) : (
        <View
          style={[
            styles.footer,
            savings < 0 ? styles.footerNegative : styles.footerPositive,
          ]}
        >
          <Typography
            variant="meta"
            tone={savings < 0 ? 'expense' : 'income'}
            numberOfLines={1}
            style={styles.footerLabel}
          >
            {t('dashboard.differenceFooter', { count: transactionCount })}
          </Typography>
          <Typography
            variant="num"
            tone={savings < 0 ? 'expense' : 'income'}
            tabular
            style={styles.footerValue}
          >
            {formatSigned(savings)}
          </Typography>
        </View>
      )}
    </Card>
  );
}
