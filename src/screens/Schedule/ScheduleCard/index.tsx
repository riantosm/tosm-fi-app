import { ActivityIndicator, View } from 'react-native';
import { Pause, Pencil, Play, Repeat, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import CategoryIcon from '@/components/atoms/CategoryIcon';
import IconButton from '@/components/atoms/IconButton';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { Category, Schedule } from '@/types';
import { MINUS } from '@/utils/money';

export interface ScheduleCardProps {
  schedule: Schedule;
  category: Category | undefined;
  /** "Bulanan · tgl 5". */
  frequencyLabel: string;
  /** "Hari ini", "Sel, 20 Okt" — null saat dijeda / tidak pernah jatuh tempo. */
  nextLabel: string | null;
  busy?: boolean;
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const useStyles = makeStyles(({ colors, shadows }) => ({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  paused: { opacity: 0.6 },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  texts: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flexShrink: 1, fontSize: 15 },
  frequency: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  frequencyText: { flexShrink: 1 },
  amount: { alignSelf: 'flex-start', paddingTop: 2, fontSize: 15 },
  divider: { height: 1, backgroundColor: colors.border },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  next: { flex: 1 },
  actions: { flexDirection: 'row', gap: spacing.sm },
}));

/** Kartu jadwal berulang (pen `a0SVGi`): ikon, judul, aturan ulang, nominal, jeda/edit/hapus. */
export default function ScheduleCard({
  schedule,
  category,
  frequencyLabel,
  nextLabel,
  busy = false,
  onToggleActive,
  onEdit,
  onDelete,
}: ScheduleCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { formatNumber } = useMoneyFormat();
  const isIncome = schedule.type === 'income';
  const paused = !schedule.isActive;

  return (
    <View style={[styles.card, paused && styles.paused]}>
      <View style={styles.top}>
        <CategoryIcon
          icon={category?.icon ?? 'HiOutlineTag'}
          color={category?.color ?? colors.txNeutral}
        />
        <View style={styles.texts}>
          <View style={styles.titleRow}>
            <Typography variant="label" numberOfLines={1} style={styles.title}>
              {schedule.title}
            </Typography>
            {paused && (
              <Badge tone="neutral" label={t('schedule.pausedBadge')} />
            )}
          </View>
          <View style={styles.frequency}>
            <Repeat size={14} color={colors.text2} />
            <Typography
              variant="meta"
              tone="muted"
              numberOfLines={1}
              style={styles.frequencyText}
            >
              {frequencyLabel}
            </Typography>
          </View>
        </View>
        <Typography
          variant="num"
          tone={isIncome ? 'income' : 'expense'}
          tabular
          style={styles.amount}
        >
          {isIncome ? '+' : MINUS}
          {formatNumber(schedule.amount)}
        </Typography>
      </View>
      <View style={styles.divider} />
      <View style={styles.bottom}>
        <Typography
          variant="secondary"
          tone="muted"
          numberOfLines={1}
          style={styles.next}
        >
          {t('schedule.nextInline', { when: nextLabel ?? '—' })}
        </Typography>
        {busy && <ActivityIndicator size="small" color={colors.primary} />}
        <View style={styles.actions}>
          <IconButton
            variant="surface2"
            size={34}
            label={t(paused ? 'schedule.resumeButton' : 'schedule.pauseButton')}
            disabled={busy}
            onPress={onToggleActive}
            renderIcon={(color, size) =>
              paused ? (
                <Play size={size - 2} color={color} />
              ) : (
                <Pause size={size - 2} color={color} />
              )
            }
          />
          <IconButton
            variant="surface2"
            size={34}
            label={t('schedule.editSchedule')}
            disabled={busy}
            onPress={onEdit}
            renderIcon={(color, size) => (
              <Pencil size={size - 2} color={color} />
            )}
          />
          <IconButton
            variant="surface2"
            size={34}
            label={t('wallet.deleteButton')}
            disabled={busy}
            onPress={onDelete}
            renderIcon={(_, size) => (
              <Trash2 size={size - 2} color={colors.expenseText} />
            )}
          />
        </View>
      </View>
    </View>
  );
}
