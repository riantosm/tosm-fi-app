import { memo, useMemo } from 'react';
import { View } from 'react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';
import type { Category, Transaction } from '@/types';
import { buildMonthWeeks, getWeekdayLabels, toIsoDate } from '@/utils/calendar';

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
  cell: { flex: 1, height: 48, alignItems: 'center', gap: 4, paddingTop: 2 },
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
  dots: { flexDirection: 'row', gap: 3 },
  dot: { width: 5, height: 5, borderRadius: radius.pill },
  dim: { opacity: 0.5 },
}));

/** Kalender bulan (pen `HPw4Z`): titik warna kategori per hari, tap untuk menyaring hari itu. */
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
    () => buildMonthWeeks(month.getFullYear(), month.getMonth()),
    [month],
  );
  const labels = useMemo(() => getWeekdayLabels(locale, 'narrow'), [locale]);
  const today = toIsoDate(new Date());

  const dotsByDay = useMemo(() => {
    const colorOf = new Map(categories.map(c => [c.idCategory, c.color]));
    const map = new Map<string, string[]>();
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
      const list = map.get(iso) ?? [];
      list.push(
        (transaction.idCategory && colorOf.get(transaction.idCategory)) ||
          fallback,
      );
      map.set(iso, list);
    }
    return map;
  }, [transactions, categories, colors]);

  return (
    <Card style={[styles.card, isLoading && styles.dim]}>
      <View style={styles.row}>
        {labels.map((label, index) => (
          <View key={index} style={styles.weekday}>
            <Typography variant="captionStrong" tone="subtle">
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
                    <Typography tone="subtle" style={styles.dim}>
                      {day.date.getDate()}
                    </Typography>
                  </View>
                </View>
              );
            }
            const isToday = day.iso === today;
            const isSelected = day.iso === selectedDay;
            const dots = (dotsByDay.get(day.iso) ?? []).slice(0, 3);
            return (
              <PressableScale
                key={day.iso}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                scaleTo={0.9}
                onPress={() => onSelectDay(isSelected ? null : day.iso)}
                style={styles.cell}
              >
                <View
                  style={[
                    styles.day,
                    isToday && styles.today,
                    isSelected && !isToday && styles.selected,
                  ]}
                >
                  <Typography
                    variant={isToday || isSelected ? 'label' : 'body'}
                    tone={
                      isToday ? 'inverse' : isSelected ? 'primary' : 'default'
                    }
                    tabular
                  >
                    {day.date.getDate()}
                  </Typography>
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
