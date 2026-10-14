import { useEffect, useId, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { ChartLine } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import EmptyState from '@/components/molecules/EmptyState';
import SectionHead from '@/components/molecules/SectionHead';
import SegmentedControl from '@/components/molecules/SegmentedControl';
import { useTheme } from '@/contexts/ThemeContext';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { CashFlowPoint } from '@/types';
import { monotonePath, niceTicks, pickLabelIndexes } from '@/utils/chart';
import Reveal from '@/components/atoms/Reveal';

type Series = 'income' | 'expense';
type Mode = 'cumulative' | 'period';

const SERIES: Series[] = ['income', 'expense'];
const MODES: Mode[] = ['cumulative', 'period'];

const CHART_HEIGHT = 200;
const AXIS_WIDTH = 40;
const PAD_RIGHT = 6;
const PAD_TOP = 8;
const LABEL_HEIGHT = 22;
const LABEL_WIDTH = 48;
const TOOLTIP_WIDTH = 150;

const useStyles = makeStyles(({ colors, shadows }) => ({
  legend: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: radius.pill },
  hidden: { opacity: 0.45 },
  strike: { textDecorationLine: 'line-through' },
  chart: { height: CHART_HEIGHT },
  axisLabel: { position: 'absolute', left: 0, width: AXIS_WIDTH - 6 },
  xLabel: { position: 'absolute', width: LABEL_WIDTH },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    paddingTop: 56,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
    opacity: 0.6,
  },
  tooltip: {
    position: 'absolute',
    top: 0,
    width: TOOLTIP_WIDTH,
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
    ...shadows.pop,
  },
  tooltipRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tooltipDot: { width: 8, height: 8, borderRadius: radius.pill },
  tooltipLabel: { flex: 1 },
}));

function toCumulative(data: CashFlowPoint[]): CashFlowPoint[] {
  let income = 0;
  let expense = 0;
  return data.map(point => {
    income += point.income;
    expense += point.expense;
    return { ...point, income, expense };
  });
}

interface PlotProps {
  data: CashFlowPoint[];
  hidden: Set<Series>;
  colorOf: Record<Series, string>;
}

/**
 * Grafik area dua seri (pengganti Recharts web): sumbu Y ringkas, grid, label X berjarak
 * piksel, titik "hari ini", dan tap untuk tooltip titik terdekat.
 */
