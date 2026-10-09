import { useState, type ReactNode } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { MotiView } from 'moti';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';
import { transitions } from '@/utils/motion';

export interface SegmentOption<T extends string> {
  value: T;
  /** Teks segmen; untuk segmen ikon tetap isi (dipakai sebagai label a11y). */
  label: string;
  /** Segmen ikon (☀/☾): render ikon dengan warna state. */
  renderIcon?: (color: string) => ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /**
   * track: surface2 + thumb surface (form) · compact: surface + thumb primarySoft (sheet) ·
   * hero: track tembus `heroControl` + thumb surface (di atas gradien hero) ·
   * solid: track surface + thumb primary (strip periode Laporan).
   */
  variant?: 'track' | 'compact' | 'hero' | 'solid';
  /** Warna teks segmen aktif (mis. expenseText untuk Pengeluaran). */
  activeColor?: string;
}

const useStyles = makeStyles(({ colors, shadows }) => ({
  track: { borderRadius: radius.pill, padding: 4 },
  trackDefault: { backgroundColor: colors.surface2 },
  trackCompact: { backgroundColor: colors.surface },
  trackHero: { backgroundColor: colors.heroControl },
  trackSolid: { backgroundColor: colors.surface, ...shadows.card },
  inner: { flexDirection: 'row' },
  thumb: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: radius.pill,
  },
  thumbDefault: { backgroundColor: colors.surface, ...shadows.thumb },
  thumbCompact: { backgroundColor: colors.primarySoft },
  thumbSolid: { backgroundColor: colors.primary },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  segmentCompact: { paddingVertical: 6 },
  label: { fontSize: 13.5 },
  labelCompact: { fontSize: 12.5 },
}));

/** Toggle bergaya pill dengan thumb yang bergeser. */
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = 'track',
  activeColor,
}: SegmentedControlProps<T>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  // Nilai di luar opsi (mis. "custom" di strip periode) → tanpa thumb.
  const index = options.findIndex(option => option.value === value);
  const segmentWidth = width / options.length;
  const compact = variant === 'compact';

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.track,
        compact
          ? styles.trackCompact
          : variant === 'hero'
          ? styles.trackHero
          : variant === 'solid'
          ? styles.trackSolid
          : styles.trackDefault,
      ]}
    >
      <View
        style={styles.inner}
        onLayout={(event: LayoutChangeEvent) =>
          setWidth(event.nativeEvent.layout.width)
        }
      >
        {width > 0 && index >= 0 && (
          <MotiView
            animate={{ translateX: segmentWidth * index }}
            transition={transitions.indicator}
            style={[
              styles.thumb,
              compact
                ? styles.thumbCompact
                : variant === 'solid'
                ? styles.thumbSolid
                : styles.thumbDefault,
              { width: segmentWidth },
            ]}
          />
        )}
        {options.map(option => {
          const selected = option.value === value;
          const color = selected
            ? activeColor ??
              (compact
                ? colors.primaryText
                : variant === 'solid'
                ? colors.primaryFg
                : colors.text)
            : variant === 'hero'
            ? colors.heroFg2
            : variant === 'solid'
            ? colors.text2
            : colors.text3;
          return (
            <PressableScale
              key={option.value}
              accessibilityRole="tab"
              accessibilityLabel={option.label}
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={[styles.segment, compact && styles.segmentCompact]}
            >
              {option.renderIcon ? (
                option.renderIcon(color)
              ) : (
                <Typography
                  variant={selected ? 'label' : 'body'}
                  numberOfLines={1}
                  style={[
                    compact ? styles.labelCompact : styles.label,
                    { color },
                  ]}
                >
                  {option.label}
                </Typography>
              )}
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}
