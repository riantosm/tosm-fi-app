import type { ReactNode } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import PressableScale, {
  type PressableScaleProps,
} from '@/components/atoms/PressableScale';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/metrics';

export type IconButtonVariant =
  | 'surface'
  | 'surface2'
  | 'hero'
  | 'primary'
  | 'ghost';

export interface IconButtonProps
  extends Omit<PressableScaleProps, 'children' | 'accessibilityLabel'> {
  /** Wajib: label aksesibilitas. */
  label: string;
  /** Render ikon (ukuran 18) dengan warna varian. */
  renderIcon: (color: string, size: number) => ReactNode;
  variant?: IconButtonVariant;
  /** 36 (hero), 38 (app bar & sheet), 42 (kalkulator). */
  size?: number;
  shape?: 'circle' | 'square';
}

const variantStyles: Record<IconButtonVariant, ViewStyle> = {
  surface: { backgroundColor: colors.surface },
  surface2: { backgroundColor: colors.surface2 },
  hero: { backgroundColor: colors.heroControl },
  primary: { backgroundColor: colors.primary },
  ghost: { backgroundColor: colors.transparent },
};

const iconColors: Record<IconButtonVariant, string> = {
  surface: colors.text2,
  surface2: colors.text2,
  hero: colors.heroFg,
  primary: colors.primaryFg,
  ghost: colors.text2,
};

export default function IconButton({
  label,
  renderIcon,
  variant = 'surface2',
  size = 38,
  shape = 'circle',
  style,
  ...rest
}: IconButtonProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={[
        styles.base,
        variantStyles[variant],
        {
          width: size,
          height: size,
          borderRadius: shape === 'circle' ? radius.pill : radius.control,
        },
        style,
      ]}
      {...rest}
    >
      {renderIcon(iconColors[variant], 18)}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
