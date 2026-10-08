import { StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Camera as CameraIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Camera, useCameraPermission } from 'react-native-vision-camera';
import Button from '@/components/atoms/Button';
import EmptyState from '@/components/molecules/EmptyState';
import MainLayout from '@/components/templates/MainLayout';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/metrics';

/** Pratinjau kamera untuk pindai struk. Pengambilan foto + kirim ke AI menyusul. */
export default function ScanReceiptScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.SCAN_RECEIPT>) {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const { hasPermission, canRequestPermission, requestPermission } =
    useCameraPermission();

  return (
    <MainLayout
      title={t('placeholder.scanTitle')}
      onBack={navigation.goBack}
      backLabel={t('common.back')}
    >
      {hasPermission ? (
        <View style={styles.preview}>
          <Camera
            style={StyleSheet.absoluteFill}
            device="back"
            isActive={isFocused}
          />
        </View>
      ) : (
        <EmptyState
          icon={<CameraIcon size={32} color={colors.primaryText} />}
          title={t('placeholder.scanTitle')}
          description={t('placeholder.cameraPermission')}
          action={
            canRequestPermission ? (
              <Button
                label={t('placeholder.cameraAllow')}
                onPress={requestPermission}
              />
            ) : undefined
          }
        />
      )}
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  preview: {
    flex: 1,
    minHeight: 420,
    overflow: 'hidden',
    borderRadius: radius.card,
    backgroundColor: colors.text,
  },
});
