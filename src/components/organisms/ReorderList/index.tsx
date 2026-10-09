import { useMemo, useRef, useState, type ReactNode } from 'react';
import { PanResponder, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import IconButton from '@/components/atoms/IconButton';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { springs } from '@/utils/motion';

export interface ReorderListProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  /** Isi baris di antara grip dan panah (tile + judul). */
  renderContent: (item: T) => ReactNode;
  /** Elemen di kanan isi (mis. tombol hapus) sebelum panah. */
  renderTrailing?: (item: T) => ReactNode;
  onReorder: (next: T[]) => void;
  /** Dipanggil saat seretan selesai dan urutannya berubah (mis. simpan langsung). */
  onDragEnd?: (next: T[]) => void;
  /** card = kartu `surface` berbayang (halaman) · inset = `surface2` rata (di dalam sheet). */
  variant?: 'card' | 'inset';
  /** false = hanya seret grip, tanpa tombol panah. */
  showArrows?: boolean;
  disabled?: boolean;
}

const GAP = spacing.sm;
const ROW_LAYOUT = LinearTransition.springify()
  .damping(springs.indicator.damping)
  .stiffness(springs.indicator.stiffness);

function move<T>(list: T[], from: number, to: number): T[] {
  if (from === to || to < 0 || to >= list.length) {
    return list;
  }
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

const useStyles = makeStyles(({ colors, shadows }) => ({
  list: { gap: GAP },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingLeft: spacing.sm,
    paddingRight: spacing.md,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.transparent,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  rowInset: {
    gap: 10,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.xs,
    paddingRight: spacing.sm,
    borderRadius: radius.control,
    backgroundColor: colors.surface2,
    shadowOpacity: 0,
    elevation: 0,
  },
  rowActive: { borderColor: colors.primary },
  rowDisabled: { opacity: 0.6 },
  rowDragging: { zIndex: 10, ...shadows.pop },
  grip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.xs },
  content: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  arrows: { flexDirection: 'row', gap: 6 },
  arrowDisabled: { opacity: 0.4 },
}));

/**
 * Daftar "Atur urutan" (pen `PWG8l`): tahan grip ⠿ lalu seret, atau pakai tombol panah.
 * Baris terakhir yang dipindah diberi garis primary supaya mata bisa mengikutinya.
 */
export default function ReorderList<T>({
  items,
  keyExtractor,
  renderContent,
  renderTrailing,
  onReorder,
  onDragEnd,
  variant = 'card',
  showArrows = true,
  disabled = false,
}: ReorderListProps<T>) {
  const styles = useStyles();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const translateY = useSharedValue(0);
  // Jarak antar-baris (tinggi baris + gap), diukur dari baris pertama.
  const step = useRef(0);
  const drag = useRef<{ start: number; current: number } | null>(null);
  const latest = useRef({ items, onReorder, onDragEnd });
  latest.current = { items, onReorder, onDragEnd };
  // Urutan terbaru selama seretan (state induk baru terbarui di render berikutnya).
  const dragOrder = useRef<T[] | null>(null);

  const moveBy = (key: string, delta: number) => {
    const index = items.findIndex(item => keyExtractor(item) === key);
    setActiveKey(key);
    onReorder(move(items, index, index + delta));
  };

  const beginDrag = (key: string) => {
    const index = latest.current.items.findIndex(
      item => keyExtractor(item) === key,
    );
    drag.current = { start: index, current: index };
    dragOrder.current = latest.current.items;
    translateY.value = 0;
    setActiveKey(key);
    setDraggingKey(key);
  };

  const updateDrag = (dy: number) => {
    const state = drag.current;
    if (!state || step.current === 0) {
      return;
    }
    const count = latest.current.items.length;
    const target = Math.min(
      Math.max(state.start + Math.round(dy / step.current), 0),
      count - 1,
    );
    if (target !== state.current) {
      const next = move(
        dragOrder.current ?? latest.current.items,
        state.current,
        target,
      );
      dragOrder.current = next;
      latest.current.onReorder(next);
      state.current = target;
    }
    translateY.value = dy - (target - state.start) * step.current;
  };

  const endDrag = () => {
    const state = drag.current;
    if (state && state.current !== state.start && dragOrder.current) {
      latest.current.onDragEnd?.(dragOrder.current);
    }
    drag.current = null;
    dragOrder.current = null;
    translateY.value = withSpring(0, springs.indicator);
    setDraggingKey(null);
  };

  const handlers = useRef({ beginDrag, updateDrag, endDrag });
  handlers.current = { beginDrag, updateDrag, endDrag };

  return (
    <View style={styles.list}>
      {items.map((item, index) => {
        const key = keyExtractor(item);
        return (
          <ReorderRow
            key={key}
            itemKey={key}
            active={activeKey === key}
            dragging={draggingKey === key}
            lifted={activeKey === key}
            translateY={translateY}
            variant={variant}
            showArrows={showArrows}
            disabled={disabled}
            trailing={renderTrailing?.(item)}
            canMoveUp={index > 0}
            canMoveDown={index < items.length - 1}
            onMoveUp={() => moveBy(key, -1)}
            onMoveDown={() => moveBy(key, 1)}
            handlers={handlers}
            onLayout={
              index === 0
                ? (event: LayoutChangeEvent) => {
                    step.current = event.nativeEvent.layout.height + GAP;
                  }
                : undefined
            }
          >
            {renderContent(item)}
          </ReorderRow>
        );
      })}
    </View>
  );
}

