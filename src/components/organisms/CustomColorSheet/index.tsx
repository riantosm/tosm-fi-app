import { useState } from 'react';
import { View } from 'react-native';
import { Check, Hash } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import ColorWheel from '@/components/atoms/ColorWheel';
import TextField from '@/components/molecules/TextField';
import BottomSheet from '@/components/organisms/BottomSheet';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';
import { fonts } from '@/theme/typography';

export interface CustomColorSheetProps {
  visible: boolean;
  value: string;
  onClose: () => void;
  onApply: (hex: string) => void;
}

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

const useStyles = makeStyles(({ shadows }) => ({
  hexRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md },
  swatch: { width: 52, height: 52, borderRadius: 14, ...shadows.card },
  hexField: { flex: 1 },
  hexInput: { fontFamily: fonts.num, letterSpacing: 1 },
  footerButton: { flex: 1 },
}));

/** "Warna custom" (pen `yRiTX`): cincin hue + persegi S/V, kode hex, pakai warna. */
export default function CustomColorSheet({
  visible,
  value,
  onClose,
  onApply,
}: CustomColorSheetProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const [color, setColor] = useState(value);
  // Mulai dari warna terbaru setiap kali sheet dibuka.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setColor(value);
    }
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      closeLabel={t('common.close')}
      onBack={onClose}
      backLabel={t('common.back')}
      title={t('common.customColor')}
      subtitle={t('common.customColorSubtitle')}
      footer={
        <>
          <Button
            variant="outline"
            label={t('common.cancel')}
            onPress={onClose}
            style={styles.footerButton}
          />
          <Button
            label={t('common.applyColor')}
            disabled={!HEX_PATTERN.test(color)}
            renderIcon={iconColor => <Check size={18} color={iconColor} />}
            onPress={() => onApply(color)}
            style={styles.footerButton}
          />
        </>
      }
    >
      {/* Dipasang ulang tiap dibuka supaya mulai dari warna terbaru. */}
      {visible && <CustomColorFields value={value} onChange={setColor} />}
    </BottomSheet>
  );
}

function CustomColorFields({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const [color, setColor] = useState(value);
  const [hexDraft, setHexDraft] = useState(
    value.replace('#', '').toUpperCase(),
  );
  // Kunci wheel diganti saat hex diketik supaya wheel membaca ulang nilainya.
  const [wheelKey, setWheelKey] = useState(0);

  const update = (hex: string) => {
    setColor(hex);
    onChange(hex);
  };

  const handleWheelChange = (hex: string) => {
    update(hex);
    setHexDraft(hex.replace('#', '').toUpperCase());
  };

  const handleHexChange = (raw: string) => {
    const cleaned = raw
      .replace(/[^0-9a-fA-F]/g, '')
      .slice(0, 6)
      .toUpperCase();
    setHexDraft(cleaned);
    const normalized = `#${cleaned}`;
    onChange(normalized);
    if (HEX_PATTERN.test(normalized)) {
      setColor(normalized);
      setWheelKey(key => key + 1);
    }
  };

  return (
    <>
      <ColorWheel key={wheelKey} value={color} onChange={handleWheelChange} />
      <View style={styles.hexRow}>
        <View style={[styles.swatch, { backgroundColor: color }]} />
        <View style={styles.hexField}>
          <TextField
            variant="filled"
            label={t('common.hexCode')}
            value={hexDraft}
            onChangeText={handleHexChange}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={7}
            style={styles.hexInput}
            renderLeadingIcon={iconColor => (
              <Hash size={18} color={iconColor} />
            )}
          />
        </View>
      </View>
    </>
  );
}
