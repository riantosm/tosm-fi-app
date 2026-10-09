import { Modal, View } from 'react-native';
import { MotiView } from 'moti';
import { CircleAlert, CircleCheck, Info } from 'lucide-react-native';
import Button from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { Tone } from '@/theme/tones';
import { transitions } from '@/utils/motion';

export type StatusModalType = 'success' | 'error' | 'info';

export interface StatusModalProps {
  visible: boolean;
  type: StatusModalType;
  title: string;
  message?: string;
  actionLabel: string;
  onClose: () => void;
}

const TYPE_CONFIG: Record<StatusModalType, { Icon: typeof Info; tone: Tone }> =
  {
    success: { Icon: CircleCheck, tone: 'income' },
    error: { Icon: CircleAlert, tone: 'expense' },
    info: { Icon: Info, tone: 'primary' },
  };

const useStyles = makeStyles(({ colors, shadows }) => ({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.scrim,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xxl,
    borderRadius: radius.sheet,
    backgroundColor: colors.surface,
    ...shadows.pop,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: { alignSelf: 'stretch', marginTop: spacing.sm },
}));

/** Feedback sukses/gagal/info satu tombol. Dipakai sebagai pengganti Alert.alert. */
export default function StatusModal({
  visible,
  type,
  title,
  message,
  actionLabel,
  onClose,
}: StatusModalProps) {
  const styles = useStyles();
  const { tones } = useTheme();
  const { Icon, tone } = TYPE_CONFIG[type];
  const { soft, text } = tones[tone];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <MotiView
          from={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={transitions.pop}
          style={styles.card}
        >
          <View style={[styles.iconWrap, { backgroundColor: soft }]}>
            <Icon size={28} color={text} />
          </View>
          <Typography variant="sheetTitle" align="center">
            {title}
          </Typography>
          {!!message && (
            <Typography tone="muted" align="center">
              {message}
            </Typography>
          )}
          <Button label={actionLabel} onPress={onClose} style={styles.action} />
        </MotiView>
      </View>
    </Modal>
  );
}