interface ReorderRowProps {
  itemKey: string;
  variant: 'card' | 'inset';
  showArrows: boolean;
  disabled: boolean;
  trailing?: ReactNode;
  active: boolean;
  dragging: boolean;
  /** Baris yang terakhir diseret: ikut translateY (kembali ke 0 setelah dilepas). */
  lifted: boolean;
  translateY: SharedValue<number>;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  handlers: {
    current: {
      beginDrag: (key: string) => void;
      updateDrag: (dy: number) => void;
      endDrag: () => void;
    };
  };
  onLayout?: (event: LayoutChangeEvent) => void;
  children: ReactNode;
}

function ReorderRow({
  itemKey,
  variant,
  showArrows,
  disabled,
  trailing,
  active,
  dragging,
  lifted,
  translateY,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  handlers,
  onLayout,
  children,
}: ReorderRowProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        // Jangan biarkan ScrollView induk merebut gestur saat menyeret.
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => handlers.current.beginDrag(itemKey),
        onPanResponderMove: (_, gesture) =>
          handlers.current.updateDrag(gesture.dy),
        onPanResponderRelease: () => handlers.current.endDrag(),
        onPanResponderTerminate: () => handlers.current.endDrag(),
      }),
    [handlers, itemKey],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: lifted ? translateY.value : 0 },
      { scale: dragging ? 1.02 : 1 },
    ],
  }));

  return (
    <Animated.View
      // Baris yang sedang diseret mengikuti jari, bukan animasi layout.
      layout={dragging ? undefined : ROW_LAYOUT}
      onLayout={onLayout}
      style={[
        styles.row,
        variant === 'inset' && styles.rowInset,
        disabled && styles.rowDisabled,
        active && styles.rowActive,
        dragging && styles.rowDragging,
        animatedStyle,
      ]}
    >
      <View
        style={styles.grip}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents={disabled ? 'none' : 'auto'}
        {...pan.panHandlers}
      >
        <GripVertical size={18} color={colors.text3} />
      </View>
      <View style={styles.content}>{children}</View>
      {trailing}
      {showArrows && (
        <View style={styles.arrows}>
          <IconButton
            variant="surface2"
            size={34}
            label={t('common.moveUp')}
            disabled={!canMoveUp}
            onPress={onMoveUp}
            style={!canMoveUp && styles.arrowDisabled}
            renderIcon={(color, size) => (
              <ChevronUp size={size} color={color} />
            )}
          />
          <IconButton
            variant="surface2"
            size={34}
            label={t('common.moveDown')}
            disabled={!canMoveDown}
            onPress={onMoveDown}
            style={!canMoveDown && styles.arrowDisabled}
            renderIcon={(color, size) => (
              <ChevronDown size={size} color={color} />
            )}
          />
        </View>
      )}
    </Animated.View>
  );
}
