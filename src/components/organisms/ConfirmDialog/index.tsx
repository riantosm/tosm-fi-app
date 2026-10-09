import type { ReactNode } from 'react';
import { Modal, View } from 'react-native';
import { MotiView } from 'moti';
import Button from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { transitions } from '@/utils/motion';
import { useTheme } from '@/contexts/ThemeContext';

export type ConfirmTone = 'danger' | 'primary';

export interface ConfirmDialogProps {
  visible: boolean;
  tone?: ConfirmTone;
  /** Render ikon (ukuran 24) dengan warna nada. */
  renderIcon: (color: string) => ReactNode;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

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
  actions: {
    flexDirection: 'row',
    gap: 10,
    alignSelf: 'stretch',
    marginTop: spacing.sm,
  },
  action: { flex: 1 },
}));

/** Dialog konfirmasi di TENGAH (hapus, keluar, reset), bukan bottom sheet. */
export default function ConfirmDialog({
  visible,
  tone = 'danger',
  renderIcon,
  title,
  message,
  confirmLabel,
  cancelLabel,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const styles = useStyles();
  const { tones } = useTheme();
  const { soft, text } = tones[tone === 'danger' ? 'expense' : 'primary'];
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <MotiView
          from={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={transitions.pop}
          style={styles.card}
        >
          <View style={[styles.iconWrap, { backgroundColor: soft }]}>
            {renderIcon(text)}
          </View>
          <Typography variant="sheetTitle" align="center">
            {title}
          </Typography>
          {!!message && (
            <Typography tone="muted" align="center">
              {message}
            </Typography>
          )}
          <View style={styles.actions}>
            <Button
              variant="outline"
              label={cancelLabel}
              onPress={onCancel}
              disabled={loading}
              style={styles.action}
            />
            <Button
              variant={tone === 'danger' ? 'danger' : 'primary'}
              label={confirmLabel}
              onPress={onConfirm}
              loading={loading}
              style={styles.action}
            />
          </View>
        </MotiView>
      </View>
    </Modal>
  );
}
