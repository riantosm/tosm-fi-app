import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { MotiView } from 'moti';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/metrics';
import { shadows } from '@/theme/shadows';
import { transitions } from '@/utils/motion';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** track: surface2 + thumb surface (form) · compact: surface + thumb primarySoft (sheet). */
  variant?: 'track' | 'compact';
}

/** Toggle bergaya pill dengan thumb yang bergeser. */
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = 'track',
}: SegmentedControlProps<T>) {
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    options.findIndex(option => option.value === value),
  );
  const segmentWidth = width / options.length;
  const compact = variant === 'compact';

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.track,
        compact ? styles.trackCompact : styles.trackDefault,
      ]}
    >
      <View
        style={styles.inner}
        onLayout={(event: LayoutChangeEvent) =>
          setWidth(event.nativeEvent.layout.width)
        }
      >
        {width > 0 && (
          <MotiView
            animate={{ translateX: segmentWidth * index }}
            transition={transitions.indicator}
            style={[
              styles.thumb,
              compact ? styles.thumbCompact : styles.thumbDefault,
              { width: segmentWidth },
            ]}
          />
        )}
        {options.map(option => {
          const selected = option.value === value;
          return (
            <PressableScale
              key={option.value}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={[styles.segment, compact && styles.segmentCompact]}
            >
              <Typography
                variant={selected ? 'label' : 'body'}
                tone={selected ? (compact ? 'primary' : 'default') : 'subtle'}
                numberOfLines={1}
                style={compact ? styles.labelCompact : styles.label}
              >
                {option.label}
              </Typography>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { borderRadius: radius.pill, padding: 4 },
  trackDefault: { backgroundColor: colors.surface2 },
  trackCompact: { backgroundColor: colors.surface },
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
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  segmentCompact: { paddingVertical: 6 },
  label: { fontSize: 13.5 },
  labelCompact: { fontSize: 12.5 },
});
