import { View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';

export type AiMarkSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZES: Record<AiMarkSize, { box: number; icon: number }> = {
  xs: { box: 28, icon: 14 },
  sm: { box: 36, icon: 16 },
  md: { box: 40, icon: 18 },
  lg: { box: 48, icon: 22 },
};

const useStyles = makeStyles(({ colors }) => ({
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
}));

/** Identitas AI: lingkaran `primary` + sparkles `primaryFg` (di mana pun Catat cepat muncul). */
export default function AiMark({ size = 'md' }: { size?: AiMarkSize }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { box, icon } = SIZES[size];
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.mark, { width: box, height: box }]}
    >
      <Sparkles size={icon} color={colors.primaryFg} />
    </View>
  );
}
