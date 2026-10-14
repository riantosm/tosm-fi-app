import { ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Gradient from '@/components/atoms/Gradient';
import Typography from '@/components/atoms/Typography';
import AreaChart from '@/components/molecules/AreaChart';
import ProfitLossPill from '@/components/molecules/ProfitLossPill';
import SegmentedControl from '@/components/molecules/SegmentedControl';
import { useTheme } from '@/contexts/ThemeContext';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';
import { fonts } from '@/theme/typography';
import type { NetWorthTimelinePoint } from '@/types';
import {
  PERIOD_GRANULARITY,
  formatTimelineDate,
  type InvestmentTotals,
  type NetWorthPeriodPreset,
} from '@/utils/investment';

export interface NetWorthHeroProps {
  totals: InvestmentTotals;
  /** Tidak ada → hero kosong (belum ada instrumen). */
  data?: NetWorthTimelinePoint[];
  period?: NetWorthPeriodPreset;
  onPeriodChange?: (period: NetWorthPeriodPreset) => void;
  loading?: boolean;
}

const PERIODS: NetWorthPeriodPreset[] = ['month', 'year', 'all'];
const CHART_HEIGHT = 150;

const useStyles = makeStyles(() => ({
  hero: {
    gap: 14,
    padding: spacing.xl,
    overflow: 'hidden',
    borderRadius: 24,
  },
  value: { gap: spacing.sm },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  symbol: { fontFamily: fonts.displayMedium, fontSize: 15, lineHeight: 20 },
  amount: { flexShrink: 1, fontSize: 34, lineHeight: 40, letterSpacing: -0.8 },
  plRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chart: { height: CHART_HEIGHT, justifyContent: 'center' },
  loader: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
  },
  dim: { opacity: 0.4 },
}));

/** Hero Investasi (pen `Q1BjKl` · `dZKTE`): nilai total, P/L vs modal, periode, grafik nilai. */
export default function NetWorthHero({
  totals,
  data,
  period = 'year',
  onPeriodChange,
  loading = false,
}: NetWorthHeroProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { symbol, formatNumber, formatCompact } = useMoneyFormat();
  const empty = data === undefined;

  return (
    <View style={styles.hero}>
      <Gradient />
      <View style={styles.value}>
        <Typography variant="meta" tone="heroMuted">
          {t('investment.totalValue')}
        </Typography>
        <View style={styles.amountRow}>
          <Typography tone="heroMuted" style={styles.symbol}>
            {symbol}
          </Typography>
          <Typography
            variant="heroAmount"
            tone="hero"
            tabular
            numberOfLines={1}
            adjustsFontSizeToFit
            style={styles.amount}
          >
            {formatNumber(totals.currentValue)}
          </Typography>
        </View>
        {empty ? (
          <Typography variant="meta" tone="heroMuted">
            {t('investment.emptyChartHint')}
          </Typography>
        ) : (
          <View style={styles.plRow}>
            <ProfitLossPill
              profitLoss={totals.profitLoss}
              percent={totals.profitLossPercent}
              showAmount
              onSurface
            />
            <Typography variant="caption" tone="heroMuted">
              {t('investment.capitalShort', {
                amount: formatCompact(totals.investedAmount),
              })}
            </Typography>
          </View>
        )}
      </View>

      {!empty && (
        <>
          <SegmentedControl<NetWorthPeriodPreset>
            variant="hero"
            value={period}
            onChange={value => onPeriodChange?.(value)}
            options={PERIODS.map(option => ({
              value: option,
              label: t(`investment.netWorth.period.${option}`),
            }))}
          />
          <View style={styles.chart}>
            {data.length === 0 && !loading ? (
              <Typography variant="meta" tone="heroMuted" align="center">
                {t('investment.emptyChartHint')}
              </Typography>
            ) : (
              <View style={loading && styles.dim}>
                <AreaChart
                  height={CHART_HEIGHT}
                  labels={data.map(point =>
                    formatTimelineDate(
                      point.date,
                      PERIOD_GRANULARITY[period],
                      i18n.language,
                    ),
                  )}
                  labelColor={colors.heroFg2}
                  labelFontSize={11}
                  gridColor={`${colors.heroFg2}24`}
                  endDot={{
                    color: colors.investment,
                    ringColor: colors.surface,
                  }}
                  series={[
                    {
                      key: 'current',
                      values: data.map(point => point.current),
                      color: colors.investment,
                      strokeWidth: 2.5,
                      fillOpacity: 0.4,
                    },
                  ]}
                />
              </View>
            )}
            {loading && (
              <View style={styles.loader}>
                <ActivityIndicator color={colors.heroFg2} />
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}
