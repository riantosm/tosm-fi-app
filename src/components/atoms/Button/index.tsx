import type { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import PressableScale, {
  type PressableScaleProps,
} from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import type { ColorTokens } from '@/theme/colors';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';

export type ButtonVariant =
  | 'primary'
  | 'soft'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'dangerSoft';

/** sm 36 (aksi app bar) · md 44 (dalam kartu) · lg 50 (footer sheet) · xl 52 (submit auth). */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends Omit<PressableScaleProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Render ikon dengan warna label varian. */
  renderIcon?: (color: string) => ReactNode;
}

const labelColor = (colors: ColorTokens): Record<ButtonVariant, string> => ({
  primary: colors.primaryFg,
  soft: colors.primaryText,
  outline: colors.text,
  ghost: colors.primaryText,
  danger: colors.onDanger,
  dangerSoft: colors.expenseText,
});

const useStyles = makeStyles(({ colors }) => ({
  base: {
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  disabled: { opacity: 0.55 },
  sm: { minHeight: 36, paddingHorizontal: 14 },
  md: { minHeight: 44 },
  lg: { minHeight: 50 },
  xl: { minHeight: 52 },
  primary: { backgroundColor: colors.primary },
  soft: { backgroundColor: colors.primarySoft },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: { backgroundColor: colors.transparent },
  danger: { backgroundColor: colors.expenseText },
  dangerSoft: { backgroundColor: colors.expenseSoft },
}));

export default function Button({
  label,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled,
  renderIcon,
  style,
  ...rest
}: ButtonProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const isDisabled = disabled || loading;
  const color = labelColor(colors)[variant];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <View style={styles.content}>
          {renderIcon?.(color)}
          <Typography variant="label" style={{ color }} numberOfLines={1}>
            {label}
          </Typography>
        </View>
      )}
    </PressableScale>
  );
}
