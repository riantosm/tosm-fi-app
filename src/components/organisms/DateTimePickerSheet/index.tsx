import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { Check, Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Chip from '@/components/atoms/Chip';
import Typography from '@/components/atoms/Typography';
import CalendarGrid from '@/components/molecules/CalendarGrid';
import MonthNav from '@/components/molecules/MonthNav';
import SegmentedControl from '@/components/molecules/SegmentedControl';
import BottomSheet from '@/components/organisms/BottomSheet';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { textStyles } from '@/theme/typography';
import { formatMonthYear, parseIsoDate, toIsoDate } from '@/utils/calendar';
import { toIntlLocale } from '@/utils/locale';

export interface DateTimePickerSheetProps {
  visible: boolean;
  value: Date;
  /** true = hanya tanggal (tanpa baris jam). */
  dateOnly?: boolean;
  title?: string;
  onConfirm: (date: Date) => void;
  onClose: () => void;
}

type Meridiem = 'AM' | 'PM';

const useStyles = makeStyles(({ colors }) => ({
  time: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    paddingLeft: spacing.lg,
    paddingRight: 10,
    borderRadius: 16,
    backgroundColor: colors.surface2,
  },
  timeLabel: { flex: 1 },
  timeBox: {
    ...textStyles.num,
    width: 52,
    height: 44,
    fontSize: 18,
    textAlign: 'center',
    borderRadius: radius.control,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  meridiem: { width: 96 },
  chips: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
}));

/** Tanggal & jam (pen `k2oQp`): kalender, jam 12 jam + AM/PM, pintasan Hari ini / Sekarang. */
export default function DateTimePickerSheet(props: DateTimePickerSheetProps) {
  const { t } = useTranslation();
  return (
    <BottomSheet
      visible={props.visible}
      title={props.title ?? t('transaction.selectDateTimeTitle')}
      closeLabel={t('common.close')}
      onClose={props.onClose}
    >
      {props.visible && <PickerBody {...props} />}
    </BottomSheet>
  );
}

function PickerBody({
  value,
  dateOnly,
  onConfirm,
  onClose,
}: DateTimePickerSheetProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const [selected, setSelected] = useState(toIsoDate(value));
  const [viewMonth, setViewMonth] = useState(
    new Date(value.getFullYear(), value.getMonth(), 1),
  );
  const [hour12, setHour12] = useState(value.getHours() % 12 || 12);
  const [minute, setMinute] = useState(value.getMinutes());
  const [meridiem, setMeridiem] = useState<Meridiem>(
    value.getHours() >= 12 ? 'PM' : 'AM',
  );

  const shiftMonth = (delta: number) =>
    setViewMonth(
      new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1),
    );

  const pick = (iso: string) => {
    setSelected(iso);
    const day = parseIsoDate(iso);
    if (day.getMonth() !== viewMonth.getMonth()) {
      setViewMonth(new Date(day.getFullYear(), day.getMonth(), 1));
    }
  };

  const goToToday = () => pick(toIsoDate(new Date()));
  const goToNow = () => {
    const now = new Date();
    pick(toIsoDate(now));
    setHour12(now.getHours() % 12 || 12);
    setMinute(now.getMinutes());
    setMeridiem(now.getHours() >= 12 ? 'PM' : 'AM');
  };

  const confirm = () => {
    const result = parseIsoDate(selected);
    const hours24 = (hour12 % 12) + (meridiem === 'PM' ? 12 : 0);
    result.setHours(dateOnly ? 0 : hours24, dateOnly ? 0 : minute, 0, 0);
    onConfirm(result);
    onClose();
  };

  const clamp = (text: string, max: number, min: number) => {
    const number = Number(text.replace(/\D/g, '').slice(-2));
    return Number.isNaN(number) ? min : Math.min(max, Math.max(min, number));
  };

  return (
    <>
      <MonthNav
        label={formatMonthYear(viewMonth, locale)}
        previousLabel={t('common.previous')}
        nextLabel={t('common.next')}
        onPrevious={() => shiftMonth(-1)}
        onNext={() => shiftMonth(1)}
      />
      <CalendarGrid
        month={viewMonth}
        locale={locale}
        selected={selected}
        onSelect={pick}
      />
      {!dateOnly && (
        <View style={styles.time}>
          <Clock size={16} color={colors.text3} />
          <Typography variant="label" tone="muted" style={styles.timeLabel}>
            {t('transaction.timeLabel')}
          </Typography>
          <TextInput
            value={String(hour12).padStart(2, '0')}
            onChangeText={text => setHour12(clamp(text, 12, 1))}
            keyboardType="number-pad"
            selectTextOnFocus
            maxLength={3}
            accessibilityLabel={t('transaction.hourLabel')}
            style={styles.timeBox}
          />
          <Typography variant="num" tone="subtle">
            :
          </Typography>
          <TextInput
            value={String(minute).padStart(2, '0')}
            onChangeText={text => setMinute(clamp(text, 59, 0))}
            keyboardType="number-pad"
            selectTextOnFocus
            maxLength={3}
            accessibilityLabel={t('transaction.minuteLabel')}
            style={styles.timeBox}
          />
          <View style={styles.meridiem}>
            <SegmentedControl<Meridiem>
              variant="compact"
              value={meridiem}
              onChange={setMeridiem}
              options={[
                { value: 'AM', label: 'AM' },
                { value: 'PM', label: 'PM' },
              ]}
            />
          </View>
        </View>
      )}
      <View style={styles.chips}>
        <Chip label={t('transaction.today')} onPress={goToToday} />
        {!dateOnly && <Chip label={t('transaction.now')} onPress={goToNow} />}
      </View>
      <View style={styles.chips}>
        <Button
          variant="outline"
          label={t('common.cancel')}
          onPress={onClose}
          style={styles.action}
        />
        <Button
          label={t('common.select')}
          renderIcon={color => <Check size={18} color={color} />}
          onPress={confirm}
          style={styles.action}
        />
      </View>
    </>
  );
}
