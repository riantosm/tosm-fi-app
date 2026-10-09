import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import BottomSheet from '@/components/organisms/BottomSheet';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';

export interface OptionSheetOption<T extends string> {
  value: T;
  label: string;
  /** Ikon opsi (ukuran 18) dengan warna state. */
  renderIcon?: (color: string) => ReactNode;
}

export interface OptionSheetProps<T extends string> {
  visible: boolean;
  title: string;
  closeLabel: string;
  options: OptionSheetOption<T>[];
  value: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

const useStyles = makeStyles(({ colors }) => ({
  list: { gap: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.field,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  label: { flex: 1 },
}));

/** Sheet pilihan tunggal (bahasa, urutkan). Pilihan aktif: primarySoft + stroke primary + centang. */
export default function OptionSheet<T extends string>({
  visible,
  title,
  closeLabel,
  options,
  value,
  onSelect,
  onClose,
}: OptionSheetProps<T>) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <BottomSheet
      visible={visible}
      title={title}
      closeLabel={closeLabel}
      onClose={onClose}
      scroll={false}
    >
      <View style={styles.list}>
        {options.map(option => {
          const selected = option.value === value;
          const color = selected ? colors.primaryText : colors.text2;
          return (
            <PressableScale
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              scaleTo={0.98}
              onPress={() => onSelect(option.value)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              {option.renderIcon?.(color)}
              <Typography
                variant="label"
                tone={selected ? 'primary' : 'default'}
                style={styles.label}
              >
                {option.label}
              </Typography>
              {selected && <Check size={18} color={colors.primaryText} />}
            </PressableScale>
          );
        })}
      </View>
    </BottomSheet>
  );
}
