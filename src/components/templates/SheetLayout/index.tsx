import { useRef, type ComponentRef, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { MotiView } from 'moti';
import { ArrowLeft, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IconButton from '@/components/atoms/IconButton';
import { ToastHost } from '@/contexts/ToastContext';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useRevealFocusedInput } from '@/hooks/useRevealFocusedInput';
import Typography from '@/components/atoms/Typography';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { transitions } from '@/utils/motion';

export interface SheetLayoutProps {
  onClose: () => void;
  closeLabel?: string;
  /** Judul Outfit 21 + tombol tutup. Tanpa judul: hanya handle. */
  title?: string;
  subtitle?: string;
  /** Ada → tombol kembali di kiri judul (sheet bertingkat, mis. subkategori). */
  onBack?: () => void;
  backLabel?: string;
  /** Aksi header sebelum tombol tutup (mis. duplikat, hapus). */
  headerActions?: ReactNode;
  /** Bagian bawah tetap (tidak ikut scroll), biasanya dua tombol. */
  footer?: ReactNode;
  /** Padding horizontal: 20 (form) · 16 (menu). */
  gutter?: number;
  /** false = isi tidak dibungkus ScrollView (konten pendek/tetap). */
  scroll?: boolean;
  children: ReactNode;
}

const useStyles = makeStyles(({ colors, shadows }) => ({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.scrim,
  },
  sheet: {
    maxHeight: '94%',
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
    marginBottom: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  titles: { flex: 1, gap: spacing.xxs },
  body: { gap: spacing.xl },
  bodyCompact: { gap: 14 },
  footer: { flexDirection: 'row', gap: 10, paddingTop: spacing.lg },
}));

/**
 * Tampilan bottom sheet Mist (DESIGN_SYSTEM.md §5.5): scrim, sudut atas 28, handle 44×5,
 * judul 21, isi scroll, footer tetap. Dipakai oleh `BottomSheet` (Modal) dan route modal
 * transparan (Catat transaksi, Bayar tagihan).
 */
export default function SheetLayout({
  onClose,
  closeLabel,
  title,
  subtitle,
  onBack,
  backLabel,
  headerActions,
  footer,
  gutter = spacing.xl,
  scroll = true,
  children,
}: SheetLayoutProps) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  // iOS memakai KeyboardAvoidingView; Android (edge-to-edge) diberi ruang manual.
  const keyboardHeight = useKeyboardHeight();
  const restingPadding = Math.max(insets.bottom, spacing.lg) + 18;
  const bottomPadding =
    Platform.OS === 'android' && keyboardHeight > 0
      ? keyboardHeight + spacing.lg
      : restingPadding;
  // Sheet yang memanjang sampai batas tinggi: input fokus di bawah tetap digulir ke atas keyboard.
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const offsetRef = useRef(0);
  useRevealFocusedInput(scrollRef, () => offsetRef.current, keyboardHeight);
  const body = (
    <View style={title ? styles.body : styles.bodyCompact}>{children}</View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={closeLabel}
        style={StyleSheet.absoluteFill}
        onPress={onClose}
      />
      <MotiView
        from={{ translateY: 320 }}
        animate={{ translateY: 0 }}
        transition={transitions.sheet}
        style={[
          styles.sheet,
          {
            paddingHorizontal: gutter,
            paddingBottom: bottomPadding,
          },
        ]}
      >
        <View style={styles.handle} />
        {!!title && (
          <View style={styles.header}>
            {onBack && (
              <IconButton
                label={backLabel ?? ''}
                onPress={onBack}
                renderIcon={(color, size) => (
                  <ArrowLeft size={size} color={color} />
                )}
              />
            )}
            <View style={styles.titles}>
              <Typography variant="sheetTitle" numberOfLines={1}>
                {title}
              </Typography>
              {!!subtitle && (
                <Typography variant="secondary" tone="subtle" numberOfLines={2}>
                  {subtitle}
                </Typography>
              )}
            </View>
            {headerActions}
            <IconButton
              label={closeLabel ?? ''}
              onPress={onClose}
              renderIcon={(color, size) => <X size={size} color={color} />}
            />
          </View>
        )}
        {scroll ? (
          <ScrollView
            ref={scrollRef}
            onScroll={event => {
              offsetRef.current = event.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={32}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {body}
          </ScrollView>
        ) : (
          body
        )}
        {!!footer && <View style={styles.footer}>{footer}</View>}
      </MotiView>
      {/* Sheet ada di window sendiri: toast dirender di sini (atas layar, tidak menutupi tombol). */}
      <ToastHost position="top" offset={insets.top + spacing.md} />
    </KeyboardAvoidingView>
  );
}
