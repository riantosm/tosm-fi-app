import { useState } from 'react';
import { View } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import { ChevronDown, Info, Tags } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import PressableScale from '@/components/atoms/PressableScale';
import Skeleton from '@/components/atoms/Skeleton';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import EmptyState from '@/components/molecules/EmptyState';
import { useTheme } from '@/contexts/ThemeContext';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { BudgetSlice } from '@/utils/budgetBreakdown';
import { transitions } from '@/utils/motion';

export interface BudgetBreakdownListProps {
  slices: BudgetSlice[];
  loading?: boolean;
  /** `parent` ada saat baris yang ditekan adalah subkategori. */
  onSelectSlice: (slice: BudgetSlice, parent?: BudgetSlice) => void;
  /** Total limit level kategori — 0 menyembunyikan banner. */
  allocatedLimit: number;
  totalLimit: number;
}

const useStyles = makeStyles(({ colors }) => ({
  list: { gap: 6 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: 14,
    borderRadius: radius.control,
    backgroundColor: colors.investmentSoft,
  },
  bannerOver: { backgroundColor: colors.expenseSoft },
  bannerText: { flex: 1 },
  row: { borderRadius: radius.control },
  rowExpanded: { backgroundColor: colors.surface2 },
  rowMain: {
    gap: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowPress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: { width: 9, height: 9, borderRadius: radius.pill },
  name: { flex: 1 },
  toggle: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  togglePlaceholder: { width: 24 },
  track: {
    height: 6,
    overflow: 'hidden',
    borderRadius: radius.pill,
    backgroundColor: colors.surface3,
  },
  fill: { height: '100%', borderRadius: radius.pill },
  subs: { gap: 2, paddingHorizontal: spacing.md, paddingBottom: 10 },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.control,
  },
  subName: { flex: 1 },
}));

interface RowMetrics {
  hasLimit: boolean;
  ratio: number;
  over: boolean;
}

/** Baris hanya menandai "lewat"; status kuning hanya untuk budget utuh. */
function rowMetrics(slice: BudgetSlice): RowMetrics {
  const hasLimit = slice.limit !== null && slice.limit > 0;
  const ratio = hasLimit ? slice.spent / (slice.limit as number) : 0;
  return { hasLimit, ratio, over: ratio > 1 };
}

