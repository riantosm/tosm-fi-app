import { useState } from 'react';
import { View } from 'react-native';
import { AlarmClock, Calendar } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import PickerField from '@/components/molecules/PickerField';
import DateTimePickerSheet from '@/components/organisms/DateTimePickerSheet';
import { useLanguage } from '@/hooks/useLanguage';
import { makeStyles } from '@/theme/makeStyles';
import { toIntlLocale } from '@/utils/locale';
import { dateTimeFormat } from '@/utils/intl';

export interface InvestmentDateTimeFieldProps {
  value: Date;
  onChange: (date: Date) => void;
}

const useStyles = makeStyles(() => ({
  row: { flexDirection: 'row', gap: 10 },
  cell: { flex: 1 },
}));

/**
 * Pemicu Tanggal + Jam berbagi satu `DateTimePickerSheet` (port `InvestmentDateTimeField` web):
 * dipakai semua form entri investasi supaya entri bisa bertanggal mundur.
 */
export default function InvestmentDateTimeField({
  value,
  onChange,
}: InvestmentDateTimeFieldProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const locale = toIntlLocale(language);
  const [open, setOpen] = useState(false);

  return (
    <>
      <View style={styles.row}>
        <View style={styles.cell}>
          <PickerField
            label={t('investment.dateLabel')}
            value={dateTimeFormat(locale, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }).format(value)}
            renderIcon={color => <Calendar size={18} color={color} />}
            onPress={() => setOpen(true)}
          />
        </View>
        <View style={styles.cell}>
          <PickerField
            label={t('investment.timeLabel')}
            value={dateTimeFormat(locale, {
              hour: '2-digit',
              minute: '2-digit',
            }).format(value)}
            renderIcon={color => <AlarmClock size={18} color={color} />}
            onPress={() => setOpen(true)}
          />
        </View>
      </View>
      <DateTimePickerSheet
        visible={open}
        value={value}
        onClose={() => setOpen(false)}
        onConfirm={onChange}
      />
    </>
  );
}
