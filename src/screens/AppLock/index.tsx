import type { ReactNode } from 'react';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FingerprintPattern,
  History,
  LogIn,
  Wallet,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import AiMark from '@/components/atoms/AiMark';
import Button from '@/components/atoms/Button';
import LogoMark from '@/components/atoms/LogoMark';
import PressableScale from '@/components/atoms/PressableScale';
import Reveal from '@/components/atoms/Reveal';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppLock } from '@/hooks/useAppLock';
import { useBiometricStatus } from '@/hooks/useBiometricStatus';
import { useLanguage } from '@/hooks/useLanguage';
import { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { useAppSelector } from '@/store/hooks';
import { makeStyles } from '@/theme/makeStyles';
import { layout, radius, spacing } from '@/theme/metrics';

const HERO_IMAGE = require('@/assets/images/app-lock-hero.webp');

const useStyles = makeStyles(({ colors, shadows }) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  topBar: {
    height: layout.appBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: layout.heroGutter,
  },
  lang: {
    flexDirection: 'row',
    gap: 2,
    padding: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
  },
  langItem: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  langActive: { backgroundColor: colors.surface, ...shadows.thumb },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wordmark: { fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  tagline: { marginTop: spacing.sm },
  imageBox: {
    flexShrink: 1,
    width: '100%',
    maxWidth: 300,
    aspectRatio: 1,
    marginTop: spacing.lg,
  },
  image: { width: '100%', height: '100%' },
  bottom: {
    gap: spacing.lg,
    paddingHorizontal: layout.heroGutter,
    paddingBottom: 28,
  },
  shortcuts: { flexDirection: 'row', gap: spacing.md },
  shortcut: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  shortcutTexts: { alignItems: 'center', gap: 1, alignSelf: 'stretch' },
  shortcutLabel: { fontSize: 13.5, lineHeight: 18 },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletIcon: { backgroundColor: colors.incomeSoft },
  historyIcon: { backgroundColor: colors.investmentSoft },
}));

/**
 * Beranda kunci aplikasi (pen "Kunci aplikasi · Beranda"): layar pertama saat app terkunci.
 * Pintasan Catat cepat, Dompet saya & Transaksi (3 hari) terbuka tanpa kunci (mode cepat);
 * "Masuk" → sidik jari / PIN.
 */
export default function AppLockScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.APP_LOCK>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { language, setLanguage, options } = useLanguage();
  const { startUnlock } = useAppLock();
  const biometricEnabled = useAppSelector(
    state => state.appLock.biometricEnabled,
  );
  const biometricStatus = useBiometricStatus();
  const withBiometric = biometricEnabled && biometricStatus === 'available';

  const shortcut = (
    label: string,
    caption: string,
    icon: ReactNode,
    onPress: () => void,
  ) => (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${caption}`}
      scaleTo={0.97}
      onPress={onPress}
      style={styles.shortcut}
    >
      {icon}
      <View style={styles.shortcutTexts}>
        <Typography
          variant="label"
          numberOfLines={1}
          style={styles.shortcutLabel}
        >
          {label}
        </Typography>
        <Typography variant="caption" tone="subtle" numberOfLines={1}>
          {caption}
        </Typography>
      </View>
    </PressableScale>
  );

  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={styles.root}
    >
      <View style={styles.topBar}>
        <View style={styles.lang} accessibilityRole="radiogroup">
          {options.map(option => {
            const active = option.code === language;
            return (
              <PressableScale
                key={option.code}
                accessibilityRole="radio"
                accessibilityLabel={option.nativeLabel}
                accessibilityState={{ selected: active }}
                onPress={() => setLanguage(option.code)}
                style={[styles.langItem, active && styles.langActive]}
              >
                <Typography
                  variant="tileLabel"
                  tone={active ? 'primary' : 'subtle'}
                >
                  {option.short}
                </Typography>
              </PressableScale>
            );
          })}
        </View>
      </View>

      <Reveal style={styles.hero}>
        <View style={styles.brand}>
          <LogoMark size="md" />
          <Typography variant="wordmark" style={styles.wordmark}>
            {t('common.appName')}
          </Typography>
        </View>
        <Typography tone="muted" align="center" style={styles.tagline}>
          {t('auth.heroTitle')}
        </Typography>
        <View style={styles.imageBox}>
          <Image
            source={HERO_IMAGE}
            resizeMode="contain"
            style={styles.image}
            accessibilityIgnoresInvertColors
          />
        </View>
      </Reveal>

      <Reveal delay={80} style={styles.bottom}>
        <View style={styles.shortcuts}>
          {shortcut(
            t('assistant.title'),
            t('appLock.shortcutAiCaption'),
            <AiMark size="md" />,
            () => navigation.navigate(ROUTES.QUICK_ADD),
          )}
          {shortcut(
            t('appLock.myWallets'),
            t('appLock.shortcutWalletCaption'),
            <View style={[styles.iconTile, styles.walletIcon]}>
              <Wallet size={19} color={colors.incomeText} />
            </View>,
            () => navigation.navigate(ROUTES.WALLET),
          )}
          {shortcut(
            t('appLock.shortcutRecentTitle'),
            t('appLock.shortcutRecentCaption'),
            <View style={[styles.iconTile, styles.historyIcon]}>
              <History size={19} color={colors.investmentText} />
            </View>,
            () => navigation.navigate(ROUTES.RECENT_TRANSACTIONS),
          )}
        </View>
        <Button
          size="xl"
          label={t('appLock.signIn')}
          renderIcon={color =>
            withBiometric ? (
              <FingerprintPattern size={18} color={color} />
            ) : (
              <LogIn size={18} color={color} />
            )
          }
          onPress={startUnlock}
        />
      </Reveal>
    </SafeAreaView>
  );
}
