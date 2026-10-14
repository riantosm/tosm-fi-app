import { forwardRef, useState, type ComponentRef, type ReactNode } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
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
  /** Elemen di ujung kanan field (mis. tombol kalkulator). */
  renderTrailing?: () => ReactNode;
}

const useStyles = makeStyles(({ colors }) => ({
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
  boxMultiline: {
    height: undefined,
    minHeight: 72,
    alignItems: 'flex-start',
    paddingVertical: 14,
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
  inputMultiline: { height: undefined, minHeight: 44 },
}));

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
      renderTrailing,
      style,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) {
    const styles = useStyles();
    const { colors } = useTheme();
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
            rest.multiline && styles.boxMultiline,
            variant === 'filled' ? styles.filled : styles.outlined,
            focused && styles.focused,
            !!error && styles.error,
          ]}
        >
          {renderLeadingIcon?.(colors.text3)}
          <TextInput
            ref={ref}
            placeholderTextColor={colors.text3}
            selectionColor={colors.primary}
            secureTextEntry={secureToggle && hidden}
            autoCapitalize="none"
            style={[
              styles.input,
              rest.multiline && styles.inputMultiline,
              style,
            ]}
            textAlignVertical={rest.multiline ? 'top' : 'center'}
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
          {renderTrailing?.()}
        </View>
        {!!(error || helper) && (
          <Typography
            variant={error ? 'captionMedium' : 'caption'}
            tone={error ? 'expense' : 'subtle'}
          >
            {error || helper}
          </Typography>
        )}
      </View>
    );
  },
);

export default TextField;
