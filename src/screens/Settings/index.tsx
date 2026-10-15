import { useCallback, useState } from 'react';
import { View } from 'react-native';
import {
  Bug,
  Coins,
  FingerprintPattern,
  KeyRound,
  Lock,
  RotateCcw,
  TriangleAlert,
  UserCheck,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Switch from '@/components/atoms/Switch';
import Typography from '@/components/atoms/Typography';
import MenuGroup from '@/components/molecules/MenuGroup';
import MenuRow from '@/components/molecules/MenuRow';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';
import MainLayout from '@/components/templates/MainLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useAppLock } from '@/hooks/useAppLock';
import { useBiometricStatus } from '@/hooks/useBiometricStatus';
import { useUserApproval } from '@/hooks/useUserApproval';
import { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { resetAccountDataApi } from '@/services/api/account.service';
import { isAppLockSupported } from '@/services/native/appLock';
import { cancelAllReminders } from '@/services/notification/scheduleReminder';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setBiometricEnabled } from '@/store/slices/appLockSlice';
import { accountDataReset } from '@/store/slices/resetOnSignOut';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import Reveal from '@/components/atoms/Reveal';

const useStyles = makeStyles(({ colors }) => ({
  danger: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.expense,
    backgroundColor: colors.expenseSoft,
  },
  dangerHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dangerTitle: { fontSize: 16, lineHeight: 22 },
  dangerText: { lineHeight: 19 },
}));

/**
 * Pengaturan (pen `k0SKz`, port SettingsPage web): Keamanan (kunci aplikasi, Android saja; pen
 * "Pengaturan · Kunci aktif/mati"), menu Admin (dengan badge pendaftaran baru) dan Umum, plus Zona
 * Berbahaya (Reset Data). "Backend API" web tidak dibawa (dokumentasi developer).
 */
