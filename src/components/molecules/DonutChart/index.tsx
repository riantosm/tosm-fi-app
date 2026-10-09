import { View } from 'react-native';
import { MotiView } from 'moti';
import Svg, { Circle } from 'react-native-svg';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { transitions } from '@/utils/motion';

export interface DonutDatum {
  id: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  data: DonutDatum[];
  size?: number;
  thickness?: number;
  /** Jarak antar-segmen dalam derajat (pen: 3). */
  gapDegrees?: number;
  centerValue: string;
  centerLabel: string;
}

const useStyles = makeStyles(() => ({
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  value: { fontSize: 26, lineHeight: 32 },
}));

/**
 * Donut bersegmen dengan ujung membulat & jarak antar-segmen (DESIGN_SYSTEM.md §8).
 * Ujung bulat memakan setengah tebal di tiap sisi, jadi panjang busur dikurangi `thickness`.
 */
export default function DonutChart({
  data,
  size = 180,
  thickness = 26,
  gapDegrees = 3,
  centerValue,
  centerLabel,
}: DonutChartProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const total = data.reduce((sum, d) => sum + Math.max(0, d.value), 0);
  const gap = data.length > 1 ? (gapDegrees / 360) * circumference : 0;

  let offset = 0;
  const arcs = data
    .filter(d => d.value > 0)
    .map(d => {
      const length = (d.value / total) * circumference;
      const visible = Math.max(
        0.01,
        length - gap - (data.length > 1 ? thickness : 0),
      );
      const arc = {
        ...d,
        visible,
        start: offset + gap / 2 + (data.length > 1 ? thickness / 2 : 0),
      };
      offset += length;
      return arc;
    });

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={transitions.enter}
      style={{ width: size, height: size }}
    >
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: '-90deg' }] }}
      >
        {total === 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={colors.surface2}
            strokeWidth={thickness}
          />
        )}
        {arcs.map(arc => (
          <Circle
            key={arc.id}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={`${arc.visible} ${circumference}`}
            strokeDashoffset={-arc.start}
          />
        ))}
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Typography
          variant="amount"
          style={styles.value}
          tabular
          numberOfLines={1}
        >
          {centerValue}
        </Typography>
        <Typography variant="caption" tone="subtle" numberOfLines={1}>
          {centerLabel}
        </Typography>
      </View>
    </MotiView>
  );
}
