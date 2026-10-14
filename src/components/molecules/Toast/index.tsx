import { View } from 'react-native';
import { CircleCheck, CircleX, Info } from 'lucide-react-native';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { Tone } from '@/theme/tones';
import { fonts } from '@/theme/typography';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastProps {
  message: string;
  tone?: ToastTone;
}

const TONE: Record<ToastTone, { Icon: typeof Info; tone: Tone }> = {
  success: { Icon: CircleCheck, tone: 'income' },
  error: { Icon: CircleX, tone: 'expense' },
  info: { Icon: Info, tone: 'primary' },
};

const useStyles = makeStyles(({ colors, shadows }) => ({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    ...shadows.nav,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Web: pesan toast Inter 500/13.5.
  message: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 13.5 },
}));

/** Toast Mist (pen `vFxAJ`): pill surface + ikon bulat bernada. Tampilan saja; lihat ToastContext. */
export default function Toast({ message, tone = 'info' }: ToastProps) {
  const styles = useStyles();
  const { tones } = useTheme();
  const { Icon, tone: toneKey } = TONE[tone];
  const { soft, text } = tones[toneKey];
  return (
    <View accessibilityRole="alert" style={styles.toast}>
      <View style={[styles.iconWrap, { backgroundColor: soft }]}>
        <Icon size={16} color={text} />
      </View>
      <Typography variant="body" numberOfLines={2} style={styles.message}>
        {message}
      </Typography>
    </View>
  );
}