export default function SettingsScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.SETTINGS>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const showToast = useToast();
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(state => state.auth.user?.role === 'admin');
  const { currency, decimalPlaces } = useAppSelector(state => state.settings);
  const { pendingCount, loadUsers } = useUserApproval();
  const appLock = useAppSelector(state => state.appLock);
  const biometricStatus = useBiometricStatus();
  const { promptBiometric } = useAppLock();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Badge dihitung ulang tiap kembali ke sini (mis. setelah mengaktifkan pengguna).
  useFocusEffect(
    useCallback(() => {
      if (isAdmin) {
        loadUsers().catch(() => {});
      }
    }, [isAdmin, loadUsers]),
  );

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetAccountDataApi();
      dispatch(accountDataReset());
      cancelAllReminders().catch(() => {});
      setConfirmReset(false);
      showToast(t('settingsDanger.resetSuccess'), 'success');
    } catch (error) {
      setConfirmReset(false);
      showToast(
        error instanceof Error ? error.message : t('settingsDanger.resetError'),
        'error',
      );
    } finally {
      setResetting(false);
    }
  };

  // Aktifkan = buat PIN dulu; matikan = masukkan PIN dulu.
  const toggleAppLock = () => {
    if (appLock.enabled) {
      navigation.navigate(ROUTES.APP_LOCK_PIN, { mode: 'disable' });
    } else {
      navigation.navigate(ROUTES.APP_LOCK_SETUP, { mode: 'enable' });
    }
  };

  // Menyalakan sidik jari dikonfirmasi dengan sidik jari itu sendiri.
  const toggleBiometric = async () => {
    if (appLock.biometricEnabled) {
      dispatch(setBiometricEnabled(false));
      return;
    }
    const result = await promptBiometric();
    if (result === 'success') {
      dispatch(setBiometricEnabled(true));
    } else if (result === 'lockout') {
      showToast(t('appLock.biometricLockout'), 'info');
    }
  };

  const sections = [
    isAppLockSupported ? (
      <MenuGroup key="security" title={t('appLock.sectionSecurity')}>
        <MenuRow
          renderIcon={color => <Lock size={18} color={color} />}
          title={t('appLock.settingTitle')}
          description={t('appLock.settingDescription')}
          showChevron={false}
          trailing={<Switch value={appLock.enabled} />}
          accessibilityRole="switch"
          accessibilityState={{ checked: appLock.enabled }}
          onPress={toggleAppLock}
        />
        {appLock.enabled && biometricStatus !== 'unavailable' && (
          <MenuRow
            tone="income"
            renderIcon={color => <FingerprintPattern size={18} color={color} />}
            title={t('appLock.biometricSettingTitle')}
            description={t(
              biometricStatus === 'available'
                ? 'appLock.biometricSettingDescription'
                : 'appLock.biometricNotEnrolled',
            )}
            showChevron={false}
            disabled={biometricStatus !== 'available'}
            trailing={
              <Switch
                value={
                  appLock.biometricEnabled && biometricStatus === 'available'
                }
                disabled={biometricStatus !== 'available'}
              />
            }
            accessibilityRole="switch"
            accessibilityState={{
              checked: appLock.biometricEnabled,
              disabled: biometricStatus !== 'available',
            }}
            onPress={toggleBiometric}
          />
        )}
        {appLock.enabled && (
          <MenuRow
            tone="investment"
            renderIcon={color => <KeyRound size={18} color={color} />}
            title={t('appLock.changePinTitle')}
            description={t('appLock.changePinDescription')}
            onPress={() =>
              navigation.navigate(ROUTES.APP_LOCK_PIN, { mode: 'change' })
            }
          />
        )}
      </MenuGroup>
    ) : null,
    isAdmin ? (
      <MenuGroup key="admin" title={t('settingsMenu.sectionAdmin')}>
        <MenuRow
          tone="income"
          renderIcon={color => <UserCheck size={18} color={color} />}
          title={t('settingsMenu.userApproval.title')}
          description={t('settingsMenu.userApproval.description')}
          trailing={
            pendingCount > 0 ? (
              <Badge
                tone="income"
                size="md"
                label={t('settingsMenu.newCount', { n: pendingCount })}
              />
            ) : undefined
          }
          onPress={() => navigation.navigate(ROUTES.SETTINGS_USER_APPROVAL)}
        />
        <MenuRow
          tone="expense"
          renderIcon={color => <Bug size={18} color={color} />}
          title={t('settingsMenu.errorLog.title')}
          description={t('settingsMenu.errorLog.description')}
          onPress={() => navigation.navigate(ROUTES.SETTINGS_ERROR_LOG)}
        />
      </MenuGroup>
    ) : null,
    <MenuGroup key="general" title={t('settingsMenu.sectionGeneral')}>
      <MenuRow
        tone="investment"
        renderIcon={color => <Coins size={18} color={color} />}
        title={t('settingsMenu.currency.title')}
        description={`${currency} · ${t('settingsMenu.decimalCount', {
          n: decimalPlaces,
        })}`}
        onPress={() => navigation.navigate(ROUTES.SETTINGS_CURRENCY)}
      />
    </MenuGroup>,
    <View key="danger" style={styles.danger}>
      <View style={styles.dangerHead}>
        <TriangleAlert size={18} color={colors.expenseText} />
        <Typography variant="label" tone="expense" style={styles.dangerTitle}>
          {t('settingsDanger.title')}
        </Typography>
      </View>
      <Typography variant="secondary" tone="muted" style={styles.dangerText}>
        {t('settingsDanger.description')}
      </Typography>
      <Button
        variant="danger"
        size="md"
        label={t('settingsDanger.resetButton')}
        renderIcon={color => <RotateCcw size={18} color={color} />}
        onPress={() => setConfirmReset(true)}
      />
    </View>,
  ].filter(Boolean);

  return (
    <MainLayout
      title={t('nav.settings')}
      subtitle={t('settingsMenu.subtitle')}
      withTabBar
    >
      {sections.map((section, index) => (
        <Reveal delay={index * 40} key={(section as { key: string }).key}>
          {section}
        </Reveal>
      ))}
      <ConfirmDialog
        visible={confirmReset}
        tone="danger"
        renderIcon={color => <RotateCcw size={24} color={color} />}
        title={t('settingsDanger.resetConfirmTitle')}
        message={t('settingsDanger.resetConfirmDescription')}
        confirmLabel={t('settingsDanger.resetConfirmAction')}
        cancelLabel={t('common.cancel')}
        loading={resetting}
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </MainLayout>
  );
}
