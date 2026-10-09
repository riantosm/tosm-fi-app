import { ChevronUp, Languages } from 'lucide-react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';

export interface LanguagePillProps {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
}

const useStyles = makeStyles(({ colors }) => ({
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
}));

/** Pemicu pemilih bahasa di dasar layar auth (pen: Login HP → "Lang"). */
export default function LanguagePill({
  label,
  accessibilityLabel,
  onPress,
}: LanguagePillProps) {
  const styles = useStyles();
  const { colors } = useTheme();
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
