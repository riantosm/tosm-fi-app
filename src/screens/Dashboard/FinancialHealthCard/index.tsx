import { View } from 'react-native';
import { CircleCheck, CircleDashed } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import ProgressRing from '@/components/atoms/ProgressRing';
import Skeleton from '@/components/atoms/Skeleton';
import Typography from '@/components/atoms/Typography';
import Badge, { type BadgeTone } from '@/components/atoms/Badge';
import Card from '@/components/molecules/Card';
import SectionHead from '@/components/molecules/SectionHead';
import { useTheme } from '@/contexts/ThemeContext';
import type { ColorTokens } from '@/theme/colors';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';
import { fonts } from '@/theme/typography';
import type { DashboardSummary, FinancialHealthStatus } from '@/types';

export interface FinancialHealthCardProps {
  summary: DashboardSummary | null;
  isLoading: boolean;
}

const STATUS: Record<
  FinancialHealthStatus,
  { ring: (c: ColorTokens) => string; badge: BadgeTone }
> = {
  excellent: { ring: c => c.income, badge: 'income' },
  good: { ring: c => c.primary, badge: 'primary' },
  fair: { ring: c => c.investment, badge: 'investment' },
  needsAttention: { ring: c => c.expense, badge: 'expense' },
};

const useStyles = makeStyles(() => ({
  ring: { alignItems: 'center' },
  score: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44 },
  badge: { alignSelf: 'center', marginTop: 6 },
  checks: { gap: 10 },
  check: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkLabel: { flex: 1 },
  skeletonLines: { gap: 10 },
}));

/** "Skor · Kesehatan finansial" — cincin skor + tiga pemeriksaan (pen `g8lr3`). */
export default function FinancialHealthCard({
  summary,
  isLoading,
}: FinancialHealthCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const health = summary?.financialHealth;

  const checks = health
    ? [
        {
          good: health.isCashFlowPositive,
          label: t(
            health.isCashFlowPositive
              ? 'dashboard.cashFlowPositive'
              : 'dashboard.cashFlowNegative',
          ),
        },
        {
          good: health.savingRate >= 0,
          label: t('dashboard.savingRateLabel', { rate: health.savingRate }),
        },
        {
          good: health.isExpenseStable,
          label: t(
            health.isExpenseStable
              ? 'dashboard.expenseStable'
              : 'dashboard.expenseUnstable',
          ),
        },
      ]
    : [];

  return (
    <Card>
      <SectionHead
        eyebrow={t('dashboard.healthEyebrow')}
        title={t('dashboard.financialHealth')}
      />
      {isLoading && !health ? (
        <>
          <View style={styles.ring}>
            <Skeleton width={150} height={150} />
          </View>
          <View style={styles.skeletonLines}>
            <Skeleton width="60%" height={13} />
            <Skeleton width="66%" height={13} />
            <Skeleton width="50%" height={13} />
          </View>
        </>
      ) : health ? (
        <>
          <View style={styles.ring}>
            <ProgressRing
              size={150}
              thickness={14}
              value={health.score / 100}
              color={STATUS[health.status].ring(colors)}
            >
              <Typography style={styles.score} tabular>
                {health.score}
              </Typography>
              <Badge
                style={styles.badge}
                tone={STATUS[health.status].badge}
                label={t(`dashboard.healthStatus.${health.status}`)}
              />
            </ProgressRing>
          </View>
          <View style={styles.checks}>
            {checks.map(check => {
              const Icon = check.good ? CircleCheck : CircleDashed;
              return (
                <View key={check.label} style={styles.check}>
                  <Icon
                    size={16}
                    color={
                      check.good ? colors.incomeText : colors.investmentText
                    }
                  />
                  <Typography
                    variant="secondary"
                    tone="muted"
                    numberOfLines={1}
                    style={styles.checkLabel}
                  >
                    {check.label}
                  </Typography>
                </View>
              );
            })}
          </View>
        </>
      ) : null}
    </Card>
  );
}
