import { memo, useEffect, useRef, useState, type ComponentRef } from 'react';
import {
  ScrollView,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { CalendarCheck } from 'lucide-react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Chip from '@/components/atoms/Chip';
import Typography from '@/components/atoms/Typography';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { isSameMonthAs } from '@/utils/month';
import { dateTimeFormat } from '@/utils/intl';

export interface MonthTabsProps {
  months: Date[];
  selected: Date;
  locale: string;
  goToCurrentLabel: string;
  onSelect: (month: Date) => void;
  onGoToCurrent: () => void;
  /** "year" = strip tahun (satu tab per tahun, `months` = 1 Januari tiap tahun). */
  unit?: 'month' | 'year';
  style?: StyleProp<ViewStyle>;
}

const SLOT = 72;

const useStyles = makeStyles(({ colors, shadows }) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  strip: {
    flex: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  content: { padding: 4, gap: 4 },
  tab: {
    width: SLOT,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  tabActive: { backgroundColor: colors.primary },
  label: { fontSize: 12.5 },
}));

function isSameYearAs(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear();
}

function monthLabel(date: Date, locale: string, withYear: boolean) {
  const label = dateTimeFormat(locale, { month: 'short' })
    .format(date)
    .replace('.', '');
  return withYear ? `${label} ${date.getFullYear()}` : label;
}

/** Strip bulan/tahun (pen `t5Sqc`): pill surface, tab aktif primary, otomatis ke tengah. */
function MonthTabs({
  months,
  selected,
  locale,
  goToCurrentLabel,
  onSelect,
  onGoToCurrent,
  unit = 'month',
  style,
}: MonthTabsProps) {
  const styles = useStyles();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [width, setWidth] = useState(0);
  const currentYear = new Date().getFullYear();
  const isSame = unit === 'year' ? isSameYearAs : isSameMonthAs;
  const isCurrent = isSame(selected, new Date());
  const index = months.findIndex(month => isSame(month, selected));

  const [contentWidth, setContentWidth] = useState(0);
  const centeredOnce = useRef(false);

  // Pusatkan bulan aktif setelah lebar strip & konten diketahui (tanpa animasi pertama kali).
  useEffect(() => {
    if (width > 0 && contentWidth > 0 && index >= 0) {
      const x = 4 + index * (SLOT + 4) - width / 2 + SLOT / 2;
      scrollRef.current?.scrollTo({
        x: Math.min(Math.max(0, x), Math.max(0, contentWidth - width)),
        animated: centeredOnce.current,
      });
      centeredOnce.current = true;
    }
  }, [index, width, contentWidth]);

  return (
    <View style={[styles.row, style]}>
      <View
        style={styles.strip}
        onLayout={(event: LayoutChangeEvent) =>
          setWidth(event.nativeEvent.layout.width)
        }
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.content}
          onContentSizeChange={contentW => setContentWidth(contentW)}
        >
          {months.map(month => {
            const active = isSame(month, selected);
            return (
              <PressableScale
                key={month.toISOString()}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => onSelect(month)}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Typography
                  variant={active ? 'label' : 'metaMedium'}
                  tone={active ? 'inverse' : 'muted'}
                  numberOfLines={1}
                  style={styles.label}
                >
                  {unit === 'year'
                    ? month.getFullYear()
                    : monthLabel(
                        month,
                        locale,
                        active || month.getFullYear() !== currentYear,
                      )}
                </Typography>
              </PressableScale>
            );
          })}
        </ScrollView>
      </View>
      {!isCurrent && (
        <Chip
          label={goToCurrentLabel}
          active
          renderIcon={color => <CalendarCheck size={14} color={color} />}
          onPress={onGoToCurrent}
        />
      )}
    </View>
  );
}

// Memo: layar induk sering dirender ulang karena state sheet/dialog; daftar ini tidak perlu ikut.
export default memo(MonthTabs);
