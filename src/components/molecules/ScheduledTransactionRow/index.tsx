import { View } from 'react-native';
import { CalendarClock, Check, X } from 'lucide-react-native';
import Button from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';

export interface ScheduledTransactionRowProps {
  title: string;
  meta: string;
  /** Nominal sudah diformat lengkap dengan tanda. */
  amount: string;
  payLabel: string;
  cancelLabel: string;
  onPay?: () => void;
  onCancel?: () => void;
}

const useStyles = makeStyles(({ colors }) => ({
  box: {
    gap: spacing.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.field,
    backgroundColor: colors.investmentSoft,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tile: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  texts: { flex: 1, gap: spacing.xxs },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
}));

/** Tagihan jadwal yang jatuh tempo di dalam daftar: kotak investmentSoft + Batalkan/Bayar. */
export default function ScheduledTransactionRow({
  title,
  meta,
  amount,
  payLabel,
  cancelLabel,
  onPay,
  onCancel,
}: ScheduledTransactionRowProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.box}>
      <View style={styles.top}>
        <View style={styles.tile}>
          <CalendarClock size={18} color={colors.investmentText} />
        </View>
        <View style={styles.texts}>
          <Typography variant="label" numberOfLines={1}>
            {title}
          </Typography>
          <Typography variant="meta" tone="muted" numberOfLines={1}>
            {meta}
          </Typography>
        </View>
        <Typography variant="num" tabular>
          {amount}
        </Typography>
      </View>
      {(onPay || onCancel) && (
        <View style={styles.actions}>
          {onCancel && (
            <Button
              size="md"
              variant="outline"
              label={cancelLabel}
              renderIcon={color => <X size={16} color={color} />}
              onPress={onCancel}
              style={styles.action}
            />
          )}
          {onPay && (
            <Button
              size="md"
              label={payLabel}
              renderIcon={color => <Check size={16} color={color} />}
              onPress={onPay}
              style={styles.action}
            />
          )}
        </View>
      )}
    </View>
  );
}
