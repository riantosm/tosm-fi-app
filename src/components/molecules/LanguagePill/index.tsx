import { StyleSheet } from 'react-native';
import { ChevronUp, Languages } from 'lucide-react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/metrics';

export interface LanguagePillProps {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
}

/** Pemicu pemilih bahasa di dasar layar auth (pen: Login HP → "Lang"). */
export default function LanguagePill({
  label,
  accessibilityLabel,
  onPress,
}: LanguagePillProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={styles.pill}
    >
      <Languages size={15} color={colors.text2} />
      <Typography variant="secondary" tone="muted">
        {label}
      </Typography>
      <ChevronUp size={14} color={colors.text3} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});
