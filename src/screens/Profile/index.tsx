import { useState } from 'react';
import { View } from 'react-native';
import {
  AtSign,
  Check,
  Info,
  KeyRound,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  UserCheck,
  UserRound,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Avatar from '@/components/atoms/Avatar';
import Button from '@/components/atoms/Button';
import Gradient from '@/components/atoms/Gradient';
import Typography from '@/components/atoms/Typography';
import TextField from '@/components/molecules/TextField';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';
import SettingsPanel from '@/components/organisms/SettingsPanel';
import MainLayout from '@/components/templates/MainLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { useLogoutDialog } from '@/hooks/useLogoutDialog';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import Reveal from '@/components/atoms/Reveal';

const MIN_PASSWORD_LENGTH = 6;

const useStyles = makeStyles(({ colors, shadows }) => ({
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: spacing.lg,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatarRing: {
    padding: 2,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  identityText: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontSize: 17, lineHeight: 22 },
  role: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
    borderRadius: radius.control,
    backgroundColor: colors.primarySoft,
  },
  hintIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  hintTexts: { flex: 1, gap: 2 },
}));

/** Blok identitas bergradien hero: avatar bercincin, nama, @username, peran. */
function IdentityCard() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  return (
    <View style={styles.identity}>
      <Gradient />
      <View style={styles.avatarRing}>
        <Avatar name={user?.nameUser ?? ''} size={52} />
      </View>
      <View style={styles.identityText}>
        <Typography
          variant="cardTitle"
          tone="hero"
          numberOfLines={1}
          style={styles.name}
        >
          {user?.nameUser ?? '-'}
        </Typography>
        <Typography variant="secondary" tone="heroMuted" numberOfLines={1}>
          @{user?.username}
        </Typography>
      </View>
      <View style={styles.role}>
        <ShieldCheck size={14} color={colors.primaryText} />
        <Typography variant="tileLabel" tone="primary">
          {user?.role === 'admin'
            ? t('profile.roleAdmin')
            : t('profile.roleUser')}
        </Typography>
      </View>
    </View>
  );
}

function AccountInfoForm() {
  const { t } = useTranslation();
  const showToast = useToast();
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.nameUser ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isUnchanged =
    name.trim() === (user?.nameUser ?? '') &&
    username.trim() === (user?.username ?? '');
  const canSubmit = !isUnchanged && !!name.trim() && !!username.trim();

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await updateProfile({
        nameUser: name.trim(),
        username: username.trim(),
      });
      setConfirmOpen(false);
      showToast(t('profile.updateSuccess'), 'success');
    } catch (error) {
      setConfirmOpen(false);
      showToast(
        error instanceof Error ? error.message : t('profile.genericError'),
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SettingsPanel
      renderIcon={color => <UserRound size={18} color={color} />}
      title={t('profile.accountInfoTitle')}
    >
      <TextField
        variant="filled"
        label={t('profile.nameLabel')}
        placeholder={t('profile.namePlaceholder')}
        value={name}
        onChangeText={setName}
        autoComplete="name"
        renderLeadingIcon={color => <UserRound size={18} color={color} />}
      />
      <TextField
        variant="filled"
        label={t('profile.usernameLabel')}
        placeholder={t('profile.usernamePlaceholder')}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoComplete="username"
        renderLeadingIcon={color => <AtSign size={18} color={color} />}
      />
      <Button
        label={t('profile.updateConfirmAction')}
        disabled={!canSubmit}
        onPress={() => setConfirmOpen(true)}
        renderIcon={color => <Check size={18} color={color} />}
      />
      <ConfirmDialog
        visible={confirmOpen}
        tone="primary"
        renderIcon={color => <UserCheck size={24} color={color} />}
        title={t('profile.updateConfirmTitle')}
        message={t('profile.updateConfirmDescription')}
        confirmLabel={t('profile.updateConfirmAction')}
        cancelLabel={t('common.cancel')}
        loading={submitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </SettingsPanel>
  );
}

function ChangePasswordForm() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const showToast = useToast();
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;
  const toggleLabels = {
    show: t('auth.showPassword'),
    hide: t('auth.hidePassword'),
  };

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      showToast(t('profile.passwordTooShortError'), 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(t('profile.passwordMismatchError'), 'error');
      return;
    }
    setSubmitting(true);
    try {
      // Sukses → sesi dibersihkan, guard auth otomatis pindah ke Login.
      await changePassword({ currentPassword, newPassword });
      showToast(t('profile.changePasswordSuccess'), 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('profile.genericError'),
        'error',
      );
      setSubmitting(false);
    }
  };

  return (
    <SettingsPanel
      renderIcon={color => <KeyRound size={18} color={color} />}
      title={t('profile.changePasswordTitle')}
    >
      <TextField
        variant="filled"
        label={t('profile.currentPasswordLabel')}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureToggle
        toggleLabels={toggleLabels}
        autoComplete="current-password"
        renderLeadingIcon={color => <LockKeyhole size={18} color={color} />}
      />
      <TextField
        variant="filled"
        label={t('profile.newPasswordLabel')}
        value={newPassword}
        onChangeText={setNewPassword}
        secureToggle
        toggleLabels={toggleLabels}
        autoComplete="new-password"
        renderLeadingIcon={color => <LockKeyhole size={18} color={color} />}
      />
      <TextField
        variant="filled"
        label={t('profile.confirmPasswordLabel')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureToggle
        toggleLabels={toggleLabels}
        autoComplete="new-password"
        error={isMismatch ? t('profile.passwordMismatchError') : undefined}
        renderLeadingIcon={color => <LockKeyhole size={18} color={color} />}
      />
      <View style={styles.hint}>
        <View style={styles.hintIcon}>
          <Info size={16} color={colors.primaryText} />
        </View>
        <View style={styles.hintTexts}>
          <Typography variant="label" tone="primary">
            {t('profile.changePasswordHintTitle')}
          </Typography>
          <Typography variant="meta" tone="muted">
            {t('profile.changePasswordHint')}
          </Typography>
        </View>
      </View>
      <Button
        label={t('profile.changePasswordAction')}
        loading={submitting}
        disabled={!currentPassword || !newPassword || !confirmPassword}
        onPress={handleSubmit}
        renderIcon={color => <KeyRound size={18} color={color} />}
      />
    </SettingsPanel>
  );
}

/**
 * Edit Profil (pen `S5xzK`, port EditProfilePage web): identitas, informasi akun (konfirmasi
 * simpan, pen `eCXQt`), ubah password (login ulang setelahnya). Satu-satunya tempat tombol Keluar.
 */
export default function ProfileScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.PROFILE>) {
  const { t } = useTranslation();
  const { requestLogout, dialog } = useLogoutDialog();

  const sections = [
    <IdentityCard key="identity" />,
    <AccountInfoForm key="info" />,
    <ChangePasswordForm key="password" />,
    <Button
      key="logout"
      variant="dangerSoft"
      label={t('topbar.logout')}
      renderIcon={color => <LogOut size={18} color={color} />}
      onPress={requestLogout}
    />,
  ];

  return (
    <MainLayout
      title={t('profile.editProfileTitle')}
      subtitle={t('profile.subtitle')}
      onBack={navigation.goBack}
      backLabel={t('common.back')}
      withTabBar
    >
      {sections.map((section, index) => (
        <Reveal delay={index * 40} key={section.key}>
          {section}
        </Reveal>
      ))}
      {dialog}
    </MainLayout>
  );
}
