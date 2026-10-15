import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { ArrowLeft, Lock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Avatar from '@/components/atoms/Avatar';
import IconButton from '@/components/atoms/IconButton';
import LogoMark from '@/components/atoms/LogoMark';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import PinDots from '@/components/molecules/PinDots';
import PinPad from '@/components/molecules/PinPad';
import PinLayout from '@/components/templates/PinLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useAppLock } from '@/hooks/useAppLock';
import { useBiometricStatus } from '@/hooks/useBiometricStatus';
import { useLogoutDialog } from '@/hooks/useLogoutDialog';
import { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { PIN_LENGTH } from '@/services/native/appLock';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { disableAppLock, unlockApp } from '@/store/slices/appLockSlice';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';

/** Jeda sebelum titik dikosongkan lagi setelah PIN salah (goyang selesai dulu). */
const WRONG_RESET_MS = 600;

const useStyles = makeStyles(({ colors, shadows }) => ({
  side: { width: 38 },
  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  avatarRing: {
    padding: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.heroControl,
    ...shadows.card,
  },
  lockBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    borderWidth: 3,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  forgot: { flexDirection: 'row', alignItems: 'center', gap: 6 },
}));

/**
 * Layar PIN (pen "Kunci aplikasi · PIN" / "PIN salah"). Mode `unlock` membuka app terkunci,
 * `disable` mengonfirmasi mematikan kunci, `change` memverifikasi PIN lama sebelum Ubah PIN.
 * Salah 5× (dihitung bersama semua mode) → logout.
 */
export default function AppLockPinScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof ROUTES.APP_LOCK_PIN>) {
  const { mode } = route.params;
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const { attemptPin, promptBiometric } = useAppLock();
  const { requestLogout, dialog: logoutDialog } = useLogoutDialog();
  const user = useAppSelector(state => state.auth.user);
  const biometricEnabled = useAppSelector(
    state => state.appLock.biometricEnabled,
  );
  const biometricStatus = useBiometricStatus();

  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const firstName = user?.nameUser.trim().split(/\s+/)[0] ?? '';
  const canUseBiometric =
    mode === 'unlock' && biometricEnabled && biometricStatus === 'available';

  const onSuccess = () => {
    if (mode === 'unlock') {
      // RootNavigator berpindah ke grup app biasa (Dashboard).
      dispatch(unlockApp());
    } else if (mode === 'disable') {
      dispatch(disableAppLock());
      showToast(t('appLock.disabledToast'), 'success');
      navigation.goBack();
    } else {
      navigation.replace(ROUTES.APP_LOCK_SETUP, { mode: 'change' });
    }
  };

  const submit = async (value: string) => {
    setBusy(true);
    const result = await attemptPin(value);
    if (result.status === 'ok') {
      onSuccess();
      return;
    }
    if (result.status === 'logout') {
      return; // sesi dibersihkan → layar Login
    }
    setError(t('appLock.wrongPin', { n: result.remaining }));
    setShakeKey(key => key + 1);
    resetTimer.current = setTimeout(() => {
      setPin('');
      setBusy(false);
    }, WRONG_RESET_MS);
  };

  const handleDigit = (digit: string) => {
    if (busy || pin.length >= PIN_LENGTH) {
      return;
    }
    const next = pin + digit;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      submit(next);
    }
  };

  const handleBiometric = async () => {
    const result = await promptBiometric();
    if (result === 'success') {
      dispatch(unlockApp());
    } else if (result === 'lockout') {
      showToast(t('appLock.biometricLockout'), 'info');
    }
  };

  const subtitle = {
    unlock: t('appLock.pinSubtitleUnlock'),
    disable: t('appLock.pinSubtitleDisable'),
    change: t('appLock.pinSubtitleChange'),
  }[mode];

  return (
    <>
      <PinLayout
        header={
          <>
            {navigation.canGoBack() ? (
              <IconButton
                variant="hero"
                label={t('common.back')}
                onPress={navigation.goBack}
                renderIcon={(color, size) => (
                  <ArrowLeft size={size} color={color} />
                )}
              />
            ) : (
              <View style={styles.side} />
            )}
            <View style={styles.brand}>
              <LogoMark size="xs" />
              <Typography variant="wordmark" tone="hero">
                {t('common.appName')}
              </Typography>
            </View>
            <View style={styles.side} />
          </>
        }
        badge={
          <View style={styles.avatarRing}>
            <Avatar name={user?.nameUser ?? ''} size={68} />
            <View style={styles.lockBadge}>
              <Lock size={12} color={colors.primaryFg} />
            </View>
          </View>
        }
        title={firstName ? t('appLock.greeting', { name: firstName }) : ''}
        subtitle={subtitle}
        error={error}
        pad={
          <PinPad
            disabled={busy}
            onDigit={handleDigit}
            onDelete={() => {
              if (!busy) {
                setPin(value => value.slice(0, -1));
              }
            }}
            onBiometric={canUseBiometric ? handleBiometric : undefined}
            biometricLabel={t('appLock.useBiometric')}
            deleteLabel={t('appLock.deleteDigit')}
          />
        }
        footer={
          mode === 'unlock' ? (
            <View style={styles.forgot}>
              <Typography variant="secondary" tone="muted">
                {t('appLock.forgotPin')}
              </Typography>
              <PressableScale
                accessibilityRole="link"
                hitSlop={8}
                onPress={requestLogout}
              >
                <Typography variant="fieldLabel" tone="primary">
                  {t('appLock.forgotPinAction')}
                </Typography>
              </PressableScale>
            </View>
          ) : undefined
        }
      >
        <PinDots
          length={PIN_LENGTH}
          filled={pin.length}
          error={!!error && busy}
          shakeKey={shakeKey}
        />
      </PinLayout>
      {logoutDialog}
    </>
  );
}
