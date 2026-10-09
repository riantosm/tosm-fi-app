import type { ReactNode } from 'react';
import PressableScale, {
  type PressableScaleProps,
} from '@/components/atoms/PressableScale';
import { useTheme } from '@/contexts/ThemeContext';
import type { ColorTokens } from '@/theme/colors';
import { makeStyles } from '@/theme/makeStyles';
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

const iconColor = (colors: ColorTokens): Record<IconButtonVariant, string> => ({
  surface: colors.text2,
  surface2: colors.text2,
  hero: colors.heroFg,
  primary: colors.primaryFg,
  ghost: colors.text2,
});

const useStyles = makeStyles(({ colors }) => ({
  base: { alignItems: 'center', justifyContent: 'center' },
  surface: { backgroundColor: colors.surface },
  surface2: { backgroundColor: colors.surface2 },
  hero: { backgroundColor: colors.heroControl },
  primary: { backgroundColor: colors.primary },
  ghost: { backgroundColor: colors.transparent },
}));

export default function IconButton({
  label,
  renderIcon,
  variant = 'surface2',
  size = 38,
  shape = 'circle',
  style,
  ...rest
}: IconButtonProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={[
        styles.base,
        styles[variant],
        {
          width: size,
          height: size,
          borderRadius: shape === 'circle' ? radius.pill : radius.control,
        },
        style,
      ]}
      {...rest}
    >
      {renderIcon(iconColor(colors)[variant], 18)}
    </PressableScale>
  );
}
