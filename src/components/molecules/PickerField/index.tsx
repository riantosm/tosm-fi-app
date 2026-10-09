import type { ReactNode } from 'react';
import { View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';

export interface PickerFieldProps {
  /** Kosong = tanpa label di atas kotak (label sudah ada di judul seksi). */
  label: string;
  value: string;
  /** Ikon depan (ukuran 18). */
  renderIcon?: (color: string) => ReactNode;
  onPress: () => void;
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
    backgroundColor: colors.surface2,
  },
  value: { flex: 1 },
}));

/** Field ala select (tanggal & jam, pemilih) — kotak field + chevron (DESIGN_SYSTEM.md §6.6). */
export default function PickerField({
  label,
  value,
  renderIcon,
  onPress,
}: PickerFieldProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.wrapper}>
      {!!label && (
        <Typography variant="fieldLabel" tone="muted">
          {label}
        </Typography>
      )}
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={label || value}
        scaleTo={0.99}
        onPress={onPress}
        style={styles.box}
      >
        {renderIcon?.(colors.text3)}
        <Typography numberOfLines={1} style={styles.value}>
          {value}
        </Typography>
        <ChevronDown size={18} color={colors.text3} />
      </PressableScale>
    </View>
  );
}
