import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';

export interface PinDotsProps {
  /** Jumlah digit yang sudah diketik. */
  filled: number;
  length: number;
  /** Semua titik merah (PIN salah / tidak cocok). */
  error?: boolean;
  /** Berubah → titik bergoyang sekali (umpan balik PIN salah). */
  shakeKey?: number;
}

const DOT = 14;
const SHAKE_STEP_MS = 50;

const useStyles = makeStyles(({ colors }) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.heroControl,
  },
}));

/** Indikator PIN 6 titik (pen `V2/PinDots`) di atas latar gradien hero. */
export default function PinDots({
  filled,
  length,
  error = false,
  shakeKey = 0,
}: PinDotsProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const offset = useSharedValue(0);

  useEffect(() => {
    if (shakeKey === 0) {
      return;
    }
    offset.value = withSequence(
      ...[-10, 10, -8, 8, -4, 0].map(x =>
        withTiming(x, { duration: SHAKE_STEP_MS }),
      ),
    );
  }, [shakeKey, offset]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <Animated.View
      style={[styles.row, shakeStyle]}
      accessibilityRole="text"
      accessibilityValue={{ min: 0, max: length, now: filled }}
    >
      {Array.from({ length }, (_, index) => {
        const color = error
          ? colors.expense
          : index < filled
          ? colors.primary
          : undefined;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              !!color && { backgroundColor: color, borderColor: color },
            ]}
          />
        );
      })}
    </Animated.View>
  );
}
