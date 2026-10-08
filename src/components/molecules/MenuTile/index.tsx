import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/metrics';
import { toneColors, type Tone } from '@/theme/tones';

export interface MenuTileProps {
  label: string;
  /** Render ikon (ukuran 20) dengan warna nada. */
  renderIcon: (color: string) => ReactNode;
  tone?: Tone;
  onPress: () => void;
}

/** Tile grid menu (sheet Lainnya). */
export default function MenuTile({
  label,
  renderIcon,
  tone = 'primary',
  onPress,
}: MenuTileProps) {
  const { soft, text } = toneColors[tone];
  return (
    <PressableScale
      accessibilityRole="button"
      onPress={onPress}
      style={styles.tile}
    >
      <View style={[styles.iconWrap, { backgroundColor: soft }]}>
        {renderIcon(text)}
      </View>
      <Typography variant="tileLabel" align="center" numberOfLines={1}>
        {label}
      </Typography>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: radius.control,
    backgroundColor: colors.surface2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
