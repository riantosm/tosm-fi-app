import { Modal, StyleSheet, View } from 'react-native';
import { MotiView } from 'moti';
import { CircleAlert, CircleCheck, Info } from 'lucide-react-native';
import Button from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/metrics';
import { shadows } from '@/theme/shadows';
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

const typeConfig: Record<
  StatusModalType,
  { Icon: typeof CircleCheck; color: string; background: string }
> = {
  success: {
    Icon: CircleCheck,
    color: colors.incomeText,
    background: colors.incomeSoft,
  },
  error: {
    Icon: CircleAlert,
    color: colors.expenseText,
    background: colors.expenseSoft,
  },
  info: {
    Icon: Info,
    color: colors.primaryText,
    background: colors.primarySoft,
  },
};

/** Feedback sukses/gagal/info. Dipakai sebagai pengganti Alert.alert. */
export default function StatusModal({
  visible,
  type,
  title,
  message,
  actionLabel,
  onClose,
}: StatusModalProps) {
  const { Icon, color, background } = typeConfig[type];

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
          <View style={[styles.iconWrap, { backgroundColor: background }]}>
            <Icon size={28} color={color} />
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

const styles = StyleSheet.create({
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
});
