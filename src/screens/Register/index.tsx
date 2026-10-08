import { useRef, useState, type ComponentRef } from 'react';
import { type TextInput } from 'react-native';
import { LockKeyhole, UserPlus, UserRound } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import Banner from '@/components/molecules/Banner';
import TextField from '@/components/molecules/TextField';
import StatusModal from '@/components/organisms/StatusModal';
import AuthLayout from '@/components/templates/AuthLayout';
import { useAuth } from '@/hooks/useAuth';
import { useLanguagePicker } from '@/hooks/useLanguagePicker';
import { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';

export default function RegisterScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.REGISTER>) {
  const { t } = useTranslation();
  const { register } = useAuth();
  const usernameRef = useRef<ComponentRef<typeof TextInput>>(null);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);
  const language = useLanguagePicker();

  const [nameUser, setNameUser] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!nameUser.trim() || !username.trim() || !password) {
      setFieldError(t('auth.credentialsRequired'));
      return;
    }
    setFieldError('');
    setErrorMessage('');
    setLoading(true);
    try {
      await register({
        nameUser: nameUser.trim(),
        username: username.trim(),
        password,
      });
      setSuccess(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t('auth.genericError'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      appName={t('common.appName')}
      headline={t('auth.registerHeroTitle')}
      title={t('auth.registerTitle')}
      subtitle={t('auth.registerSubtitle')}
      bottom={language.trigger}
      footer={
        <>
          <Typography tone="muted">{t('auth.alreadyHaveAccount')}</Typography>
          <PressableScale
            accessibilityRole="link"
            hitSlop={8}
            onPress={navigation.goBack}
          >
            <Typography variant="label" tone="primary">
              {t('auth.loginLink')}
            </Typography>
          </PressableScale>
        </>
      }
    >
      {errorMessage ? (
        <Banner
          tone="error"
          title={t('auth.registerErrorTitle')}
          message={errorMessage}
        />
      ) : (
        <Banner
          tone="info"
          title={t('auth.approvalInfoTitle')}
          message={t('auth.approvalInfoDescription')}
        />
      )}
      <TextField
        label={t('auth.nameLabel')}
        placeholder={t('auth.namePlaceholder')}
        renderLeadingIcon={color => <UserRound size={18} color={color} />}
        value={nameUser}
        onChangeText={setNameUser}
        autoCapitalize="words"
        autoComplete="name"
        returnKeyType="next"
        onSubmitEditing={() => usernameRef.current?.focus()}
      />
      <TextField
        ref={usernameRef}
        label={t('auth.usernameLabel')}
        placeholder={t('auth.usernamePlaceholder')}
        renderLeadingIcon={color => <UserRound size={18} color={color} />}
        value={username}
        onChangeText={setUsername}
        autoComplete="username-new"
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
        autoComplete="new-password"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
        error={fieldError}
      />
      <Button
        size="xl"
        label={t('auth.registerSubmit')}
        renderIcon={color => <UserPlus size={18} color={color} />}
        loading={loading}
        onPress={handleSubmit}
      />

      <StatusModal
        visible={success}
        type="success"
        title={t('auth.registerSubmit')}
        message={t('auth.registerSuccess')}
        actionLabel={t('auth.loginLink')}
        onClose={() => {
          setSuccess(false);
          navigation.navigate(ROUTES.LOGIN);
        }}
      />
      {language.sheet}
    </AuthLayout>
  );
}
