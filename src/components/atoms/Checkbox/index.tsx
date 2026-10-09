import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';

export interface CheckboxProps {
  checked: boolean;
}

const useStyles = makeStyles(({ colors }) => ({
  box: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.text3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: { backgroundColor: colors.primary, borderColor: colors.primary },
}));

/** Kotak centang 22, radius 7 (tampilan saja; baris pembungkus yang menangani tap). */
export default function Checkbox({ checked }: CheckboxProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={[styles.box, checked && styles.checked]}>
      {checked && <Check size={14} strokeWidth={3} color={colors.primaryFg} />}
    </View>
  );
}
