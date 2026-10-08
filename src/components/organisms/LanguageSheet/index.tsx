import { StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import BottomSheet from '@/components/organisms/BottomSheet';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/metrics';

export interface LanguageSheetOption<T extends string> {
  value: T;
  label: string;
}

export interface LanguageSheetProps<T extends string> {
  visible: boolean;
  title: string;
  closeLabel: string;
  options: LanguageSheetOption<T>[];
  value: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

/** Sheet pilihan tunggal (bahasa). Pilihan aktif: primarySoft + stroke primary + centang. */
export default function LanguageSheet<T extends string>({
  visible,
  title,
  closeLabel,
  options,
  value,
  onSelect,
  onClose,
}: LanguageSheetProps<T>) {
  return (
    <BottomSheet
      visible={visible}
      title={title}
      closeLabel={closeLabel}
      onClose={onClose}
    >
      <View style={styles.list}>
        {options.map(option => {
          const selected = option.value === value;
          return (
            <PressableScale
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              scaleTo={0.98}
              onPress={() => onSelect(option.value)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Typography variant="label" style={styles.label}>
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

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
