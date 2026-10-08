import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { MotiView } from 'moti';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IconButton from '@/components/atoms/IconButton';
import Typography from '@/components/atoms/Typography';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/metrics';
import { shadows } from '@/theme/shadows';
import { transitions } from '@/utils/motion';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Judul Outfit 21 + tombol tutup. Tanpa judul: hanya handle. */
  title?: string;
  closeLabel?: string;
  /** Padding horizontal: 20 (form) · 16 (menu). */
  gutter?: number;
  children: ReactNode;
}

/** Bottom sheet Mist: surface, sudut atas 28, handle 44×5, scrim (DESIGN_SYSTEM.md §5.5). */
export default function BottomSheet({
  visible,
  onClose,
  title,
  closeLabel,
  gutter = spacing.xl,
  children,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <MotiView
          from={{ translateY: 320 }}
          animate={{ translateY: 0 }}
          transition={transitions.pop}
          style={[
            styles.sheet,
            {
              paddingHorizontal: gutter,
              paddingBottom: Math.max(insets.bottom, spacing.lg) + 18,
            },
          ]}
        >
          <View style={styles.handle} />
          {!!title && (
            <View style={styles.header}>
              <Typography variant="sheetTitle" style={styles.title}>
                {title}
              </Typography>
              <IconButton
                label={closeLabel ?? ''}
                onPress={onClose}
                renderIcon={(color, size) => <X size={size} color={color} />}
              />
            </View>
          )}
          {children}
        </MotiView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.scrim,
  },
  sheet: {
    gap: 14,
    paddingTop: spacing.md,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    backgroundColor: colors.surface,
    ...shadows.pop,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: { flex: 1 },
});
