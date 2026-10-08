import { StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';
import Typography from '@/components/atoms/Typography';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/metrics';
import { fonts } from '@/theme/typography';
import { getInitials } from '@/utils/format';

export type AvatarTone = 'solid' | 'soft';

export interface AvatarProps {
  name: string;
  /** 36 (app bar) · 44 (sheet Lainnya). */
  size?: number;
  tone?: AvatarTone;
}

const toneStyles: Record<AvatarTone, { box: ViewStyle; text: TextStyle }> = {
  solid: {
    box: { backgroundColor: colors.primary },
    text: { color: colors.primaryFg },
  },
  soft: {
    box: { backgroundColor: colors.primarySoft },
    text: { color: colors.primaryText },
  },
};

export default function Avatar({
  name,
  size = 44,
  tone = 'soft',
}: AvatarProps) {
  const { box, text } = toneStyles[tone];
  return (
    <View
      style={[
        styles.base,
        box,
        { width: size, height: size, borderRadius: radius.pill },
      ]}
    >
      <Typography style={[styles.text, text, { fontSize: size * 0.34 }]}>
        {getInitials(name)}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fonts.display },
});
