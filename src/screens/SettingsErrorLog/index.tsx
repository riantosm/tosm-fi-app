import { Bug } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import PlaceholderLayout from '@/components/templates/PlaceholderLayout';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { colors } from '@/theme/colors';

export default function SettingsErrorLogScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.SETTINGS_ERROR_LOG>) {
  const { t } = useTranslation();

  return (
    <PlaceholderLayout
      title={t('errorLog.title')}
      onBack={navigation.goBack}
      backLabel={t('common.back')}
      withTabBar
      icon={<Bug size={32} color={colors.primaryText} />}
      emptyTitle={t('placeholder.title')}
      emptyDescription={t('placeholder.description')}
    />
  );
}
