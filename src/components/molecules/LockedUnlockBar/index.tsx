import { View } from 'react-native';
import { FingerprintPattern, Lock, LogIn } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { layout, radius, spacing } from '@/theme/metrics';

export interface LockedUnlockBarProps {
  message: string;
  actionLabel: string;
  /** Ikon sidik jari di tombol (selain itu ikon masuk). */
  biometric: boolean;
  onUnlock: () => void;
}

const useStyles = makeStyles(({ colors, shadows }) => ({
  bar: {
    position: 'absolute',
    left: layout.heroGutter,
    right: layout.heroGutter,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 60,
    paddingLeft: spacing.xl,
    paddingRight: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    ...shadows.nav,
  },
  text: { flex: 1 },
}));

/**
 * Bar mengambang pengganti bottom nav di pintasan tanpa kunci (pen "Pintasan · Dompet saya" /
 * "Transaksi terakhir"): "Fitur lain terkunci" + tombol Masuk. Induknya harus `flex: 1`.
 */
export default function LockedUnlockBar({
  message,
  actionLabel,
  biometric,
  onUnlock,
}: LockedUnlockBarProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        { bottom: Math.max(insets.bottom, spacing.lg) + spacing.sm },
      ]}
    >
      <Lock size={17} color={colors.text3} />
      <Typography variant="secondary" tone="muted" style={styles.text}>
        {message}
      </Typography>
      <Button
        size="md"
        label={actionLabel}
        renderIcon={color =>
          biometric ? (
            <FingerprintPattern size={17} color={color} />
          ) : (
            <LogIn size={17} color={color} />
          )
        }
        onPress={onUnlock}
      />
    </View>
  );
}
