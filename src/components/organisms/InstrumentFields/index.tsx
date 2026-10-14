import { View } from 'react-native';
import { Type } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Monogram from '@/components/atoms/Monogram';
import Typography from '@/components/atoms/Typography';
import TextField from '@/components/molecules/TextField';
import ColorPicker from '@/components/organisms/ColorPicker';
import { WALLET_COLOR_PRESETS } from '@/constants/walletColors';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';

const useStyles = makeStyles(({ colors }) => ({
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewTexts: { flex: 1, gap: 1 },
}));

export interface InstrumentFieldsProps {
  name: string;
  onNameChange: (name: string) => void;
  color: string;
  onColorChange: (color: string) => void;
}

/** Isi form instrumen (nama, warna, pratinjau) — dipakai InstrumentForm dan "Baru" di InvestmentTargetSheet. */
export default function InstrumentFields({
  name,
  onNameChange,
  color,
  onColorChange,
}: InstrumentFieldsProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const previewName = name.trim() || t('investment.namePreview');
  const previewColor = /^#[0-9a-fA-F]{6}$/.test(color)
    ? color
    : WALLET_COLOR_PRESETS[0];

  return (
    <>
      <TextField
        variant="filled"
        label={t('investment.nameLabel')}
        value={name}
        onChangeText={onNameChange}
        placeholder={t('investment.namePlaceholder')}
        autoCapitalize="words"
        renderLeadingIcon={iconColor => <Type size={18} color={iconColor} />}
      />
      <ColorPicker
        label={t('investment.colorLabel')}
        value={color}
        onChange={onColorChange}
        presets={WALLET_COLOR_PRESETS}
      />
      <View style={styles.preview}>
        <Monogram
          name={previewName}
          color={previewColor}
          variant="solid"
          shape="square"
          size={38}
        />
        <View style={styles.previewTexts}>
          <Typography variant="label" numberOfLines={1}>
            {previewName}
          </Typography>
          <Typography variant="caption" tone="subtle">
            {t('investment.cardPreview')}
          </Typography>
        </View>
      </View>
    </>
  );
}
