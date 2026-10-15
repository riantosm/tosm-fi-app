import { ArrowRight, Lock } from 'lucide-react-native';
import { View } from 'react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { layout, spacing } from '@/theme/metrics';

export interface LockedBannerProps {
  message: string;
  actionLabel: string;
  onAction: () => void;
}

const useStyles = makeStyles(({ colors }) => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: layout.gutter,
    backgroundColor: colors.primarySoft,
  },
  text: { flex: 1 },
  action: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
}));

/**
 * Strip "Mode cepat" (pen `V2/LockedBanner`) di bawah app bar pintasan yang dibuka saat app
 * terkunci (Catat cepat, Dompet saya), dengan tautan Masuk untuk membuka kunci.
 */
export default function LockedBanner({
  message,
  actionLabel,
  onAction,
}: LockedBannerProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.banner}>
      <Lock size={15} color={colors.primaryText} />
      <Typography variant="meta" tone="primary" style={styles.text}>
        {message}
      </Typography>
      <PressableScale
        accessibilityRole="button"
        hitSlop={10}
        onPress={onAction}
        style={styles.action}
      >
        <Typography variant="tileLabel" tone="primary">
          {actionLabel}
        </Typography>
        <ArrowRight size={14} color={colors.primaryText} />
      </PressableScale>
    </View>
  );
}
