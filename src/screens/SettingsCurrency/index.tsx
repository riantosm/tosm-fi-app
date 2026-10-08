import { Coins } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import PlaceholderLayout from '@/components/templates/PlaceholderLayout';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { colors } from '@/theme/colors';

export default function SettingsCurrencyScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.SETTINGS_CURRENCY>) {
  const { t } = useTranslation();

  return (
    <PlaceholderLayout
      title={t('settingsCurrency.title')}
      onBack={navigation.goBack}
      backLabel={t('common.back')}
      withTabBar
      icon={<Coins size={32} color={colors.primaryText} />}
      emptyTitle={t('placeholder.title')}
      emptyDescription={t('placeholder.description')}
    />
  );
}
