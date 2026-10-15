import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { type TextInput } from 'react-native';
import axios from 'axios';
import { LockKeyhole, LogIn, UserRound } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import Banner, { type BannerTone } from '@/components/molecules/Banner';
import TextField from '@/components/molecules/TextField';
import ThemeToggleButton from '@/components/molecules/ThemeToggleButton';
import AuthLayout from '@/components/templates/AuthLayout';
import { useAuth } from '@/hooks/useAuth';
import { useLanguagePicker } from '@/hooks/useLanguagePicker';
import { useThemePreference } from '@/hooks/useThemePreference';
import { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { onDismissSessionExpired } from '@/store/slices/authSlice';

interface Notice {
  tone: BannerTone;
  title: string;
  message: string;
}

/** `/user/me` menjawab 403 selama akun masih menunggu persetujuan admin (sama dengan web). */
function isPendingApproval(error: unknown): boolean {
  const cause = error instanceof Error ? error.cause : undefined;
  return axios.isAxiosError(cause) && cause.response?.status === 403;
}

export default function LoginScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.LOGIN>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { login } = useAuth();
  const sessionExpired = useAppSelector(state => state.auth.sessionExpired);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);
  const language = useLanguagePicker();
  const { isDark, toggle: toggleTheme } = useThemePreference();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  // Auto-logout karena 401: tampilkan sekali sebagai banner info, lalu hapus flag-nya.
  useEffect(() => {
    if (sessionExpired) {
      setNotice({
        tone: 'info',
        title: t('auth.sessionExpiredTitle'),
        message: t('auth.sessionExpired'),
      });
      dispatch(onDismissSessionExpired());
    }
  }, [sessionExpired, dispatch, t]);

  const handleSubmit = async () => {
    if (!username.trim() || !password) {
      setFieldError(t('auth.credentialsRequired'));
      return;
    }
    setFieldError('');
    setNotice(null);
    setLoading(true);
    try {
      // Sukses → RootNavigator otomatis pindah ke grup RequireAuth.
      await login({ username: username.trim(), password });
    } catch (error) {
      setNotice(
        isPendingApproval(error)
          ? {
              tone: 'warning',
              title: t('auth.pendingTitle'),
              message: t('auth.pendingDescription'),
            }
          : {
              tone: 'error',
              title: t('auth.loginErrorTitle'),
              message:
                error instanceof Error ? error.message : t('auth.genericError'),
            },
      );
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      appName={t('common.appName')}
      headline={t('auth.heroTitle')}
      title={t('auth.welcomeTitle')}
      subtitle={t('auth.welcomeSubtitle')}
      bottom={language.trigger}
      headerRight={
        <ThemeToggleButton
          isDark={isDark}
          label={t('theme.toggle')}
          onToggle={toggleTheme}
        />
      }
      footer={
        <>
          <Typography tone="muted">{t('auth.noAccount')}</Typography>
          <PressableScale
            accessibilityRole="link"
            hitSlop={8}
            onPress={() => navigation.navigate(ROUTES.REGISTER)}
          >
            <Typography variant="label" tone="primary">
              {t('auth.registerLink')}
            </Typography>
          </PressableScale>
        </>
      }
    >
      {!!notice && (
        <Banner
          tone={notice.tone}
          title={notice.title}
          message={notice.message}
        />
      )}
      <TextField
        label={t('auth.usernameLabel')}
        placeholder={t('auth.usernamePlaceholder')}
        renderLeadingIcon={color => <UserRound size={18} color={color} />}
        value={username}
        onChangeText={setUsername}
        autoComplete="username"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        ref={passwordRef}
        label={t('auth.passwordLabel')}
        renderLeadingIcon={color => <LockKeyhole size={18} color={color} />}
        value={password}
        onChangeText={setPassword}
        secureToggle
        toggleLabels={{
          show: t('auth.showPassword'),
          hide: t('auth.hidePassword'),
        }}
        autoComplete="current-password"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
        error={fieldError}
      />
      <Button
        size="xl"
        label={t('auth.submit')}
        renderIcon={color => <LogIn size={18} color={color} />}
        loading={loading}
        onPress={handleSubmit}
      />
      {language.sheet}
    </AuthLayout>
  );
}
