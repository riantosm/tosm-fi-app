import { useId, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MotiView } from 'moti';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import Typography from '@/components/atoms/Typography';
import { makeStyles } from '@/theme/makeStyles';
import { monotonePath, pickLabelIndexes } from '@/utils/chart';
import { transitions } from '@/utils/motion';

export interface AreaSeries {
  key: string;
  values: number[];
  color: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  /** Opasitas gradien isian di atas (0 = tanpa isian). */
  fillOpacity?: number;
}

export interface AreaChartProps {
  series: AreaSeries[];
  height: number;
  /** Label sumbu X (sepanjang data) — kosong = tanpa sumbu. */
  labels?: string[];
  labelColor?: string;
  /** Garis grid horizontal (3 garis). */
  gridColor?: string;
  /** Titik di ujung seri pertama. */
  endDot?: { color: string; ringColor: string };
}

const LABEL_HEIGHT = 22;
const LABEL_WIDTH = 48;
const PAD_X = 8;
const PAD_TOP = 10;

const useStyles = makeStyles(() => ({
  labels: { height: LABEL_HEIGHT },
  label: { position: 'absolute', top: 6, width: LABEL_WIDTH },
}));

/**
 * Grafik area SVG ringan (pengganti Recharts web): satu atau beberapa seri dengan sumbu Y
 * bersama, isian gradien, grid opsional, label sumbu X, dan titik ujung.
 */
export default function AreaChart({
  series,
  height,
  labels,
  labelColor,
  gridColor,
  endDot,
}: AreaChartProps) {
  const styles = useStyles();
  const id = `area${useId().replace(/:/g, '')}`;
  const [width, setWidth] = useState(0);
  const hasLabels = !!labels && labels.length > 0;
  const plotHeight = height - (hasLabels ? LABEL_HEIGHT : 0);

  const geometry = useMemo(() => {
    const all = series.flatMap(item => item.values);
    if (width === 0 || all.length === 0) {
      return null;
    }
    let min = Math.min(...all);
    let max = Math.max(...all);
    if (min === max) {
      min -= 1;
      max += 1;
    }
    const count = Math.max(...series.map(item => item.values.length));
    const innerWidth = width - PAD_X * 2;
    const innerHeight = plotHeight - PAD_TOP - 4;
    const xAt = (index: number) =>
      PAD_X +
      (count <= 1 ? innerWidth / 2 : (index / (count - 1)) * innerWidth);
    const yAt = (value: number) =>
      PAD_TOP + (1 - (value - min) / (max - min)) * innerHeight;
    return {
      xAt,
      count,
      paths: series.map(item => {
        // Satu titik saja → garis datar selebar grafik.
        const values =
          item.values.length === 1
            ? [item.values[0], item.values[0]]
            : item.values;
        const xFor = (index: number) =>
          item.values.length === 1 ? PAD_X + index * innerWidth : xAt(index);
        const points = values.map((value, index) => ({
          x: xFor(index),
          y: yAt(value),
        }));
        const line = monotonePath(points);
        const last = points[points.length - 1];
        const area =
          points.length > 1
            ? `${line} L ${last.x} ${plotHeight} L ${points[0].x} ${plotHeight} Z`
            : '';
        return { ...item, line, area, last };
      }),
    };
  }, [series, width, plotHeight]);

  // Label dipilih berdasarkan jarak piksel supaya tidak pernah bertumpuk; label terakhir
  // diutamakan (titik "sekarang").
  const labelIndexes = useMemo(() => {
    if (!hasLabels || !geometry) {
      return [];
    }
    return pickLabelIndexes(
      labels!.map((_, index) => geometry.xAt(index)),
      LABEL_WIDTH + 6,
    );
  }, [hasLabels, labels, geometry]);

  const first = geometry?.paths[0];

  return (
    <View
      style={{ height }}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      pointerEvents="none"
    >
      {geometry && (
        <MotiView
          key={series.map(item => item.values.length).join('-')}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={transitions.enter}
          style={StyleSheet.absoluteFill}
        >
          <Svg width={width} height={plotHeight}>
            <Defs>
              {geometry.paths.map(item => (
                <LinearGradient
                  key={item.key}
                  id={`${id}${item.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <Stop
                    offset="0"
                    stopColor={item.color}
                    stopOpacity={item.fillOpacity ?? 0}
                  />
                  <Stop offset="1" stopColor={item.color} stopOpacity={0} />
                </LinearGradient>
              ))}
            </Defs>
            {gridColor &&
              [0.25, 0.55, 0.85].map(ratio => (
                <Line
                  key={ratio}
                  x1={0}
                  x2={width}
                  y1={plotHeight * ratio}
                  y2={plotHeight * ratio}
                  stroke={gridColor}
                  strokeWidth={1}
                />
              ))}
            {geometry.paths.map(item => (
              <Path
                key={`${item.key}-area`}
                d={item.area}
                fill={
                  (item.fillOpacity ?? 0) > 0
                    ? `url(#${id}${item.key})`
                    : 'none'
                }
              />
            ))}
            {geometry.paths.map(item => (
              <Path
                key={`${item.key}-line`}
                d={item.line}
                fill="none"
                stroke={item.color}
                strokeOpacity={item.strokeOpacity ?? 1}
                strokeWidth={item.strokeWidth ?? 2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {endDot && first?.last && (
              <Circle
                cx={first.last.x}
                cy={first.last.y}
                r={6}
                fill={endDot.color}
                stroke={endDot.ringColor}
                strokeWidth={3}
              />
            )}
          </Svg>
          {hasLabels && (
            <View style={styles.labels}>
              {labelIndexes.map(index => (
                <Typography
                  key={index}
                  variant="caption"
                  align="center"
                  numberOfLines={1}
                  style={[
                    styles.label,
                    {
                      left: Math.min(
                        Math.max(geometry.xAt(index) - LABEL_WIDTH / 2, 0),
                        width - LABEL_WIDTH,
                      ),
                      color: labelColor,
                    },
                  ]}
                >
                  {labels![index]}
                </Typography>
              ))}
            </View>
          )}
        </MotiView>
      )}
    </View>
  );
}
