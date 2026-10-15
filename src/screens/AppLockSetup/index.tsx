import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { ArrowLeft, Info, KeyRound, ShieldCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import IconButton from '@/components/atoms/IconButton';
import Typography from '@/components/atoms/Typography';
import PinDots from '@/components/molecules/PinDots';
import PinPad from '@/components/molecules/PinPad';
import PinLayout from '@/components/templates/PinLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import {
  createPinSecret,
  getBiometricStatus,
  PIN_LENGTH,
} from '@/services/native/appLock';
import { useAppDispatch } from '@/store/hooks';
import { changePin, enableAppLock } from '@/store/slices/appLockSlice';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';

const MISMATCH_RESET_MS = 700;

const useStyles = makeStyles(({ colors, shadows }) => ({
  title: { flex: 1 },
  step: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.heroControl,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 6 },
}));

/**
 * Buat & konfirmasi PIN 6 digit (pen "Buat PIN", "Konfirmasi PIN", "Tidak cocok"). Mode `enable`
 * mengaktifkan kunci aplikasi (sidik jari ikut aktif kalau HP mendukung), `change` mengganti PIN.
 */
export default function AppLockSetupScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof ROUTES.APP_LOCK_SETUP>) {
  const { mode } = route.params;
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const showToast = useToast();

  const [firstPin, setFirstPin] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const confirming = firstPin.length === PIN_LENGTH;

  const save = async (value: string) => {
    setBusy(true);
    try {
      const secret = await createPinSecret(value);
      if (mode === 'enable') {
        const biometric = (await getBiometricStatus()) === 'available';
        dispatch(enableAppLock({ ...secret, biometricEnabled: biometric }));
        showToast(t('appLock.enabledToast'), 'success');
      } else {
        dispatch(changePin(secret));
        showToast(t('appLock.pinChangedToast'), 'success');
      }
      navigation.goBack();
    } catch {
      setBusy(false);
      setPin('');
      showToast(t('appLock.saveError'), 'error');
    }
  };

  const handleComplete = (value: string) => {
    if (!confirming) {
      setFirstPin(value);
      setPin('');
      return;
    }
    if (value === firstPin) {
      save(value);
      return;
    }
    setBusy(true);
    setError(t('appLock.pinMismatch'));
    setShakeKey(key => key + 1);
    resetTimer.current = setTimeout(() => {
      setPin('');
      setBusy(false);
    }, MISMATCH_RESET_MS);
  };

  const handleDigit = (digit: string) => {
    if (busy || pin.length >= PIN_LENGTH) {
      return;
    }
    const next = pin + digit;
    setPin(next);
    if (error) {
      setError('');
    }
    if (next.length === PIN_LENGTH) {
      handleComplete(next);
    }
  };

  // Kembali di langkah konfirmasi = ulangi dari langkah 1, bukan keluar.
  const handleBack = () => {
    if (confirming && !busy) {
      setFirstPin('');
      setPin('');
      setError('');
      return;
    }
    navigation.goBack();
  };

  return (
    <PinLayout
      header={
        <>
          <IconButton
            variant="hero"
            label={t('common.back')}
            onPress={handleBack}
            renderIcon={(color, size) => (
              <ArrowLeft size={size} color={color} />
            )}
          />
          <Typography
            variant="pageTitle"
            tone="hero"
            numberOfLines={1}
            style={styles.title}
          >
            {t(
              mode === 'enable' ? 'appLock.setupTitle' : 'appLock.changeTitle',
            )}
          </Typography>
          <View style={styles.step}>
            <Typography variant="captionStrong" tone="primary">
              {t('appLock.step', { current: confirming ? 2 : 1, total: 2 })}
            </Typography>
          </View>
        </>
      }
      badge={
        <View style={styles.iconWrap}>
          {confirming ? (
            <ShieldCheck size={28} color={colors.primary} />
          ) : (
            <KeyRound size={28} color={colors.primary} />
          )}
        </View>
      }
      title={t(confirming ? 'appLock.confirmPinTitle' : 'appLock.newPinTitle')}
      subtitle={t(
        confirming ? 'appLock.confirmPinSubtitle' : 'appLock.newPinSubtitle',
      )}
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
          deleteLabel={t('appLock.deleteDigit')}
        />
      }
      footer={
        <View style={styles.hint}>
          <Info size={14} color={colors.text3} />
          <Typography variant="meta" tone="subtle">
            {t(confirming ? 'appLock.pinStoredHint' : 'appLock.pinWeakHint')}
          </Typography>
        </View>
      }
    >
      <PinDots
        length={PIN_LENGTH}
        filled={pin.length}
        error={!!error && busy}
        shakeKey={shakeKey}
      />
    </PinLayout>
  );
}
