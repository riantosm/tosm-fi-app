import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import PressableScale, {
  type PressableScaleProps,
} from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/metrics';
import { toneColors, type Tone } from '@/theme/tones';

export interface MenuRowProps extends Omit<PressableScaleProps, 'children'> {
  /** Render ikon (ukuran 18) dengan warna nada. */
  renderIcon: (color: string) => ReactNode;
  tone?: Tone;
  title: string;
  description?: string;
  /** Elemen di kanan sebelum chevron, misalnya Badge. */
  trailing?: ReactNode;
}

/** Satu baris menu (Pengaturan). Dikumpulkan di dalam MenuGroup. */
export default function MenuRow({
  renderIcon,
  tone = 'primary',
  title,
  description,
  trailing,
  style,
  ...rest
}: MenuRowProps) {
  const { soft, text } = toneColors[tone];
  return (
    <PressableScale
      accessibilityRole="button"
      scaleTo={0.98}
      style={[styles.row, style]}
      {...rest}
    >
      <View style={[styles.iconWrap, { backgroundColor: soft }]}>
        {renderIcon(text)}
      </View>
      <View style={styles.texts}>
        <Typography variant="label">{title}</Typography>
        {!!description && (
          <Typography variant="caption" tone="subtle">
            {description}
          </Typography>
        )}
      </View>
      {trailing}
      <ChevronRight size={16} color={colors.text3} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 13,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1, gap: spacing.xxs },
});