function CashFlowPlot({ data, hidden, colorOf }: PlotProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { formatCompact } = useMoneyFormat();
  const gradientId = `cf${useId().replace(/:/g, '')}`;
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  // Data/mode berganti → tooltip lama tidak relevan lagi.
  useEffect(() => setSelected(null), [data]);

  const plotHeight = CHART_HEIGHT - LABEL_HEIGHT;
  const visible = SERIES.filter(series => !hidden.has(series));

  const geometry = useMemo(() => {
    if (width === 0 || data.length === 0) {
      return null;
    }
    const max = Math.max(
      0,
      ...data.flatMap(point => visible.map(series => point[series])),
    );
    const ticks = niceTicks(max);
    const top = ticks[ticks.length - 1] || 1;
    const innerWidth = width - AXIS_WIDTH - PAD_RIGHT;
    const xAt = (index: number) =>
      AXIS_WIDTH +
      (data.length <= 1
        ? innerWidth / 2
        : (index / (data.length - 1)) * innerWidth);
    const yAt = (value: number) =>
      PAD_TOP + (1 - value / top) * (plotHeight - PAD_TOP);
    const paths = visible.map(series => {
      const points = data.map((point, index) => ({
        x: xAt(index),
        y: yAt(point[series]),
      }));
      const line = monotonePath(points);
      const last = points[points.length - 1];
      return {
        series,
        points,
        line,
        area:
          points.length > 1
            ? `${line} L ${last.x} ${plotHeight} L ${points[0].x} ${plotHeight} Z`
            : '',
      };
    });
    const xs = data.map((_, index) => xAt(index));
    return {
      ticks,
      xs,
      yAt,
      paths,
      labelIndexes: pickLabelIndexes(xs, LABEL_WIDTH + 4),
    };
    // `visible` berasal dari `hidden`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, hidden, width, plotHeight]);

  const handlePress = (event: GestureResponderEvent) => {
    if (!geometry) {
      return;
    }
    const x = event.nativeEvent.locationX;
    let nearest = 0;
    geometry.xs.forEach((value, index) => {
      if (Math.abs(value - x) < Math.abs(geometry.xs[nearest] - x)) {
        nearest = index;
      }
    });
    setSelected(current => (current === nearest ? null : nearest));
  };

  const selectedPoint = selected !== null ? data[selected] : undefined;
  const tooltipLeft =
    geometry && selected !== null
      ? Math.min(
          Math.max(geometry.xs[selected] - TOOLTIP_WIDTH / 2, AXIS_WIDTH),
          width - TOOLTIP_WIDTH,
        )
      : 0;

  return (
    <Pressable
      style={styles.chart}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      onPress={handlePress}
      accessibilityRole="image"
      accessibilityLabel={t('reports.cashFlow.title')}
    >
      {geometry && (
        <Reveal
          variant="fade"
          key={`${data.length}-${visible.join()}`}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Svg width={width} height={plotHeight}>
            <Defs>
              {SERIES.map(series => (
                <LinearGradient
                  key={series}
                  id={`${gradientId}${series}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <Stop
                    offset="0"
                    stopColor={colorOf[series]}
                    stopOpacity={0.32}
                  />
                  <Stop
                    offset="1"
                    stopColor={colorOf[series]}
                    stopOpacity={0}
                  />
                </LinearGradient>
              ))}
            </Defs>
            {geometry.ticks.map(tick => (
              <Line
                key={tick}
                x1={AXIS_WIDTH}
                x2={width}
                y1={geometry.yAt(tick)}
                y2={geometry.yAt(tick)}
                stroke={colors.border}
                strokeWidth={1}
              />
            ))}
            {geometry.paths.map(item => (
              <Path
                key={`${item.series}-area`}
                d={item.area}
                fill={`url(#${gradientId}${item.series})`}
              />
            ))}
            {geometry.paths.map(item => (
              <Path
                key={`${item.series}-line`}
                d={item.line}
                fill="none"
                stroke={colorOf[item.series]}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {selected !== null && (
              <Line
                x1={geometry.xs[selected]}
                x2={geometry.xs[selected]}
                y1={PAD_TOP}
                y2={plotHeight}
                stroke={colors.text3}
                strokeOpacity={0.35}
                strokeWidth={1}
              />
            )}
            {geometry.paths.flatMap(item =>
              item.points.map((point, index) => {
                const isSelected = index === selected;
                if (!isSelected && !data[index].isToday) {
                  return null;
                }
                return (
                  <Circle
                    key={`${item.series}-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r={isSelected ? 7 : 5.5}
                    fill={colorOf[item.series]}
                    stroke={colors.surface}
                    strokeWidth={isSelected ? 3 : 2.5}
                  />
                );
              }),
            )}
          </Svg>
          {geometry.ticks.map(tick => (
            <Typography
              key={tick}
              variant="axis"
              tone="subtle"
              align="right"
              numberOfLines={1}
              style={[styles.axisLabel, { top: geometry.yAt(tick) - 7 }]}
            >
              {formatCompact(tick)}
            </Typography>
          ))}
          {geometry.labelIndexes.map(index => (
            <Typography
              key={index}
              variant="axis"
              tone="subtle"
              align="center"
              numberOfLines={1}
              style={[
                styles.xLabel,
                {
                  top: plotHeight + 6,
                  left: Math.min(
                    Math.max(
                      geometry.xs[index] - LABEL_WIDTH / 2,
                      AXIS_WIDTH - 8,
                    ),
                    width - LABEL_WIDTH,
                  ),
                },
              ]}
            >
              {data[index].label}
            </Typography>
          ))}
          {selectedPoint && (
            <Reveal
              variant="fade"
              style={[styles.tooltip, { left: tooltipLeft }]}
            >
              <Typography variant="caption" tone="subtle" numberOfLines={1}>
                {selectedPoint.label}
              </Typography>
              {visible.map(series => (
                <View key={series} style={styles.tooltipRow}>
                  <View
                    style={[
                      styles.tooltipDot,
                      { backgroundColor: colorOf[series] },
                    ]}
                  />
                  <Typography
                    variant="tileLabel"
                    tone="muted"
                    numberOfLines={1}
                    style={styles.tooltipLabel}
                  >
                    {t(`reports.cashFlow.short.${series}`)}
                  </Typography>
                  <Typography variant="tileLabel" tabular>
                    {formatCompact(selectedPoint[series])}
                  </Typography>
                </View>
              ))}
            </Reveal>
          )}
        </Reveal>
      )}
    </Pressable>
  );
}

export interface CashFlowCardProps {
  data: CashFlowPoint[];
  isLoading: boolean;
}

/** "Cash Flow": pemasukan vs pengeluaran per bucket, kumulatif atau per periode. */
export default function CashFlowCard({ data, isLoading }: CashFlowCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('cumulative');
  const [hidden, setHidden] = useState<Set<Series>>(new Set());

  const colorOf: Record<Series, string> = {
    income: colors.chart1,
    expense: colors.chart2,
  };
  const isEmpty = data.every(
    point => point.income === 0 && point.expense === 0,
  );
  const chartData = useMemo(
    () => (mode === 'cumulative' ? toCumulative(data) : data),
    [data, mode],
  );

  const toggle = (series: Series) =>
    setHidden(current => {
      const next = new Set(current);
      if (next.has(series)) {
        next.delete(series);
      } else {
        next.add(series);
      }
      return next;
    });

  return (
    <Card>
      <SectionHead
        eyebrow={t('reports.eyebrow.cashFlow')}
        title={t('reports.cashFlow.title')}
        right={
          <View style={styles.legend}>
            {SERIES.map(series => {
              const isHidden = hidden.has(series);
              return (
                <PressableScale
                  key={series}
                  accessibilityRole="button"
                  accessibilityState={{ selected: !isHidden }}
                  hitSlop={8}
                  onPress={() => toggle(series)}
                  style={[styles.legendItem, isHidden && styles.hidden]}
                >
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: colorOf[series] },
                    ]}
                  />
                  <Typography
                    variant="caption"
                    tone={isHidden ? 'subtle' : 'muted'}
                    style={isHidden && styles.strike}
                  >
                    {t(`reports.cashFlow.short.${series}`)}
                  </Typography>
                </PressableScale>
              );
            })}
          </View>
        }
      />

      <View>
        {isEmpty && !isLoading ? (
          <EmptyState
            variant="inset"
            icon={<ChartLine size={18} color={colors.text2} />}
            title={t('reports.cashFlow.empty')}
          />
        ) : (
          <CashFlowPlot data={chartData} hidden={hidden} colorOf={colorOf} />
        )}
        {isLoading && (
          <Reveal
            variant="fade"
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          >
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          </Reveal>
        )}
      </View>

      <SegmentedControl<Mode>
        size="sm"
        options={MODES.map(option => ({
          value: option,
          label: t(`reports.cashFlow.modes.${option}`),
        }))}
        value={mode}
        onChange={setMode}
      />
    </Card>
  );
}
