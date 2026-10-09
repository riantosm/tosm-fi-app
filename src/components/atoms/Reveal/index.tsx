import { useMemo, type ReactNode } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import Animated, { Easing, FadeIn, FadeInDown } from 'react-native-reanimated';

export interface RevealProps extends Omit<ViewProps, 'style'> {
  /** up = fade + naik 12 px, 260 ms (default) · fade = fade saja, 200 ms. */
  variant?: 'up' | 'fade';
  /** Jeda sebelum mulai (ms), untuk stagger. */
  delay?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

const EASE_OUT = Easing.out(Easing.cubic);

/**
 * Animasi masuk ringan (layout animation `entering` Reanimated, dijalankan native). Pengganti
 * `<MotiView {...fadeInUp}>` untuk konten yang muncul: tanpa shared value / animated style per
 * elemen, jadi render awal layar dengan banyak kartu & baris jauh lebih ringan.
 */
export default function Reveal({
  variant = 'up',
  delay = 0,
  style,
  children,
  ...rest
}: RevealProps) {
  const entering = useMemo(() => {
    if (variant === 'fade') {
      return FadeIn.duration(200).delay(delay);
    }
    return FadeInDown.duration(260)
      .delay(delay)
      .easing(EASE_OUT)
      .withInitialValues({ opacity: 0, transform: [{ translateY: 12 }] });
  }, [variant, delay]);

  return (
    <Animated.View entering={entering} style={style} {...rest}>
      {children}
    </Animated.View>
  );
}
