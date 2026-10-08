import { Bug, Coins, UserCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import MenuGroup from '@/components/molecules/MenuGroup';
import MenuRow from '@/components/molecules/MenuRow';
import MainLayout from '@/components/templates/MainLayout';
import { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { useAppSelector } from '@/store/hooks';

export default function SettingsScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.SETTINGS>) {
  const { t } = useTranslation();
  const isAdmin = useAppSelector(state => state.auth.user?.role === 'admin');
  const { currency, decimalPlaces } = useAppSelector(state => state.settings);

  return (
    <MainLayout
      title={t('nav.settings')}
      subtitle={t('settingsMenu.subtitle')}
      withTabBar
    >
      {isAdmin && (
        <MenuGroup title={t('settingsMenu.sectionAdmin')}>
          <MenuRow
            tone="income"
            renderIcon={color => <UserCheck size={18} color={color} />}
            title={t('settingsMenu.userApproval.title')}
            description={t('settingsMenu.userApproval.description')}
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
      )}

      <MenuGroup title={t('settingsMenu.sectionGeneral')}>
        <MenuRow
          tone="investment"
          renderIcon={color => <Coins size={18} color={color} />}
          title={t('settingsMenu.currency.title')}
          description={`${currency} · ${t('settingsMenu.decimalCount', {
            n: decimalPlaces,
          })}`}
          onPress={() => navigation.navigate(ROUTES.SETTINGS_CURRENCY)}
        />
      </MenuGroup>
    </MainLayout>
  );
}
