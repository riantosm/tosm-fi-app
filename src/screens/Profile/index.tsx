import { StyleSheet, View } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Avatar from '@/components/atoms/Avatar';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import MainLayout from '@/components/templates/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useLogoutDialog } from '@/hooks/useLogoutDialog';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/metrics';

export default function ProfileScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.PROFILE>) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { requestLogout, dialog } = useLogoutDialog();
  const isAdmin = user?.role === 'admin';

  const rows = [
    { label: t('profile.nameLabel'), value: user?.nameUser },
    { label: t('profile.usernameLabel'), value: user?.username },
  ];

  return (
    <MainLayout
      title={t('topbar.editProfile')}
      subtitle={t('profile.subtitle')}
      onBack={navigation.goBack}
      backLabel={t('common.back')}
      withTabBar
    >
      <Card>
        <View style={styles.identity}>
          <Avatar name={user?.nameUser ?? ''} size={56} />
          <View style={styles.identityText}>
            <Typography variant="cardTitle" numberOfLines={1}>
              {user?.nameUser ?? '-'}
            </Typography>
            <Typography variant="secondary" tone="subtle">
              @{user?.username}
            </Typography>
          </View>
          <Badge
            style={styles.badge}
            tone={isAdmin ? 'primary' : 'neutral'}
            label={isAdmin ? t('profile.roleAdmin') : t('profile.roleUser')}
          />
        </View>
      </Card>

      <Card>
        <Typography variant="eyebrow" tone="subtle">
          {t('profile.accountInfoTitle')}
        </Typography>
        {rows.map(row => (
          <View key={row.label} style={styles.row}>
            <Typography variant="secondary" tone="subtle">
              {row.label}
            </Typography>
            <Typography variant="label">{row.value ?? '-'}</Typography>
          </View>
        ))}
      </Card>

      <Button
        variant="dangerSoft"
        label={t('topbar.logout')}
        renderIcon={color => <LogOut size={18} color={color} />}
        onPress={requestLogout}
      />
      {dialog}
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  identityText: { flex: 1, gap: spacing.xxs },
  badge: { alignSelf: 'center' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
});
