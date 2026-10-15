import { Modal, View } from 'react-native';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  FingerprintPattern,
  Grid3x3,
  Lock,
  Settings2,
  ShieldCheck,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { transitions } from '@/utils/motion';

export interface AppLockOfferSheetProps {
  visible: boolean;
  onEnable: () => void;
  onLater: () => void;
}

const useStyles = makeStyles(({ colors, shadows }) => ({
  root: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.scrim },
  sheet: {
    alignItems: 'center',
    gap: 18,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    backgroundColor: colors.surface,
    ...shadows.pop,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  texts: { alignSelf: 'stretch', gap: spacing.sm },
  body: { lineHeight: 21 },
  points: {
    alignSelf: 'stretch',
    paddingVertical: spacing.xs,
    paddingHorizontal: 14,
    borderRadius: radius.control,
    backgroundColor: colors.surface2,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 11,
  },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  pointIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  pointTexts: { flex: 1, gap: 1 },
  footer: { alignSelf: 'stretch', gap: 6, paddingTop: 6 },
  later: { height: 44, alignItems: 'center', justifyContent: 'center' },
}));

/**
 * Popup "Kunci TosmFi?" (pen `Popup/Aktifkan kunci aplikasi`), ditawarkan sekali setelah login.
 * Bottom sheet tanpa tombol tutup: dijawab lewat "Aktifkan sekarang" atau "Nanti saja".
 */
export default function AppLockOfferSheet({
  visible,
  onEnable,
  onLater,
}: AppLockOfferSheetProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const points = [
    {
      key: 'biometric',
      renderIcon: (color: string) => (
        <FingerprintPattern size={17} color={color} />
      ),
    },
    {
      key: 'pin',
      renderIcon: (color: string) => <Grid3x3 size={17} color={color} />,
    },
    {
      key: 'settings',
      renderIcon: (color: string) => <Settings2 size={17} color={color} />,
    },
  ];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onLater}
    >
      <View style={styles.root}>
        <MotiView
          from={{ translateY: 80, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={transitions.sheet}
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.md },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.iconWrap}>
            <ShieldCheck size={28} color={colors.primary} />
          </View>
          <View style={styles.texts}>
            <Typography variant="sheetTitle" align="center">
              {t('appLock.offerTitle')}
            </Typography>
            <Typography tone="muted" align="center" style={styles.body}>
              {t('appLock.offerBody')}
            </Typography>
          </View>
          <View style={styles.points}>
            {points.map((point, index) => (
              <View
                key={point.key}
                style={[styles.point, index > 0 && styles.divider]}
              >
                <View style={styles.pointIcon}>
                  {point.renderIcon(colors.primary)}
                </View>
                <View style={styles.pointTexts}>
                  <Typography variant="label">
                    {t(`appLock.offerPoints.${point.key}.title`)}
                  </Typography>
                  <Typography variant="caption" tone="subtle">
                    {t(`appLock.offerPoints.${point.key}.description`)}
                  </Typography>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.footer}>
            <Button
              label={t('appLock.offerEnable')}
              renderIcon={color => <Lock size={17} color={color} />}
              onPress={onEnable}
            />
            <PressableScale
              accessibilityRole="button"
              onPress={onLater}
              style={styles.later}
            >
              <Typography variant="label" tone="muted">
                {t('appLock.offerLater')}
              </Typography>
            </PressableScale>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
}
