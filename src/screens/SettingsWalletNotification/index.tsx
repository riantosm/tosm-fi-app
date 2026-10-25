import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, View } from 'react-native';
import {
  BatteryCharging,
  BellRing,
  EyeOff,
  List,
  Star,
  Wallet,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Reveal from '@/components/atoms/Reveal';
import Switch from '@/components/atoms/Switch';
import Typography from '@/components/atoms/Typography';
import MenuGroup from '@/components/molecules/MenuGroup';
import MenuRow from '@/components/molecules/MenuRow';
import OptionRow from '@/components/molecules/OptionRow';
import SettingsPanel from '@/components/organisms/SettingsPanel';
import MainLayout from '@/components/templates/MainLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useWallets } from '@/hooks/useWallets';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import {
  isBatteryOptimizationIgnored,
  requestBatteryOptimizationExemption,
} from '@/services/native/walletRefresh';
import { requestNotificationPermission } from '@/services/notification/scheduleReminder';
import { buildWalletNotificationContent } from '@/services/notification/walletNotification';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectWalletNotificationPrefs,
  setWalletNotification,
  type WalletNotificationContent,
} from '@/store/slices/settingsSlice';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { formatTxTime } from '@/utils/txTime';

const CONTENT_OPTIONS: {
  value: WalletNotificationContent;
  renderIcon: (color: string) => React.ReactNode;
}[] = [
  { value: 'total', renderIcon: color => <Wallet size={18} color={color} /> },
  { value: 'primary', renderIcon: color => <Star size={18} color={color} /> },
  { value: 'all', renderIcon: color => <List size={18} color={color} /> },
];

/** Status pengecualian optimasi baterai, dicek ulang setiap app kembali aktif (setelah dialog). */
function useBatteryExemption() {
  const [exempt, setExempt] = useState<boolean | null>(null);
  const refresh = useCallback(() => {
    isBatteryOptimizationIgnored().then(setExempt);
  }, []);
  useEffect(() => {
    refresh();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refresh();
      }
    });
    return () => subscription.remove();
  }, [refresh]);
  return exempt;
}

