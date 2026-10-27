import { memo, useMemo } from 'react';
import { View } from 'react-native';
import { CalendarDays } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { fonts } from '@/theme/typography';
import type { TransactionSummary } from '@/types';
import { formatMonthName } from '@/utils/calendar';
import { withAlpha } from '@/utils/color';
import { dateTimeFormat } from '@/utils/intl';
import { MINUS } from '@/utils/money';
import { formatMonthParam, isSameMonthAs } from '@/utils/month';

export interface YearMonthSummary {
  /** Tanggal 1 bulan itu. */
  month: Date;
  summary: TransactionSummary;
  count: number;
}

export interface TransactionYearCalendarProps {
  year: number;
  locale: string;
  /** 12 entri (Jan–Des) setelah dimuat; kosong saat muat pertama. */
  months: YearMonthSummary[];
  /** "YYYY-MM" bulan yang sedang menyaring daftar. */
  selectedMonth: string | null;
  onSelectMonth: (month: string | null) => void;
  /** Kembali ke tampilan bulan, di bulan itu. */
  onOpenMonth: (month: Date) => void;
  isLoading?: boolean;
}

const useStyles = makeStyles(({ colors }) => ({
  card: { paddingHorizontal: 12, paddingVertical: 16, gap: 10 },
  head: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  // 3 kolom: (100% − 2 × gap) / 3.
  cell: {
    width: '31.9%',
    flexGrow: 1,
    height: 78,
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.control,
    borderWidth: 2,
    borderColor: colors.transparent,
    backgroundColor: colors.bg,
  },
  cellActive: { backgroundColor: colors.surface2 },
  // Terpilih = blok primary solid; bulan ini = garis primary saja (sama dengan web).
  cellSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cellCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.surface2,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  monthLabel: { flex: 1, fontSize: 13 },
  currentDot: { width: 7, height: 7, borderRadius: radius.pill },
  body: { gap: 6 },
  net: { fontFamily: fonts.num, fontSize: 12.5, lineHeight: 15 },
  track: {
    height: 5,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.surface3,
  },
  fill: { flexDirection: 'row', height: '100%', overflow: 'hidden' },
  segment: { height: '100%' },
  dash: { fontSize: 12, lineHeight: 15 },
  dim: { opacity: 0.5 },
}));

/**
 * Grid 12 bulan (tampilan Tahun, port `TransactionYearCalendar` web): net per bulan + bar
 * pengeluaran per kategori (panjang relatif bulan terboros), tap bulan untuk menyaring daftar.
 */
function TransactionYearCalendar({
  year,
  locale,
  months,
  selectedMonth,
  onSelectMonth,
  onOpenMonth,
  isLoading,
}: TransactionYearCalendarProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { formatCompact } = useMoneyFormat();
  const today = new Date();

  const slots = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const month = new Date(year, index, 1);
        return {
          month,
          key: formatMonthParam(month),
          data: months.find(item => isSameMonthAs(item.month, month)),
        };
      }),
    [year, months],
  );
  const maxExpense = Math.max(1, ...months.map(item => item.summary.expense));
  const selectedSlot = slots.find(slot => slot.key === selectedMonth);
  const shortMonth = dateTimeFormat(locale, { month: 'short' });

  return (
    <Card style={[styles.card, isLoading && styles.dim]}>
      <View style={styles.head}>
        {selectedSlot ? (
          <Button
            size="sm"
            variant="soft"
            label={t('transaction.openMonthCalendar', {
              month: formatMonthName(selectedSlot.month, locale),
            })}
            renderIcon={color => <CalendarDays size={16} color={color} />}
            onPress={() => onOpenMonth(selectedSlot.month)}
          />
        ) : (
          <Typography variant="secondary" tone="subtle">
            {t('transaction.yearCalendarHint')}
          </Typography>
        )}
      </View>

      <View style={styles.grid}>
        {slots.map(({ month, key, data }) => {
          const isSelected = selectedMonth === key;
          const isCurrent = isSameMonthAs(month, today);
          const isFuture = month > today;
          const hasActivity = !!data && data.count > 0;
          const net = data?.summary.net ?? 0;
          const expense = data?.summary.expense ?? 0;
          const breakdown = data?.summary.categoryBreakdown ?? [];
          const breakdownTotal =
            breakdown.reduce((sum, item) => sum + item.amount, 0) || 1;
          return (
            <PressableScale
              key={key}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={dateTimeFormat(locale, {
                month: 'long',
                year: 'numeric',
              }).format(month)}
              scaleTo={0.95}
              onPress={() => onSelectMonth(isSelected ? null : key)}
              style={[
                styles.cell,
                hasActivity && styles.cellActive,
                isCurrent && styles.cellCurrent,
                isSelected && styles.cellSelected,
              ]}
            >
              <View style={styles.top}>
                <Typography
                  variant={isSelected || isCurrent ? 'label' : 'metaMedium'}
                  tone={
                    isSelected
                      ? 'inverse'
                      : isCurrent
                      ? 'primary'
                      : isFuture && !hasActivity
                      ? 'subtle'
                      : 'default'
                  }
                  numberOfLines={1}
                  style={styles.monthLabel}
                >
                  {shortMonth.format(month).replace('.', '')}
                </Typography>
                {isCurrent && (
                  <View
                    accessibilityLabel={t('transaction.goToCurrentMonth')}
                    style={[
                      styles.currentDot,
                      {
                        backgroundColor: isSelected
                          ? colors.primaryFg
                          : colors.primary,
                      },
                    ]}
                  />
                )}
              </View>

              {hasActivity ? (
                <View style={styles.body}>
                  <Typography
                    style={styles.net}
                    tone={
                      isSelected
                        ? 'inverse'
                        : net > 0
                        ? 'income'
                        : net < 0
                        ? 'expense'
                        : 'subtle'
                    }
                    numberOfLines={1}
                    tabular
                  >
                    {`${net > 0 ? '+' : net < 0 ? MINUS : ''}${formatCompact(
                      Math.abs(net),
                    )}`}
                  </Typography>
                  <View
                    style={[
                      styles.track,
                      isSelected && {
                        backgroundColor: withAlpha(colors.primaryFg, 0.25),
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.fill,
                        { width: `${(expense / maxExpense) * 100}%` },
                      ]}
                    >
                      {breakdown.map(item => (
                        <View
                          key={item.idCategory}
                          style={[
                            styles.segment,
                            {
                              width: `${(item.amount / breakdownTotal) * 100}%`,
                              backgroundColor: item.color,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                </View>
              ) : (
                <Typography tone="subtle" style={[styles.dash, styles.dim]}>
                  —
                </Typography>
              )}
            </PressableScale>
          );
        })}
      </View>
    </Card>
  );
}

// Memo: layar induk sering dirender ulang karena state sheet/dialog; grid ini tidak perlu ikut.
export default memo(TransactionYearCalendar);
