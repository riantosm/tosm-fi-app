import { forwardRef, useRef, type ComponentRef } from 'react';
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { pressScale, springs } from '@/utils/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Skala saat ditekan. Default `pressScale` (0.96). */
  scaleTo?: number;
}

/**
 * Primitive tunggal untuk semua elemen yang bisa di-tap. Memakai `Animated` bawaan dengan native
 * driver (bukan worklet Reanimated): dipakai ratusan kali per layar, dan satu `useAnimatedStyle`
 * per instance membuat render awal layar/sheet terasa lambat. Pegas tetap jalan di UI thread.
 */
const PressableScale = forwardRef<
  ComponentRef<typeof Pressable>,
  PressableScaleProps
>(function PressableScaleRender(
  { scaleTo = pressScale, style, onPressIn, onPressOut, disabled, ...rest },
  ref,
) {
  const scale = useRef(new Animated.Value(1)).current;
  const springTo = (toValue: number) =>
    Animated.spring(scale, {
      toValue,
      damping: springs.press.damping,
      stiffness: springs.press.stiffness,
      mass: springs.press.mass,
      useNativeDriver: true,
    }).start();

  return (
    <AnimatedPressable
      ref={ref}
      disabled={disabled}
      onPressIn={event => {
        springTo(scaleTo);
        onPressIn?.(event);
      }}
      onPressOut={event => {
        springTo(1);
        onPressOut?.(event);
      }}
      style={[style, { transform: [{ scale }] }]}
      {...rest}
    />
  );
});

export default PressableScale;
