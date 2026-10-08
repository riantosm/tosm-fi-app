import { useState } from 'react';
import { LogOut } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';
import { useAuth } from '@/hooks/useAuth';

/** Konfirmasi keluar (dialog tengah) + aksi logout. Render `dialog` di layar pemakai. */
export function useLogoutDialog() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const dialog = (
    <ConfirmDialog
      visible={visible}
      tone="danger"
      renderIcon={color => <LogOut size={24} color={color} />}
      title={t('auth.logoutConfirmTitle')}
      message={t('auth.logoutConfirmDescription')}
      confirmLabel={t('auth.logoutConfirmAction')}
      cancelLabel={t('common.cancel')}
      loading={loading}
      onCancel={() => setVisible(false)}
      onConfirm={async () => {
        setLoading(true);
        // Sukses → RootNavigator otomatis pindah ke grup RequireGuest.
        await logout();
        setLoading(false);
        setVisible(false);
      }}
    />
  );

  return { requestLogout: () => setVisible(true), dialog };
}
