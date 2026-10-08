import { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '@/theme/colors';

export interface GradientProps {
  /** Warna awal → akhir. Default gradien hero Mist. */
  from?: string;
  to?: string;
  /** Arah: 'diagonal' (kiri-atas → kanan-bawah) atau 'vertical'. */
  direction?: 'diagonal' | 'vertical';
}

/**
 * Latar gradien yang mengisi parent (absolute). Parent yang mengatur radius + overflow hidden.
 */
export default function Gradient({
  from = colors.heroBg,
  to = colors.heroBg2,
  direction = 'diagonal',
}: GradientProps) {
  // useId berisi ':' yang tidak valid di url(#…) SVG.
  const id = `grad${useId().replace(/:/g, '')}`;
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient
          id={id}
          x1="0"
          y1="0"
          x2={direction === 'diagonal' ? '1' : '0'}
          y2="1"
        >
          <Stop offset="0" stopColor={from} />
          <Stop offset="1" stopColor={to} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
