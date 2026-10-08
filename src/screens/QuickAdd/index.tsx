import { ScanLine, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import PlaceholderLayout from '@/components/templates/PlaceholderLayout';
import { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { colors } from '@/theme/colors';

/** Catat cepat (AI). Service sudah siap: sendAssistantChatApi / commitAssistantApi. */
export default function QuickAddScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.QUICK_ADD>) {
  const { t } = useTranslation();

  return (
    <PlaceholderLayout
      title={t('assistant.title')}
      subtitle={t('assistant.subtitle')}
      onBack={navigation.goBack}
      backLabel={t('common.close')}
      icon={<Sparkles size={32} color={colors.primaryText} />}
      emptyTitle={t('placeholder.title')}
      emptyDescription={t('placeholder.description')}
    >
      <Button
        variant="soft"
        label={t('placeholder.scanTitle')}
        renderIcon={color => <ScanLine size={18} color={color} />}
        onPress={() => navigation.navigate(ROUTES.SCAN_RECEIPT)}
      />
    </PlaceholderLayout>
  );
}
