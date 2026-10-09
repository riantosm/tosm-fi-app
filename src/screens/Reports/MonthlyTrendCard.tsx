import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';
import { useTranslation } from 'react-i18next';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import SectionHead from '@/components/molecules/SectionHead';
import SegmentedControl from '@/components/molecules/SegmentedControl';
import { useTheme } from '@/contexts/ThemeContext';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';
import type { MonthlyTrendRawPoint } from '@/types';
import { transitions, withDelay } from '@/utils/motion';

export type MonthlyTrendMetric = 'expense' | 'income';

const METRICS: MonthlyTrendMetric[] = ['expense', 'income'];
const PLOT_HEIGHT = 150;
const PILL_SPACE = 26;
const MIN_BAR = 4;
const PILL_SLOT = 80;

const useStyles = makeStyles(({ colors }) => ({
  chart: {
    height: PLOT_HEIGHT + PILL_SPACE,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  column: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    alignSelf: 'stretch',
    borderTopLeftRadius: radius.control,
    borderTopRightRadius: radius.control,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  // Slot lebar tetap (bukan selebar kolom batang yang sempit) supaya "9,24 jt" tidak terpotong;
  // slot absolut tetap di tengah kolom karena `alignItems: 'center'`, pill-nya memeluk teks.
  pillSlot: { position: 'absolute', width: PILL_SLOT, alignItems: 'center' },
  pill: {
    minWidth: 34,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.text,
    alignItems: 'center',
  },
  selectedColumn: { zIndex: 1 },
  pillText: { color: colors.surface, fontSize: 10.5, lineHeight: 15 },
  labels: { flexDirection: 'row', gap: 4, marginTop: 8 },
  label: { flex: 1 },
  dim: { opacity: 0.5 },
}));

export interface MonthlyTrendCardProps {
  data: MonthlyTrendRawPoint[];
  isLoading: boolean;
  eyebrow: string;
}

/**
 * "Tren Bulanan" 12 bulan: batang `*Soft` untuk bulan lalu, solid untuk bulan berjalan, dan pill
 * nilai di atas batang terpilih (default bulan berjalan; ketuk batang lain untuk melihat nilainya).
 */
export default function MonthlyTrendCard({
  data,
  isLoading,
  eyebrow,
}: MonthlyTrendCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { formatCompact } = useMoneyFormat();
  const [metric, setMetric] = useState<MonthlyTrendMetric>('expense');
  const [selected, setSelected] = useState(data.length - 1);

  useEffect(() => setSelected(data.length - 1), [data.length]);

  const solid = metric === 'expense' ? colors.expense : colors.income;
  const soft = metric === 'expense' ? colors.expenseSoft : colors.incomeSoft;
  const activeText =
    metric === 'expense' ? colors.expenseText : colors.incomeText;
  const values = data.map(point => point[metric]);
  const max = Math.max(1, ...values);

  return (
    <Card>
      <SectionHead eyebrow={eyebrow} title={t('reports.monthlyTrend.title')} />

      <View style={isLoading && styles.dim}>
        <View style={styles.chart}>
          {data.map((point, index) => {
            const height = Math.max(
              MIN_BAR,
              (point[metric] / max) * PLOT_HEIGHT,
            );
            const isSelected = index === selected;
            return (
              <PressableScale
                key={`${point.label}-${index}`}
                accessibilityRole="button"
                accessibilityLabel={point.label}
                accessibilityState={{ selected: isSelected }}
                scaleTo={0.97}
                onPress={() => setSelected(index)}
                style={[styles.column, isSelected && styles.selectedColumn]}
              >
                {isSelected && (
                  <View style={[styles.pillSlot, { bottom: height + 6 }]}>
                    <View style={styles.pill}>
                      <Typography
                        variant="badge"
                        tabular
                        numberOfLines={1}
                        style={styles.pillText}
                      >
                        {formatCompact(point[metric])}
                      </Typography>
                    </View>
                  </View>
                )}
                <MotiView
                  from={{ height: 0 }}
                  animate={{ height }}
                  transition={withDelay(transitions.grow, index * 25)}
                  style={[
                    styles.bar,
                    {
                      backgroundColor: isSelected ? solid : soft,
                    },
                  ]}
                />
              </PressableScale>
            );
          })}
        </View>
        <View style={styles.labels}>
          {data.map((point, index) => {
            const isCurrent = index === selected;
            return (
              <Typography
                key={`${point.label}-${index}`}
                variant={isCurrent ? 'captionStrong' : 'caption'}
                tone={isCurrent ? 'default' : 'subtle'}
                align="center"
                numberOfLines={1}
                style={styles.label}
              >
                {point.label.charAt(0).toUpperCase()}
              </Typography>
            );
          })}
        </View>
      </View>

      <SegmentedControl<MonthlyTrendMetric>
        options={METRICS.map(option => ({
          value: option,
          label: t(`reports.monthlyTrend.metrics.${option}`),
        }))}
        value={metric}
        onChange={setMetric}
        activeColor={activeText}
      />
    </Card>
  );
}
