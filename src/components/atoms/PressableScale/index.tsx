import { forwardRef, type ComponentRef } from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { pressScale, springs } from '@/utils/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Skala saat ditekan. Default `pressScale` (0.96). */
  scaleTo?: number;
}

/** Primitive tunggal untuk semua elemen yang bisa di-tap. */
const PressableScale = forwardRef<
  ComponentRef<typeof Pressable>,
  PressableScaleProps
>(function PressableScaleRender(
  { scaleTo = pressScale, style, onPressIn, onPressOut, disabled, ...rest },
  ref,
) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      ref={ref}
      disabled={disabled}
      onPressIn={event => {
        scale.value = withSpring(scaleTo, springs.press);
        onPressIn?.(event);
      }}
      onPressOut={event => {
        scale.value = withSpring(1, springs.press);
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
      {...rest}
    />
  );
});

export default PressableScale;