const useStyles = makeStyles(({ colors }) => ({
  list: { gap: 10 },
  inactive: { opacity: 0.55 },
  previewGroup: { gap: spacing.sm },
  previewLabel: { paddingHorizontal: spacing.xs },
  previewFrame: {
    padding: 10,
    borderRadius: radius.card,
    backgroundColor: colors.surface2,
  },
  notification: {
    gap: 6,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    paddingHorizontal: 14,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  appIcon: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  content: { paddingLeft: 30, gap: 3 },
  actions: { flexDirection: 'row', paddingLeft: 18 },
  action: { paddingHorizontal: 10, paddingVertical: 9 },
}));

/**
 * Notifikasi saldo (Android, kanvas "Notifikasi Saldo Dompet" · Pengaturan): nyala/mati,
 * sembunyikan nominal, isi notifikasi + pratinjau. Disimpan di `settings.walletNotification`;
 * `hooks/useWalletNotification` yang menampilkan notifikasinya.
 */
export default function SettingsWalletNotificationScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.SETTINGS_WALLET_NOTIFICATION>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const showToast = useToast();
  const dispatch = useAppDispatch();
  const prefs = useAppSelector(selectWalletNotificationPrefs);
  const { currency, decimalPlaces } = useAppSelector(state => state.settings);
  const { wallets } = useWallets();
  const batteryExempt = useBatteryExemption();

  const preview = useMemo(
    () =>
      buildWalletNotificationContent(wallets, {
        prefs,
        currency,
        decimalPlaces,
        t,
      }),
    [wallets, prefs, currency, decimalPlaces, t],
  );
  const time = formatTxTime(new Date().toISOString(), i18n.language);

  const toggleEnabled = async () => {
    if (prefs.enabled) {
      dispatch(setWalletNotification({ enabled: false }));
      return;
    }
    dispatch(setWalletNotification({ enabled: true }));
    const granted = await requestNotificationPermission().catch(() => false);
    if (!granted) {
      showToast(t('walletNotificationSettings.permissionDenied'), 'info');
    }
  };

  return (
    <MainLayout
      title={t('walletNotificationSettings.title')}
      subtitle={t('walletNotificationSettings.subtitle')}
      onBack={navigation.goBack}
      backLabel={t('common.back')}
      withTabBar
    >
      <Reveal>
        <MenuGroup>
          <MenuRow
            renderIcon={color => <BellRing size={18} color={color} />}
            title={t('walletNotificationSettings.enableTitle')}
            description={t('walletNotificationSettings.enableDescription')}
            showChevron={false}
            trailing={<Switch value={prefs.enabled} />}
            accessibilityRole="switch"
            accessibilityState={{ checked: prefs.enabled }}
            onPress={toggleEnabled}
          />
          <MenuRow
            tone="investment"
            renderIcon={color => <EyeOff size={18} color={color} />}
            title={t('walletNotificationSettings.hideTitle')}
            description={t('walletNotificationSettings.hideDescription')}
            showChevron={false}
            disabled={!prefs.enabled}
            trailing={
              <Switch value={prefs.hideAmounts} disabled={!prefs.enabled} />
            }
            accessibilityRole="switch"
            accessibilityState={{
              checked: prefs.hideAmounts,
              disabled: !prefs.enabled,
            }}
            onPress={() =>
              dispatch(
                setWalletNotification({ hideAmounts: !prefs.hideAmounts }),
              )
            }
          />
          {prefs.enabled && batteryExempt !== null && (
            <MenuRow
              tone={batteryExempt ? 'income' : 'investment'}
              renderIcon={color => <BatteryCharging size={18} color={color} />}
              title={t('walletNotificationSettings.backgroundTitle')}
              description={t(
                batteryExempt
                  ? 'walletNotificationSettings.backgroundAllowed'
                  : 'walletNotificationSettings.backgroundDescription',
              )}
              showChevron={!batteryExempt}
              disabled={batteryExempt}
              trailing={
                batteryExempt ? (
                  <Badge
                    tone="income"
                    label={t('walletNotificationSettings.backgroundOn')}
                  />
                ) : (
                  <Badge
                    tone="investment"
                    label={t('walletNotificationSettings.backgroundAction')}
                  />
                )
              }
              onPress={() =>
                requestBatteryOptimizationExemption().catch(() =>
                  showToast(
                    t('walletNotificationSettings.backgroundError'),
                    'error',
                  ),
                )
              }
            />
          )}
        </MenuGroup>
      </Reveal>

      <Reveal delay={50}>
        <View
          style={[styles.previewGroup, !prefs.enabled && styles.inactive]}
          accessibilityElementsHidden={!prefs.enabled}
        >
          <Typography
            variant="eyebrow"
            tone="subtle"
            style={styles.previewLabel}
          >
            {t('walletNotificationSettings.preview')}
          </Typography>
          <View style={styles.previewFrame}>
            <View style={styles.notification}>
              <View style={styles.header}>
                <View style={styles.appIcon}>
                  <Wallet
                    size={12}
                    color={colors.primaryFg}
                    strokeWidth={2.4}
                  />
                </View>
                <Typography variant="caption" tone="subtle" numberOfLines={1}>
                  {`${t('common.appName')} · ${
                    preview.lines
                      ? preview.summary
                      : t('walletNotification.subtitle')
                  } · ${time}`}
                </Typography>
              </View>
              <View style={styles.content}>
                <Typography variant="label" tabular>
                  {preview.title}
                </Typography>
                {preview.lines ? (
                  <>
                    {preview.lines.map((line, index) => (
                      <Typography
                        key={`${line.name}-${index}`}
                        variant="secondary"
                        tone="muted"
                        numberOfLines={1}
                      >
                        <Typography variant="secondaryMedium">
                          {line.name}
                        </Typography>
                        {` · ${line.amount}${
                          line.isPrimary
                            ? ` · ${t('walletNotification.primaryTag')}`
                            : ''
                        }`}
                      </Typography>
                    ))}
                    {preview.moreCount > 0 && (
                      <Typography variant="secondary" tone="muted">
                        {t('walletNotification.moreWallets', {
                          n: preview.moreCount,
                        })}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography
                    variant="secondary"
                    tone="muted"
                    numberOfLines={1}
                  >
                    {preview.body}
                  </Typography>
                )}
              </View>
              <View style={styles.actions}>
                {[
                  t('walletNotification.actionAdd'),
                  preview.toggleLabel,
                  t('walletNotification.actionOpenWallet'),
                ].map(label => (
                  <Typography
                    key={label}
                    variant="secondaryMedium"
                    tone="primary"
                    style={styles.action}
                  >
                    {label}
                  </Typography>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Reveal>

      <Reveal delay={100}>
        <View
          style={!prefs.enabled && styles.inactive}
          pointerEvents={prefs.enabled ? 'auto' : 'none'}
        >
          <SettingsPanel
            renderIcon={color => <List size={18} color={color} />}
            title={t('walletNotificationSettings.contentTitle')}
            subtitle={t('walletNotificationSettings.contentSubtitle')}
          >
            <View style={styles.list} accessibilityRole="radiogroup">
              {CONTENT_OPTIONS.map(option => (
                <OptionRow
                  key={option.value}
                  renderLeading={option.renderIcon}
                  title={t(
                    `walletNotificationSettings.content.${option.value}.title`,
                  )}
                  subtitle={t(
                    `walletNotificationSettings.content.${option.value}.subtitle`,
                  )}
                  selected={prefs.content === option.value}
                  onSelect={() =>
                    dispatch(setWalletNotification({ content: option.value }))
                  }
                />
              ))}
            </View>
          </SettingsPanel>
        </View>
      </Reveal>
    </MainLayout>
  );
}
