import { ChartColumn } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import PlaceholderLayout from '@/components/templates/PlaceholderLayout';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { colors } from '@/theme/colors';

export default function ReportsScreen(
  _props: RootStackScreenProps<typeof ROUTES.REPORTS>,
) {
  const { t } = useTranslation();

  return (
    <PlaceholderLayout
      title={t('nav.reports')}
      withTabBar
      icon={<ChartColumn size={32} color={colors.primaryText} />}
      emptyTitle={t('placeholder.title')}
      emptyDescription={t('placeholder.description')}
    />
  );
}
