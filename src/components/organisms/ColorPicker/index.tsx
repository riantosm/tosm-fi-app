import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Pipette } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import CustomColorSheet from '@/components/organisms/CustomColorSheet';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';

export interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (hex: string) => void;
  presets: string[];
}

/** 10 slot × 32 muat di lebar sheet HP terkecil (320) tanpa scroll. */
const SLOT = 32;

const useStyles = makeStyles(({ colors }) => ({
  wrapper: { gap: 10 },
  row: {
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: 2,
  },
  slot: {
    width: SLOT,
    height: SLOT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  ring: { borderWidth: 2 },
  dot: { width: 26, height: 26, borderRadius: radius.pill },
  dotSelected: { width: 20, height: 20 },
  pipette: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
}));

/** Swatch bulat + pipet yang membuka "Warna custom" (port ColorPicker web). */
export default function ColorPicker({
  label,
  value,
  onChange,
  presets,
}: ColorPickerProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [customOpen, setCustomOpen] = useState(false);
  const isPreset = presets.some(
    preset => preset.toLowerCase() === value.toLowerCase(),
  );

  return (
    <View style={styles.wrapper}>
      {!!label && (
        <Typography variant="fieldLabel" tone="muted">
          {label}
        </Typography>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {presets.map(preset => {
          const selected = preset.toLowerCase() === value.toLowerCase();
          return (
            <PressableScale
              key={preset}
              accessibilityRole="button"
              accessibilityLabel={preset}
              accessibilityState={{ selected }}
              scaleTo={0.9}
              onPress={() => onChange(preset)}
              style={[
                styles.slot,
                selected && [styles.ring, { borderColor: preset }],
              ]}
            >
              <View
                style={[
                  styles.dot,
                  selected && styles.dotSelected,
                  { backgroundColor: preset },
                ]}
              />
            </PressableScale>
          );
        })}
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={t('common.customColor')}
          accessibilityState={{ selected: !isPreset }}
          scaleTo={0.9}
          onPress={() => setCustomOpen(true)}
          style={[
            styles.slot,
            isPreset ? styles.pipette : [styles.ring, { borderColor: value }],
          ]}
        >
          {isPreset ? (
            <Pipette size={16} color={colors.text2} />
          ) : (
            <View
              style={[
                styles.dot,
                styles.dotSelected,
                { backgroundColor: value },
              ]}
            />
          )}
        </PressableScale>
      </ScrollView>

      <CustomColorSheet
        visible={customOpen}
        value={value}
        onClose={() => setCustomOpen(false)}
        onApply={hex => {
          onChange(hex);
          setCustomOpen(false);
        }}
      />
    </View>
  );
}
