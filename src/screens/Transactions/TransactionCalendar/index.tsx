import { memo, useMemo } from 'react';
import { View } from 'react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';
import { fonts } from '@/theme/typography';
import type { Category, Transaction } from '@/types';
import { buildMonthWeeks, getWeekdayLabels, toIsoDate } from '@/utils/calendar';
import { MINUS } from '@/utils/money';

export interface TransactionCalendarProps {
  month: Date;
  locale: string;
  transactions: Transaction[];
  categories: Category[];
  selectedDay: string | null;
  onSelectDay: (iso: string | null) => void;
  isLoading?: boolean;
}

const useStyles = makeStyles(({ colors }) => ({
  card: { paddingHorizontal: 12, paddingVertical: 16, gap: 6 },
  row: { flexDirection: 'row' },
  weekday: { flex: 1, alignItems: 'center' },
  cell: { flex: 1, height: 60, alignItems: 'center', gap: 4, paddingTop: 2 },
  day: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  today: { backgroundColor: colors.primary },
  selected: {
    backgroundColor: colors.primarySoft,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  // Hari ini yang sedang dipilih: cincin di luar lingkaran "hari ini" (margin negatif → tata letak tetap).
  todayRing: {
    width: 38,
    height: 38,
    margin: -3,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Angka tanggal = web: Outfit 13,5, medium (biasa) / semibold (hari ini & terpilih).
  dayNum: { fontFamily: fonts.displayMedium, fontSize: 13.5 },
  dayNumStrong: { fontFamily: fonts.num },
  dots: { flexDirection: 'row', gap: 3 },
  dot: { width: 5, height: 5, borderRadius: radius.pill },
  // Net harian di bawah titik (= web, versi kecil).
  net: { fontFamily: fonts.num, fontSize: 9.5, lineHeight: 12 },
  dim: { opacity: 0.5 },
  weekend: { opacity: 0.5 },
}));

interface DayStats {
  dots: string[];
  /** Pemasukan − pengeluaran ± koreksi; transfer tidak dihitung (sama dengan web). */
  net: number;
}

/**
 * Kalender bulan (pen `HPw4Z`), minggu dimulai hari Minggu: titik warna kategori + net harian per
 * hari, tap untuk menyaring hari itu.
 */
function TransactionCalendar({
  month,
  locale,
  transactions,
  categories,
  selectedDay,
  onSelectDay,
  isLoading,
}: TransactionCalendarProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const weeks = useMemo(
    () => buildMonthWeeks(month.getFullYear(), month.getMonth(), 'sunday'),
    [month],
  );
  const labels = useMemo(
    () => getWeekdayLabels(locale, 'narrow', 'sunday'),
    [locale],
  );
  const today = toIsoDate(new Date());
  const { formatCompact } = useMoneyFormat();

  const statsByDay = useMemo(() => {
    const colorOf = new Map(categories.map(c => [c.idCategory, c.color]));
    const map = new Map<string, DayStats>();
    for (const transaction of transactions) {
      const iso = toIsoDate(new Date(transaction.date));
      const sign =
        transaction.type === 'income'
          ? 1
          : transaction.type === 'expense'
          ? -1
          : transaction.type === 'correction'
          ? Math.sign(transaction.amount)
          : 0;
      const fallback =
        sign > 0 ? colors.income : sign < 0 ? colors.expense : colors.text3;
      const entry = map.get(iso) ?? { dots: [], net: 0 };
      entry.dots.push(
        (transaction.idCategory && colorOf.get(transaction.idCategory)) ||
          fallback,
      );
      // Koreksi: `amount` sudah berupa delta bertanda.
      entry.net +=
        transaction.type === 'correction'
          ? transaction.amount
          : sign * transaction.amount;
      map.set(iso, entry);
    }
    return map;
  }, [transactions, categories, colors]);

  return (
    <Card style={[styles.card, isLoading && styles.dim]}>
      <View style={styles.row}>
        {labels.map((label, index) => (
          <View key={index} style={styles.weekday}>
            <Typography
              variant="captionStrong"
              tone="subtle"
              // Minggu & Sabtu (kolom terluar) diredupkan sebagai akhir pekan.
              style={(index === 0 || index === 6) && styles.weekend}
            >
              {label}
            </Typography>
          </View>
        ))}
      </View>
      {weeks.map(week => (
        <View key={week[0].iso} style={styles.row}>
          {week.map(day => {
            if (!day.inMonth) {
              return (
                <View key={day.iso} style={styles.cell}>
                  <View style={styles.day}>
                    <Typography
                      tone="subtle"
                      style={[styles.dayNum, styles.dim]}
                    >
                      {day.date.getDate()}
                    </Typography>
                  </View>
                </View>
              );
            }
            const isToday = day.iso === today;
            const isSelected = day.iso === selectedDay;
            const stats = statsByDay.get(day.iso);
            const dots = (stats?.dots ?? []).slice(0, 3);
            const net = stats?.net ?? 0;
            return (
              <PressableScale
                key={day.iso}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                scaleTo={0.9}
                onPress={() => onSelectDay(isSelected ? null : day.iso)}
                style={styles.cell}
              >
                <View style={isToday && isSelected && styles.todayRing}>
                  <View
                    style={[
                      styles.day,
                      isToday && styles.today,
                      isSelected && !isToday && styles.selected,
                    ]}
                  >
                    <Typography
                      style={[
                        styles.dayNum,
                        (isToday || isSelected) && styles.dayNumStrong,
                      ]}
                      tone={
                        isToday ? 'inverse' : isSelected ? 'primary' : 'default'
                      }
                      tabular
                    >
                      {day.date.getDate()}
                    </Typography>
                  </View>
                </View>
                {dots.length > 0 && (
                  <View style={styles.dots}>
                    {dots.map((color, index) => (
                      <View
                        key={index}
                        style={[styles.dot, { backgroundColor: color }]}
                      />
                    ))}
                  </View>
                )}
                {net !== 0 && (
                  <Typography
                    style={styles.net}
                    tone={net > 0 ? 'income' : 'expense'}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                    tabular
                  >
                    {`${net > 0 ? '+' : MINUS}${formatCompact(Math.abs(net))}`}
                  </Typography>
                )}
              </PressableScale>
            );
          })}
        </View>
      ))}
    </Card>
  );
}

// Memo: layar induk sering dirender ulang karena state sheet/dialog; daftar ini tidak perlu ikut.
export default memo(TransactionCalendar);
