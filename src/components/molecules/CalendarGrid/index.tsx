import { useMemo } from 'react';
import { View } from 'react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';
import { buildMonthWeeks, getWeekdayLabels, toIsoDate } from '@/utils/calendar';

export interface CalendarGridProps {
  /** Bulan yang ditampilkan (tanggal berapa pun di bulan itu). */
  month: Date;
  locale: string;
  /** Mode tanggal tunggal: ISO yang terpilih. */
  selected?: string | null;
  /** Mode rentang: ISO awal/akhir (inklusif). */
  rangeFrom?: string;
  rangeTo?: string;
  onSelect: (iso: string) => void;
}

const useStyles = makeStyles(({ colors }) => ({
  row: { flexDirection: 'row' },
  cell: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center' },
  weekday: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  inRange: { backgroundColor: colors.primarySoft },
  rangeStart: {
    borderTopLeftRadius: radius.pill,
    borderBottomLeftRadius: radius.pill,
  },
  rangeEnd: {
    borderTopRightRadius: radius.pill,
    borderBottomRightRadius: radius.pill,
  },
  day: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: { backgroundColor: colors.primary },
  dayToday: { borderWidth: 1, borderColor: colors.primarySoft },
  outside: { opacity: 0.45 },
}));

/** Grid bulan (Senin dulu) untuk pemilih tanggal & rentang. */
export default function CalendarGrid({
  month,
  locale,
  selected,
  rangeFrom,
  rangeTo,
  onSelect,
}: CalendarGridProps) {
  const styles = useStyles();
  const weeks = useMemo(
    () => buildMonthWeeks(month.getFullYear(), month.getMonth()),
    [month],
  );
  const labels = useMemo(() => getWeekdayLabels(locale), [locale]);
  const today = toIsoDate(new Date());
  const isRange = rangeFrom !== undefined;

  return (
    <View>
      <View style={styles.row}>
        {labels.map((label, index) => (
          <View key={index} style={styles.weekday}>
            <Typography variant="captionStrong" tone="subtle">
              {label.replace('.', '')}
            </Typography>
          </View>
        ))}
      </View>
      {weeks.map(week => (
        <View key={week[0].iso} style={styles.row}>
          {week.map(day => {
            const from = rangeFrom ?? '';
            const to = rangeTo || rangeFrom || '';
            const isEdge = isRange
              ? day.iso === from || day.iso === to
              : day.iso === selected;
            const inside = isRange && !!from && day.iso > from && day.iso < to;
            const showBand = isRange && !!from && !!rangeTo && from !== rangeTo;
            return (
              <View
                key={day.iso}
                style={[
                  styles.cell,
                  showBand && (inside || isEdge) && styles.inRange,
                  showBand && day.iso === from && styles.rangeStart,
                  showBand && day.iso === to && styles.rangeEnd,
                ]}
              >
                <PressableScale
                  accessibilityRole="button"
                  accessibilityState={{ selected: isEdge }}
                  scaleTo={0.9}
                  onPress={() => onSelect(day.iso)}
                  style={[
                    styles.day,
                    isEdge && styles.daySelected,
                    !isEdge && day.iso === today && styles.dayToday,
                    !day.inMonth && styles.outside,
                  ]}
                >
                  <Typography
                    variant={isEdge || day.iso === today ? 'label' : 'body'}
                    tone={
                      isEdge
                        ? 'inverse'
                        : day.iso === today
                        ? 'primary'
                        : day.inMonth
                        ? 'default'
                        : 'subtle'
                    }
                    tabular
                  >
                    {day.date.getDate()}
                  </Typography>
                </PressableScale>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
