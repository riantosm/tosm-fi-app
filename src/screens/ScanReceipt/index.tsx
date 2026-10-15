import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Camera as CameraIcon, Check, RotateCcw, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  CommonResolutions,
  useCameraPermission,
  usePhotoOutput,
  type Photo,
} from 'react-native-vision-camera';
import Button from '@/components/atoms/Button';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import EmptyState from '@/components/molecules/EmptyState';
import { useAssistantChatContext } from '@/contexts/AssistantChatContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { AssistantImage } from '@/types';
import { bytesToBase64 } from '@/utils/base64';

/** Sisi terpanjang foto yang dikirim ke AI: cukup untuk membaca struk, ~300 KB sebagai JPEG. */
const MAX_SIDE = 1280;
const JPEG_QUALITY = 70;

interface CapturedPhoto {
  uri: string;
  image: AssistantImage;
}

/** Foto → JPEG kecil (base64 untuk AI) + file sementara (untuk pratinjau & thumbnail chat). */
async function preparePhoto(photo: Photo): Promise<CapturedPhoto> {
  const full = await photo.toImageAsync();
  photo.dispose();
  const scale = Math.min(1, MAX_SIDE / Math.max(full.width, full.height));
  const image =
    scale < 1
      ? await full.resizeAsync(
          Math.round(full.width * scale),
          Math.round(full.height * scale),
        )
      : full;
  const [path, encoded] = await Promise.all([
    image.saveToTemporaryFileAsync('jpg', JPEG_QUALITY),
    image.toEncodedImageDataAsync('jpg', JPEG_QUALITY),
  ]);
  return {
    uri: path.startsWith('file://') ? path : `file://${path}`,
    image: {
      mimeType: 'image/jpeg',
      data: bytesToBase64(new Uint8Array(encoded.buffer)),
    },
  };
}

const useStyles = makeStyles(({ colors }) => ({
  root: { flex: 1, backgroundColor: colors.media },
  topBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  close: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  onMedia: { color: colors.onData },
  frameWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Bingkai panduan struk (rasio struk kasir yang memanjang).
  frame: {
    width: '78%',
    aspectRatio: 0.62,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing.lg,
  },
  hint: { color: colors.onData, opacity: 0.85 },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: colors.onData,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.onData,
  },
  review: { flex: 1 },
  panel: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    backgroundColor: colors.surface,
  },
  panelButton: { flex: 1 },
  permission: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
}));

/** Scan struk: foto struk lalu kirim ke Catat cepat, yang membaca total, toko, tanggal, dan item. */
export default function ScanReceiptScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.SCAN_RECEIPT>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const showToast = useToast();
  const chat = useAssistantChatContext();
  const isFocused = useIsFocused();
  const { hasPermission, canRequestPermission, requestPermission } =
    useCameraPermission();
  const photoOutput = usePhotoOutput({
    targetResolution: CommonResolutions.FHD_4_3,
    qualityPrioritization: 'balanced',
  });
  const [captured, setCaptured] = useState<CapturedPhoto | null>(null);
  const [busy, setBusy] = useState(false);

  const capture = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      const photo = await photoOutput.capturePhoto({}, {});
      setCaptured(await preparePhoto(photo));
    } catch {
      showToast(t('scan.failed'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const sendCaptured = () => {
    if (!captured) {
      return;
    }
    chat.sendPhoto(t('assistant.receiptMessage'), captured);
    navigation.goBack();
  };

  const closeButton = (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={t('common.close')}
      onPress={navigation.goBack}
      style={styles.close}
    >
      <X size={20} color={colors.onData} />
    </PressableScale>
  );

  if (!hasPermission) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
        <View style={[styles.topBar, { top: insets.top + spacing.sm }]}>
          {closeButton}
        </View>
        <View style={styles.permission}>
          <Card>
            <EmptyState
              icon={<CameraIcon size={30} color={colors.primaryText} />}
              title={t('scan.title')}
              description={t('scan.permission')}
              action={
                canRequestPermission ? (
                  <Button label={t('scan.allow')} onPress={requestPermission} />
                ) : undefined
              }
            />
          </Card>
        </View>
      </View>
    );
  }

  if (captured) {
    return (
      <View style={styles.root}>
        <Image
          source={{ uri: captured.uri }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          style={[styles.review, { marginTop: insets.top + 64 }]}
        />
        <View style={[styles.topBar, { top: insets.top + spacing.sm }]}>
          {closeButton}
          <Typography variant="sheetTitle" style={styles.onMedia}>
            {t('scan.title')}
          </Typography>
        </View>
        <View
          style={[
            styles.panel,
            { paddingBottom: Math.max(insets.bottom, spacing.lg) },
          ]}
        >
          <Button
            variant="outline"
            label={t('scan.retake')}
            renderIcon={color => <RotateCcw size={18} color={color} />}
            onPress={() => setCaptured(null)}
            style={styles.panelButton}
          />
          <Button
            label={t('scan.use')}
            renderIcon={color => <Check size={18} color={color} />}
            onPress={sendCaptured}
            style={styles.panelButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Camera
        style={StyleSheet.absoluteFill}
        device="back"
        outputs={[photoOutput]}
        isActive={isFocused}
      />
      <View style={styles.frameWrap} pointerEvents="none">
        <View style={styles.frame} />
      </View>
      <View style={[styles.topBar, { top: insets.top + spacing.sm }]}>
        {closeButton}
        <Typography variant="sheetTitle" style={styles.onMedia}>
          {t('scan.title')}
        </Typography>
      </View>
      <View
        style={[styles.bottom, { bottom: Math.max(insets.bottom, 16) + 24 }]}
      >
        <Typography variant="secondary" align="center" style={styles.hint}>
          {busy ? t('scan.processing') : t('scan.hint')}
        </Typography>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={t('scan.capture')}
          disabled={busy}
          onPress={capture}
          style={styles.shutter}
        >
          {busy ? (
            <ActivityIndicator color={colors.onData} />
          ) : (
            <View style={styles.shutterInner} />
          )}
        </PressableScale>
      </View>
    </View>
  );
}
