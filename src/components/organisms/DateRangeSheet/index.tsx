import { useState } from 'react';
import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import CalendarGrid from '@/components/molecules/CalendarGrid';
import MonthNav from '@/components/molecules/MonthNav';
import BottomSheet from '@/components/organisms/BottomSheet';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';
import {
  formatMonthYear,
  formatShortDate,
  parseIsoDate,
} from '@/utils/calendar';
import { toIntlLocale } from '@/utils/locale';

export interface DateRange {
  /** "YYYY-MM-DD" atau "" */
  from: string;
  to: string;
}

export interface DateRangeSheetProps {
  visible: boolean;
  value: DateRange;
  /** Bulan awal tampilan kalender kalau belum ada rentang. */
  initialMonth: Date;
  onApply: (range: DateRange) => void;
  onClose: () => void;
}

const useStyles = makeStyles(({ colors }) => ({
  fields: { flexDirection: 'row', gap: 10 },
  field: {
    flex: 1,
    gap: 2,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.field,
    borderWidth: 1.5,
    borderColor: colors.transparent,
    backgroundColor: colors.surface2,
  },
  fieldActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  actions: { flexDirection: 'row', gap: 10 },
  action: { flex: 1 },
}));

/** Rentang tanggal (pen `TtzF7`): Dari/Sampai + kalender rentang, Hapus / Terapkan. */
export default function DateRangeSheet(props: DateRangeSheetProps) {
  const { t } = useTranslation();
  return (
    <BottomSheet
      visible={props.visible}
      title={t('transaction.dateFilterTitle')}
      closeLabel={t('common.close')}
      onClose={props.onClose}
    >
      {props.visible && <RangeBody {...props} />}
    </BottomSheet>
  );
}

function RangeBody({
  value,
  initialMonth,
  onApply,
  onClose,
}: DateRangeSheetProps) {
  const styles = useStyles();
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const [range, setRange] = useState<DateRange>(value);
  const [editing, setEditing] = useState<'from' | 'to'>(
    value.from ? 'to' : 'from',
  );
  const start = value.from ? parseIsoDate(value.from) : initialMonth;
  const [viewMonth, setViewMonth] = useState(
    new Date(start.getFullYear(), start.getMonth(), 1),
  );

  const pick = (iso: string) => {
    if (editing === 'from' || !range.from || iso < range.from) {
      setRange({ from: iso, to: range.to && iso <= range.to ? range.to : '' });
      setEditing('to');
    } else {
      setRange({ ...range, to: iso });
    }
  };

  const label = (iso: string) =>
    iso ? formatShortDate(parseIsoDate(iso), locale) : '—';

  return (
    <>
      <View style={styles.fields}>
        {(['from', 'to'] as const).map(key => (
          <PressableScale
            key={key}
            accessibilityRole="button"
            accessibilityState={{ selected: editing === key }}
            scaleTo={0.98}
            onPress={() => setEditing(key)}
            style={[styles.field, editing === key && styles.fieldActive]}
          >
            <Typography
              variant="caption"
              tone={editing === key ? 'primary' : 'subtle'}
            >
              {t(
                key === 'from' ? 'transaction.dateFrom' : 'transaction.dateTo',
              )}
            </Typography>
            <Typography variant="label" numberOfLines={1}>
              {label(range[key])}
            </Typography>
          </PressableScale>
        ))}
      </View>
      <MonthNav
        label={formatMonthYear(viewMonth, locale)}
        previousLabel={t('common.previous')}
        nextLabel={t('common.next')}
        onPrevious={() =>
          setViewMonth(
            new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1),
          )
        }
        onNext={() =>
          setViewMonth(
            new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1),
          )
        }
      />
      <CalendarGrid
        month={viewMonth}
        locale={locale}
        rangeFrom={range.from}
        rangeTo={range.to}
        onSelect={pick}
      />
      <View style={styles.actions}>
        <Button
          variant="outline"
          label={t('transaction.clearDateFilterShort')}
          onPress={() => {
            onApply({ from: '', to: '' });
            onClose();
          }}
          style={styles.action}
        />
        <Button
          label={t('transaction.applyDateFilter')}
          renderIcon={color => <Check size={18} color={color} />}
          disabled={!range.from}
          onPress={() => {
            onApply({ from: range.from, to: range.to || range.from });
            onClose();
          }}
          style={styles.action}
        />
      </View>
    </>
  );
}
