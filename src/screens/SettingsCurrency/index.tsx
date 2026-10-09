import { View } from 'react-native';
import { Coins, Hash } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Typography from '@/components/atoms/Typography';
import OptionRow from '@/components/molecules/OptionRow';
import SettingsPanel from '@/components/organisms/SettingsPanel';
import MainLayout from '@/components/templates/MainLayout';
import { CURRENCIES } from '@/constants/currencies';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSettings } from '@/store/slices/settingsSlice';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { formatNumber } from '@/utils/money';
import Reveal from '@/components/atoms/Reveal';

const DECIMAL_OPTIONS = [0, 1, 2] as const;
const PREVIEW_AMOUNT = 1250000.5;
/** Glyph tile per mata uang ("Rp" lebih terbaca daripada simbol tampilan "IDR"). */
const TILE_GLYPH: Record<string, string> = { IDR: 'Rp' };

const useStyles = makeStyles(({ colors }) => ({
  list: { gap: 10 },
  preview: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewValue: { fontSize: 22, lineHeight: 28 },
}));

/**
 * Mata Uang (pen `TPJ9e`, port SettingsCurrencyPage web): pilih mata uang tampilan + jumlah
 * desimal, dengan contoh angka per opsi dan pratinjau. Disimpan di `settings` (persisted).
 */
export default function SettingsCurrencyScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.SETTINGS_CURRENCY>) {
  const styles = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { currency, decimalPlaces } = useAppSelector(state => state.settings);
  const { format } = useMoneyFormat();
  const current =
    CURRENCIES.find(option => option.code === currency) ?? CURRENCIES[0];

  return (
    <MainLayout
      title={t('settingsCurrency.title')}
      subtitle={t('settingsCurrency.subtitle')}
      onBack={navigation.goBack}
      backLabel={t('common.back')}
      withTabBar
    >
      <Reveal>
        <SettingsPanel
          tone="investment"
          renderIcon={color => <Coins size={18} color={color} />}
          title={t('settingsCurrency.title')}
          subtitle={t('settingsCurrency.currencySubtitle')}
        >
          <View style={styles.list} accessibilityRole="radiogroup">
            {CURRENCIES.map(option => (
              <OptionRow
                key={option.code}
                leading={TILE_GLYPH[option.code] ?? option.symbol}
                title={option.code}
                subtitle={t(`settingsCurrency.names.${option.code}`)}
                selected={option.code === currency}
                onSelect={() =>
                  dispatch(setSettings({ currency: option.code }))
                }
              />
            ))}
          </View>
        </SettingsPanel>
      </Reveal>

      <Reveal delay={50}>
        <SettingsPanel
          tone="investment"
          renderIcon={color => <Hash size={18} color={color} />}
          title={t('settingsCurrency.decimalTitle')}
          subtitle={t('settingsCurrency.decimalSubtitle')}
        >
          <View style={styles.list} accessibilityRole="radiogroup">
            {DECIMAL_OPTIONS.map(option => (
              <OptionRow
                key={option}
                leading={String(option)}
                title={t(`settingsCurrency.decimalOptions.${option}`)}
                subtitle={`${current.symbol} ${formatNumber(
                  option === 0 ? Math.floor(PREVIEW_AMOUNT) : PREVIEW_AMOUNT,
                  current.locale,
                  option,
                )}`}
                selected={option === decimalPlaces}
                onSelect={() =>
                  dispatch(setSettings({ decimalPlaces: option }))
                }
              />
            ))}
          </View>
          <View style={styles.preview}>
            <Typography variant="caption" tone="subtle">
              {t('settingsCurrency.preview')}
            </Typography>
            <Reveal variant="fade" key={`${currency}-${decimalPlaces}`}>
              <Typography variant="num" tabular style={styles.previewValue}>
                {format(Math.floor(PREVIEW_AMOUNT))}
              </Typography>
            </Reveal>
          </View>
        </SettingsPanel>
      </Reveal>
    </MainLayout>
  );
}
