import type { ReactNode } from 'react';
import { View } from 'react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';
import { fonts } from '@/theme/typography';

/**
 * soft: filter/pilihan cepat di dalam kartu/sheet (latar surface2).
 * surface: filter di atas latar halaman (latar surface).
 * outline: pemilih dompet (surface + stroke border).
 * Aktif (semua varian): primarySoft + stroke primary, teks primaryText 600.
 */
export type ChipVariant = 'soft' | 'surface' | 'outline';

export interface ChipProps {
  label: string;
  active?: boolean;
  variant?: ChipVariant;
  /** Titik warna data user (dompet) sebelum label. */
  dot?: string;
  /** Ikon kecil (ukuran 14) dengan warna state. */
  renderIcon?: (color: string) => ReactNode;
  /** Teks redup sesudah label ("· Makan & Minum"). */
  suffix?: string;
  disabled?: boolean;
  onPress?: () => void;
}

const useStyles = makeStyles(({ colors }) => ({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 220,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.transparent,
  },
  soft: { backgroundColor: colors.surface2 },
  surface: { backgroundColor: colors.surface },
  outline: { backgroundColor: colors.surface, borderColor: colors.border },
  active: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  disabled: { opacity: 0.4 },
  dot: { width: 7, height: 7, borderRadius: radius.pill },
  label: { fontSize: 12.5, flexShrink: 1 },
  // Web: chip non-aktif Inter 500.
  labelInactive: { fontFamily: fonts.bodyMedium },
}));

export default function Chip({
  label,
  active = false,
  variant = 'soft',
  dot,
  renderIcon,
  suffix,
  disabled,
  onPress,
}: ChipProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const color = active ? colors.primaryText : colors.text2;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.chip,
        styles[variant],
        active && styles.active,
        disabled && styles.disabled,
      ]}
    >
      {!!dot && <View style={[styles.dot, { backgroundColor: dot }]} />}
      {renderIcon?.(color)}
      <Typography
        variant={active ? 'label' : 'body'}
        numberOfLines={1}
        style={[styles.label, !active && styles.labelInactive, { color }]}
      >
        {label}
        {!!suffix && (
          <Typography variant="body" tone="subtle" style={styles.label}>
            {` · ${suffix}`}
          </Typography>
        )}
      </Typography>
    </PressableScale>
  );
}
