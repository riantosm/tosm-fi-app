import { TextInput, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import PressableScale from '@/components/atoms/PressableScale';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { textStyles } from '@/theme/typography';

export interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  clearLabel: string;
  autoFocus?: boolean;
  /** pill = halaman (surface + stroke) · filled = di dalam sheet (surface2). */
  variant?: 'pill' | 'filled';
}

const useStyles = makeStyles(({ colors }) => ({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 44,
    paddingHorizontal: spacing.lg,
  },
  pill: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filled: {
    height: 48,
    borderRadius: radius.field,
    backgroundColor: colors.surface2,
  },
  input: {
    ...textStyles.body,
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    color: colors.text,
  },
  clear: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
  },
}));

/** Kolom cari dengan tombol hapus. */
export default function SearchField({
  value,
  onChangeText,
  placeholder,
  clearLabel,
  autoFocus,
  variant = 'pill',
}: SearchFieldProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={[styles.box, styles[variant]]}>
      <Search size={16} color={colors.text3} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text3}
        selectionColor={colors.primary}
        autoFocus={autoFocus}
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel={placeholder}
        style={styles.input}
      />
      {!!value && (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={clearLabel}
          hitSlop={8}
          onPress={() => onChangeText('')}
          style={styles.clear}
        >
          <X size={12} color={colors.text3} />
        </PressableScale>
      )}
    </View>
  );
}
