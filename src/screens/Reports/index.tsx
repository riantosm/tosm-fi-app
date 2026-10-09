import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { CalendarRange } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import IconButton from '@/components/atoms/IconButton';
import SegmentedControl from '@/components/molecules/SegmentedControl';
import CategoryBreakdownChart from '@/components/organisms/CategoryBreakdownChart';
import DateRangeSheet from '@/components/organisms/DateRangeSheet';
import MainLayout from '@/components/templates/MainLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/hooks/useLanguage';
import { MONTHLY_TREND_MONTHS, useReports } from '@/hooks/useReports';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import CashFlowCard from '@/screens/Reports/CashFlowCard';
import MonthlyTrendCard from '@/screens/Reports/MonthlyTrendCard';
import ReportSummaryCards from '@/screens/Reports/ReportSummaryCards';
import TopSpendingCard from '@/screens/Reports/TopSpendingCard';
import WalletUsageCard from '@/screens/Reports/WalletUsageCard';
import { makeStyles } from '@/theme/makeStyles';
import { parseIsoDate } from '@/utils/calendar';
import { buildCategoryBreakdown } from '@/utils/categoryBreakdown';
import { toIntlLocale } from '@/utils/locale';
import {
  REPORT_PERIOD_PRESETS,
  formatReportRange,
  type ReportPeriodFilter,
  type ReportPeriodPreset,
} from '@/utils/reportPeriod';
import Reveal from '@/components/atoms/Reveal';

const DEFAULT_PERIOD: ReportPeriodFilter = {
  preset: 'month',
  dateFrom: '',
  dateTo: '',
};

const useStyles = makeStyles(({ colors, shadows }) => ({
  periodBar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  periodStrip: { flex: 1 },
  rangeButton: shadows.card,
  rangeActive: { backgroundColor: colors.primarySoft },
}));

/**
 * Laporan (pen `S5YW9` / state `CaSg9`, port ReportsPage web): strip periode + custom range,
 * ringkasan 2 × 2, cash flow, pengeluaran per kategori, tren 12 bulan, top pengeluaran, dan
 * dompet paling aktif. Setiap kartu memuat endpoint-nya sendiri.
 */
export default function ReportsScreen(
  _props: RootStackScreenProps<typeof ROUTES.REPORTS>,
) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const locale = toIntlLocale(language);
  const [period, setPeriod] = useState<ReportPeriodFilter>(DEFAULT_PERIOD);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useReports(period, refreshKey);
  const { resolvedPeriod } = report;
  const isCustom = period.preset === 'custom';

  const subtitle = useMemo(() => {
    const range = formatReportRange(
      resolvedPeriod.dateFrom,
      resolvedPeriod.dateTo,
      locale,
    );
    return period.preset === 'today'
      ? `${t('reports.period.today')} · ${range}`
      : range;
  }, [
    resolvedPeriod.dateFrom,
    resolvedPeriod.dateTo,
    locale,
    period.preset,
    t,
  ]);

  const slices = useMemo(
    () => buildCategoryBreakdown(report.categoryBreakdown),
    [report.categoryBreakdown],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshKey(key => key + 1);
    // Beri waktu indikator tarik-ulang; tiap kartu menampilkan loading-nya sendiri.
    await new Promise<void>(resolve => setTimeout(resolve, 600));
  }, []);

  const sections = [
    <CashFlowCard
      key="cashFlow"
      data={report.cashFlow}
      isLoading={report.isCashFlowLoading}
    />,
    <CategoryBreakdownChart
      key="category"
      slices={slices}
      title={t('reports.expenseByCategory.title')}
      periodLabel={t('reports.eyebrow.category')}
      isLoading={report.isSummaryLoading}
      emptyTitle={t('reports.topSpending.empty')}
      emptyVariant="inset"
    />,
    <MonthlyTrendCard
      key="trend"
      data={report.monthlyTrend}
      isLoading={report.isMonthlyTrendLoading}
      eyebrow={t('reports.eyebrow.monthlyTrend', {
        count: MONTHLY_TREND_MONTHS,
      })}
    />,
    <TopSpendingCard
      key="top"
      items={report.topSpending}
      isLoading={report.isTopSpendingLoading}
    />,
    <WalletUsageCard
      key="wallets"
      items={report.walletUsage}
      isLoading={report.isWalletUsageLoading}
    />,
  ];

  return (
    <>
      <MainLayout
        title={t('nav.reports')}
        subtitle={subtitle}
        withTabBar
        onRefresh={handleRefresh}
      >
        <View style={styles.periodBar}>
          <View style={styles.periodStrip}>
            <SegmentedControl<ReportPeriodPreset>
              variant="solid"
              options={REPORT_PERIOD_PRESETS.map(preset => ({
                value: preset,
                label: t(`reports.periodShort.${preset}`),
              }))}
              value={period.preset}
              onChange={preset =>
                setPeriod({ preset, dateFrom: '', dateTo: '' })
              }
            />
          </View>
          <IconButton
            label={t('reports.period.custom')}
            variant="surface"
            size={46}
            onPress={() => setRangeOpen(true)}
            style={[styles.rangeButton, isCustom && styles.rangeActive]}
            renderIcon={(color, size) => (
              <CalendarRange
                size={size}
                color={isCustom ? colors.primaryText : color}
              />
            )}
          />
        </View>

        <ReportSummaryCards
          summary={report.summary}
          isLoading={report.isSummaryLoading}
        />

        {sections.map((section, index) => (
          <Reveal delay={80 + index * 40} key={section.key}>
            {section}
          </Reveal>
        ))}
      </MainLayout>

      <DateRangeSheet
        visible={rangeOpen}
        value={
          isCustom
            ? { from: period.dateFrom, to: period.dateTo }
            : { from: '', to: '' }
        }
        initialMonth={
          isCustom ? parseIsoDate(resolvedPeriod.dateFrom) : new Date()
        }
        onApply={range =>
          setPeriod(
            range.from
              ? { preset: 'custom', dateFrom: range.from, dateTo: range.to }
              : DEFAULT_PERIOD,
          )
        }
        onClose={() => setRangeOpen(false)}
      />
    </>
  );
}
