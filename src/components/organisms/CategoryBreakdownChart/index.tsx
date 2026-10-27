import { useState } from 'react';
import { View } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import { ArrowLeft, ChartPie, ChevronRight, Tag } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import PressableScale from '@/components/atoms/PressableScale';
import Skeleton from '@/components/atoms/Skeleton';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import DonutChart from '@/components/molecules/DonutChart';
import EmptyState from '@/components/molecules/EmptyState';
import SectionHead from '@/components/molecules/SectionHead';
import { resolveCategoryIcon } from '@/constants/categoryIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import {
  OTHER_SUB_CATEGORY_ID,
  type CategorySlice,
} from '@/utils/categoryBreakdown';
import { transitions } from '@/utils/motion';

export interface CategoryBreakdownChartProps {
  /** Slice siap pakai dari ringkasan API (`buildCategoryBreakdown`). */
  slices: CategorySlice[];
  title: string;
  /** Eyebrow kartu ("BULAN INI", periode laporan). */
  periodLabel: string;
  actionLabel?: string;
  onAction?: () => void;
  isLoading?: boolean;
  centerCaption?: string;
  /** Teks saat belum ada pengeluaran (default "dashboard.noExpenseData"). */
  emptyTitle?: string;
  /** inset = kotak kosong ringkas di dalam kartu (Laporan). */
  emptyVariant?: 'default' | 'inset';
  /** Ada → tile subkategori bisa ditekan. */
  onSelectSubCategory?: (sub: CategorySlice, category: CategorySlice) => void;
  /** Ada → tile kategori tanpa subkategori (atau "Lainnya") bisa ditekan. */
  onSelectCategory?: (category: CategorySlice) => void;
  /**
   * Ada → tile kategori bersubkategori membuka halaman sendiri (Laporan), bukan drill-down di
   * dalam kartu.
   */
  onOpenCategory?: (category: CategorySlice) => void;
}

const useStyles = makeStyles(({ colors }) => ({
  body: { alignItems: 'center', gap: spacing.xxl },
  tiles: { alignSelf: 'stretch', gap: spacing.md },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: spacing.md,
    borderRadius: radius.control,
    backgroundColor: colors.surface2,
  },
  tileIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTexts: { flex: 1, gap: 1 },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  dim: { opacity: 0.6 },
}));

/** "Pengeluaran per kategori": donut + tile kategori, drill-down ke subkategori (port web). */
export default function CategoryBreakdownChart({
  slices,
  title,
  periodLabel,
  actionLabel,
  onAction,
  isLoading = false,
  centerCaption,
  emptyTitle,
  emptyVariant = 'default',
  onSelectSubCategory,
  onSelectCategory,
  onOpenCategory,
}: CategoryBreakdownChartProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { formatNumber, formatCompact } = useMoneyFormat();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const expanded = expandedId
    ? slices.find(item => item.id === expandedId)
    : undefined;
  const active = expanded ? expanded.subSlices ?? [] : slices;
  const activeTotal = active.reduce((sum, slice) => sum + slice.total, 0);
  const nameOf = (slice: CategorySlice) =>
    slice.name ?? t('dashboard.otherSubCategory');

  const pressFor = (slice: CategorySlice): (() => void) | undefined => {
    if (!expanded) {
      if ((slice.subSlices?.length ?? 0) > 0) {
        return onOpenCategory
          ? () => onOpenCategory(slice)
          : () => setExpandedId(slice.id);
      }
      return onSelectCategory ? () => onSelectCategory(slice) : undefined;
    }
    if (slice.id === OTHER_SUB_CATEGORY_ID) {
      return onSelectCategory ? () => onSelectCategory(expanded) : undefined;
    }
    return onSelectSubCategory
      ? () => onSelectSubCategory(slice, expanded)
      : undefined;
  };

  return (
    <Card>
      <SectionHead
        eyebrow={periodLabel}
        title={title}
        actionLabel={actionLabel}
        onAction={onAction}
      />

      {isLoading && slices.length === 0 ? (
        <View style={styles.body}>
          <Skeleton width={180} height={180} />
          <View style={styles.tiles}>
            {[0, 1, 2].map(i => (
              <Skeleton key={i} height={58} radius={radius.control} />
            ))}
          </View>
        </View>
      ) : slices.length === 0 ? (
        <EmptyState
          variant={emptyVariant}
          icon={
            emptyVariant === 'inset' ? (
              <ChartPie size={18} color={colors.text2} />
            ) : (
              <ChartPie size={32} color={colors.primaryText} />
            )
          }
          title={emptyTitle ?? t('dashboard.noExpenseData')}
        />
      ) : (
        <View style={[styles.body, isLoading && styles.dim]}>
          <DonutChart
            key={expandedId ?? 'all'}
            data={active.map(slice => ({
              id: slice.id,
              value: slice.total,
              color: slice.color,
            }))}
            centerValue={formatCompact(activeTotal)}
            centerLabel={
              expanded
                ? nameOf(expanded)
                : centerCaption ?? t('dashboard.totalExpenseShort')
            }
          />
          <View style={styles.tiles}>
            {expanded && (
              <PressableScale
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setExpandedId(null)}
                style={styles.back}
              >
                <ArrowLeft size={14} color={colors.primaryText} />
                <Typography variant="fieldLabel" tone="primary">
                  {t('dashboard.backToCategories')}
                </Typography>
                <Typography variant="secondary" tone="subtle">
                  · {nameOf(expanded)}
                </Typography>
              </PressableScale>
            )}
            <AnimatePresence exitBeforeEnter>
              <MotiView
                key={expandedId ?? 'all'}
                from={{ opacity: 0, translateX: expanded ? 12 : -12 }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0 }}
                transition={transitions.fade}
                style={styles.tiles}
              >
                {active.map(slice => {
                  const Icon = slice.icon
                    ? resolveCategoryIcon(slice.icon)
                    : Tag;
                  const onPress = pressFor(slice);
                  return (
                    <PressableScale
                      key={slice.id}
                      disabled={!onPress}
                      scaleTo={0.98}
                      onPress={onPress}
                      style={styles.tile}
                    >
                      <View
                        style={[
                          styles.tileIcon,
                          { backgroundColor: `${slice.color}26` },
                        ]}
                      >
                        <Icon size={16} color={slice.color} />
                      </View>
                      <View style={styles.tileTexts}>
                        <Typography
                          variant="meta"
                          tone="muted"
                          numberOfLines={1}
                        >
                          {nameOf(slice)}
                        </Typography>
                        <Typography variant="num" tabular numberOfLines={1}>
                          {formatNumber(slice.total)}
                        </Typography>
                      </View>
                      <Typography variant="tileLabel" tone="subtle" tabular>
                        {Math.round(slice.percentage)}%
                      </Typography>
                      {/* Setiap tile yang bisa ditekan (drill-down / buka Transaksi) diberi panah. */}
                      {onPress && (
                        <ChevronRight size={14} color={colors.text3} />
                      )}
                    </PressableScale>
                  );
                })}
              </MotiView>
            </AnimatePresence>
          </View>
        </View>
      )}
    </Card>
  );
}
