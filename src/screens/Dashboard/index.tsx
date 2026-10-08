import { LayoutGrid } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import PlaceholderLayout from '@/components/templates/PlaceholderLayout';
import type { ROUTES } from '@/navigation/paths';
import type { MainTabScreenProps } from '@/navigation/types';
import { colors } from '@/theme/colors';

export default function DashboardScreen(
  _props: MainTabScreenProps<typeof ROUTES.DASHBOARD>,
) {
  const { t } = useTranslation();

  return (
    <PlaceholderLayout
      title={t('nav.dashboard')}
      withTabBar
      icon={<LayoutGrid size={32} color={colors.primaryText} />}
      emptyTitle={t('placeholder.title')}
      emptyDescription={t('placeholder.description')}
    />
  );
}
