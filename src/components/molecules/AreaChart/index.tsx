import { useEffect, useId, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { MotiView } from 'moti';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import Reveal from '@/components/atoms/Reveal';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { textStyles } from '@/theme/typography';
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

export interface AreaTooltipRow {
  key: string;
  label: string;
  value: string;
  color: string;
  /** `line` untuk seri modal (garis), `dot` untuk seri nilai. */
  marker?: 'dot' | 'line';
  muted?: boolean;
}

export interface AreaTooltip {
  title: string;
  rows: AreaTooltipRow[];
}

export interface AreaChartProps {
  series: AreaSeries[];
  height: number;
  /** Label sumbu X (sepanjang data) — kosong = tanpa sumbu. */
  labels?: string[];
  labelColor?: string;
  /** Ukuran teks label sumbu X (default 12 = caption). */
  labelFontSize?: number;
  /** Garis grid horizontal (3 garis). */
  gridColor?: string;
  /** Titik di ujung seri pertama. */
  endDot?: { color: string; ringColor: string };
  /** Isi tooltip per indeks titik; bila ada, tap grafik = tooltip titik terdekat (tap lagi = tutup). */
  renderTooltip?: (index: number) => AreaTooltip;
}

const LABEL_HEIGHT = 22;
const TOOLTIP_WIDTH = 196;
const LABEL_WIDTH = 48;
const PAD_X = 8;
const PAD_TOP = 10;

const useStyles = makeStyles(({ colors, shadows }) => ({
  labels: { height: LABEL_HEIGHT },
  label: { position: 'absolute', top: 6, width: LABEL_WIDTH },
  // Kartu tooltip = ChartTooltip web.
  tooltip: {
    position: 'absolute',
    width: TOOLTIP_WIDTH,
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.pop,
  },
  tooltipRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tooltipDot: { width: 8, height: 8, borderRadius: radius.pill },
  tooltipLine: { width: 8, height: 2, borderRadius: radius.pill },
  tooltipLabel: { flex: 1 },
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
  labelFontSize = textStyles.caption.fontSize,
  gridColor,
  endDot,
  renderTooltip,
}: AreaChartProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<number | null>(null);

  // Data berganti → tooltip lama tidak relevan lagi.
  useEffect(() => setSelected(null), [series]);
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
        // Titik asli per indeks data (untuk tooltip).
        const dataPoints = item.values.map((value, index) => ({
          x: xAt(index),
          y: yAt(value),
        }));
        const area =
          points.length > 1
            ? `${line} L ${last.x} ${plotHeight} L ${points[0].x} ${plotHeight} Z`
            : '';
        return { ...item, line, area, last, dataPoints };
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

  const handlePress = (event: GestureResponderEvent) => {
    if (!geometry || geometry.count === 0) {
      return;
    }
    const x = event.nativeEvent.locationX;
    let nearest = 0;
    for (let index = 1; index < geometry.count; index += 1) {
      if (
        Math.abs(geometry.xAt(index) - x) < Math.abs(geometry.xAt(nearest) - x)
      ) {
        nearest = index;
      }
    }
    setSelected(current => (current === nearest ? null : nearest));
  };

  const tooltip =
    renderTooltip && selected !== null ? renderTooltip(selected) : null;
  const tooltipLeft =
    geometry && selected !== null
      ? Math.min(
          Math.max(geometry.xAt(selected) - TOOLTIP_WIDTH / 2, 0),
          Math.max(width - TOOLTIP_WIDTH, 0),
        )
      : 0;
  // Kartu diletakkan di sisi yang tidak menutupi titik terpilih: titik di separuh atas → kartu di
  // bawah (di atas label sumbu), selain itu di atas.
  const selectedY =
    selected !== null ? geometry?.paths[0]?.dataPoints[selected]?.y ?? 0 : 0;
  const tooltipPosition =
    selectedY < plotHeight / 2
      ? { bottom: height - plotHeight + 4 }
      : { top: 0 };

  return (
    <Pressable
      style={{ height }}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      onPress={renderTooltip ? handlePress : undefined}
      disabled={!renderTooltip}
      accessibilityRole={renderTooltip ? 'adjustable' : undefined}
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
            {selected !== null && (
              <Line
                x1={geometry.xAt(selected)}
                x2={geometry.xAt(selected)}
                y1={PAD_TOP}
                y2={plotHeight}
                stroke={first?.color ?? colors.text3}
                strokeOpacity={0.5}
                strokeWidth={1}
              />
            )}
            {selected !== null &&
              geometry.paths.map(item => {
                const point = item.dataPoints[selected];
                return point ? (
                  <Circle
                    key={`${item.key}-selected`}
                    cx={point.x}
                    cy={point.y}
                    r={5.5}
                    fill={item.color}
                    stroke={colors.surface}
                    strokeWidth={2.5}
                  />
                ) : null;
              })}
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
                      fontSize: labelFontSize,
                    },
                  ]}
                >
                  {labels![index]}
                </Typography>
              ))}
            </View>
          )}
          {tooltip && (
            <Reveal
              variant="fade"
              style={[styles.tooltip, tooltipPosition, { left: tooltipLeft }]}
            >
              <Typography variant="caption" tone="subtle" numberOfLines={1}>
                {tooltip.title}
              </Typography>
              {tooltip.rows.map(row => (
                <View key={row.key} style={styles.tooltipRow}>
                  <View
                    style={[
                      row.marker === 'line'
                        ? styles.tooltipLine
                        : styles.tooltipDot,
                      { backgroundColor: row.color },
                    ]}
                  />
                  <Typography
                    variant={row.muted ? 'meta' : 'tileLabel'}
                    tone="muted"
                    numberOfLines={1}
                    style={styles.tooltipLabel}
                  >
                    {row.label}
                  </Typography>
                  <Typography
                    variant={row.muted ? 'meta' : 'tileLabel'}
                    tone={row.muted ? 'muted' : 'default'}
                    tabular
                    numberOfLines={1}
                  >
                    {row.value}
                  </Typography>
                </View>
              ))}
            </Reveal>
          )}
        </MotiView>
      )}
    </Pressable>
  );
}
