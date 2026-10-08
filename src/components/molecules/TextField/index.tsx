import { forwardRef, useState, type ComponentRef, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/metrics';
import { textStyles } from '@/theme/typography';

/** outlined: di atas surface polos (form auth) · filled: di dalam sheet/kartu form. */
export type TextFieldVariant = 'outlined' | 'filled';

export interface TextFieldProps extends TextInputProps {
  label: string;
  variant?: TextFieldVariant;
  /** Ikon depan (ukuran 18) dengan warna yang diberikan. */
  renderLeadingIcon?: (color: string) => ReactNode;
  helper?: string;
  error?: string;
  /** Tampilkan tombol lihat/sembunyikan untuk input password. */
  secureToggle?: boolean;
  toggleLabels?: { show: string; hide: string };
}

const TextField = forwardRef<ComponentRef<typeof TextInput>, TextFieldProps>(
  function TextFieldRender(
    {
      label,
      variant = 'outlined',
      renderLeadingIcon,
      helper,
      error,
      secureToggle = false,
      toggleLabels,
      style,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) {
    const [focused, setFocused] = useState(false);
    const [hidden, setHidden] = useState(true);
    const ToggleIcon = hidden ? Eye : EyeOff;

    return (
      <View style={styles.wrapper}>
        <Typography variant="fieldLabel" tone="muted">
          {label}
        </Typography>
        <View
          style={[
            styles.box,
            variant === 'filled' ? styles.filled : styles.outlined,
            focused && styles.focused,
            !!error && styles.error,
          ]}
        >
          {renderLeadingIcon?.(colors.text3)}
          <TextInput
            ref={ref}
            placeholderTextColor={colors.text3}
            secureTextEntry={secureToggle && hidden}
            autoCapitalize="none"
            style={[styles.input, style]}
            {...rest}
            onFocus={event => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={event => {
              setFocused(false);
              onBlur?.(event);
            }}
          />
          {secureToggle && (
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={
                hidden ? toggleLabels?.show : toggleLabels?.hide
              }
              hitSlop={8}
              onPress={() => setHidden(value => !value)}
            >
              <ToggleIcon size={18} color={colors.text3} />
            </PressableScale>
          )}
        </View>
        {!!(error || helper) && (
          <Typography variant="caption" tone={error ? 'expense' : 'subtle'}>
            {error || helper}
          </Typography>
        )}
      </View>
    );
  },
);

export default TextField;

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.field,
    borderWidth: 1,
  },
  outlined: { backgroundColor: colors.surface, borderColor: colors.border },
  filled: { backgroundColor: colors.surface2, borderColor: colors.surface2 },
  focused: { borderColor: colors.primary },
  error: { borderColor: colors.expense },
  input: {
    ...textStyles.body,
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    color: colors.text,
  },
});