/** "Per kategori" di detail budget (pen `NFM3f`): baris kategori + subkategori, ketuk = atur limit. */
export default function BudgetBreakdownList({
  slices,
  loading = false,
  onSelectSlice,
  allocatedLimit,
  totalLimit,
}: BudgetBreakdownListProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { formatCompact } = useMoneyFormat();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const overAllocated = allocatedLimit > totalLimit;

  const amountLabel = (slice: BudgetSlice, metrics: RowMetrics) =>
    metrics.hasLimit
      ? `${formatCompact(slice.spent)} / ${formatCompact(
          slice.limit as number,
        )}`
      : formatCompact(slice.spent);

  return (
    <Card>
      <Typography variant="cardTitle">{t('budget.breakdownTitle')}</Typography>
      {allocatedLimit > 0 && (
        <View style={[styles.banner, overAllocated && styles.bannerOver]}>
          <Info
            size={14}
            color={overAllocated ? colors.expenseText : colors.investmentText}
          />
          <Typography
            variant="tileLabel"
            tone={overAllocated ? 'expense' : 'investment'}
            numberOfLines={1}
            style={styles.bannerText}
          >
            {t('budget.allocatedShort', {
              allocated: formatCompact(allocatedLimit),
              total: formatCompact(totalLimit),
            })}
          </Typography>
        </View>
      )}

      {loading ? (
        <View style={styles.list}>
          {[0, 1, 2, 3].map(index => (
            <Skeleton key={index} height={44} radius={radius.control} />
          ))}
        </View>
      ) : slices.length === 0 ? (
        <EmptyState
          icon={<Tags size={30} color={colors.primaryText} />}
          title={t('budget.noRowsAvailable')}
        />
      ) : (
        <View style={styles.list}>
          {slices.map(slice => {
            const metrics = rowMetrics(slice);
            const subs = slice.subSlices ?? [];
            const expanded = expandedId === slice.id;
            return (
              <View
                key={slice.id}
                style={[styles.row, expanded && styles.rowExpanded]}
              >
                <View style={styles.rowMain}>
                  <View style={styles.rowTop}>
                    <PressableScale
                      accessibilityRole="button"
                      accessibilityLabel={`${t('budget.setLimitTitle')}: ${
                        slice.name ?? ''
                      }`}
                      scaleTo={0.98}
                      onPress={() => onSelectSlice(slice)}
                      style={styles.rowPress}
                    >
                      <View
                        style={[styles.dot, { backgroundColor: slice.color }]}
                      />
                      <Typography
                        variant="label"
                        numberOfLines={1}
                        style={styles.name}
                      >
                        {slice.name ?? t('dashboard.otherSubCategory')}
                      </Typography>
                      <Typography
                        variant="numMeta"
                        tone={metrics.over ? 'expense' : 'muted'}
                        tabular
                      >
                        {amountLabel(slice, metrics)}
                      </Typography>
                    </PressableScale>
                    {subs.length > 0 ? (
                      <PressableScale
                        accessibilityRole="button"
                        accessibilityLabel={t('budget.toggleBreakdown')}
                        accessibilityState={{ expanded }}
                        scaleTo={0.9}
                        hitSlop={6}
                        onPress={() =>
                          setExpandedId(prev =>
                            prev === slice.id ? null : slice.id,
                          )
                        }
                        style={styles.toggle}
                      >
                        <MotiView
                          animate={{ rotate: expanded ? '180deg' : '0deg' }}
                          transition={transitions.fade}
                        >
                          <ChevronDown size={16} color={colors.text3} />
                        </MotiView>
                      </PressableScale>
                    ) : (
                      <View style={styles.togglePlaceholder} />
                    )}
                  </View>
                  <PressableScale
                    accessible={false}
                    scaleTo={1}
                    onPress={() => onSelectSlice(slice)}
                  >
                    {metrics.hasLimit ? (
                      <View style={styles.track}>
                        <MotiView
                          from={{ width: '0%' }}
                          animate={{
                            width: `${Math.min(1, metrics.ratio) * 100}%`,
                          }}
                          transition={transitions.grow}
                          style={[
                            styles.fill,
                            {
                              backgroundColor: metrics.over
                                ? colors.expense
                                : slice.color,
                            },
                          ]}
                        />
                      </View>
                    ) : (
                      <Typography variant="caption" tone="subtle">
                        {t('budget.noLimitTapHint')}
                      </Typography>
                    )}
                  </PressableScale>
                </View>

                <AnimatePresence>
                  {expanded && subs.length > 0 && (
                    <MotiView
                      key="subs"
                      from={{ opacity: 0, translateY: -4 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      exit={{ opacity: 0, translateY: -4 }}
                      transition={transitions.fade}
                      style={styles.subs}
                    >
                      {subs.map(sub => {
                        const subMetrics = rowMetrics(sub);
                        return (
                          <PressableScale
                            key={sub.id}
                            accessibilityRole="button"
                            scaleTo={0.98}
                            onPress={() => onSelectSlice(sub, slice)}
                            style={styles.subRow}
                          >
                            <Typography
                              variant="secondary"
                              numberOfLines={1}
                              style={styles.subName}
                            >
                              {sub.name ?? t('dashboard.otherSubCategory')}
                            </Typography>
                            <Typography
                              variant="numCaption"
                              tone={subMetrics.over ? 'expense' : 'muted'}
                              tabular
                            >
                              {amountLabel(sub, subMetrics)}
                            </Typography>
                          </PressableScale>
                        );
                      })}
                    </MotiView>
                  )}
                </AnimatePresence>
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}
