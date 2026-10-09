import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Pencil, Pin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Gradient from '@/components/atoms/Gradient';
import IconButton from '@/components/atoms/IconButton';
import Typography from '@/components/atoms/Typography';
import BudgetProgressBar from '@/components/molecules/BudgetProgressBar';
import MainLayout from '@/components/templates/MainLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useBudgetPeriod } from '@/hooks/useBudgetPeriod';
import { useBudgets } from '@/hooks/useBudgets';
import { useBudgetSpending } from '@/hooks/useBudgetSpending';
import { useCategories } from '@/hooks/useCategories';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import BudgetBreakdownList from '@/screens/BudgetDetail/BudgetBreakdownList';
import SetLimitSheet from '@/screens/BudgetDetail/SetLimitSheet';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';
import { fonts } from '@/theme/typography';
import {
  buildBudgetSlices,
  computeAllocatedLimit,
  computeBudgetProgress,
  computeBudgetSpent,
  type BudgetSlice,
} from '@/utils/budgetBreakdown';
import { budgetScopeLabel } from '@/utils/budgetUi';
import Reveal from '@/components/atoms/Reveal';

interface LimitTarget {
  idCategory: string;
  idSubCategory: string | null;
  slice: BudgetSlice;
}

const useStyles = makeStyles(({ colors }) => ({
  hero: {
    gap: spacing.lg,
    padding: spacing.xl,
    overflow: 'hidden',
    borderRadius: 28,
  },
  amounts: { gap: spacing.xs },
  amount: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  stats: { flexDirection: 'row', gap: spacing.sm },
  stat: {
    flex: 1,
    gap: 2,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  statValue: { fontSize: 15 },
  pinned: { backgroundColor: colors.investmentSoft },
}));

/** Detail budget (pen `NFM3f`) — port BudgetDetailView web. */
export default function BudgetDetailScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof ROUTES.BUDGET_DETAIL>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const showToast = useToast();
  const period = useBudgetPeriod();
  const { format, formatCompact } = useMoneyFormat();
  const { categories, status: categoriesStatus } = useCategories();
  const { budgets, status, editBudget, setChildLimit } = useBudgets();
  const [refreshKey, setRefreshKey] = useState(0);
  const { categoryBreakdown, isLoading } = useBudgetSpending(refreshKey);
  const [pinning, setPinning] = useState(false);
  const [limitTarget, setLimitTarget] = useState<LimitTarget | null>(null);
  const budget = budgets.find(item => item.idBudget === route.params.idBudget);

  // Budget dihapus (dari form) → kembali ke daftar.
  useEffect(() => {
    if (status === 'loaded' && !budget) {
      navigation.goBack();
    }
  }, [status, budget, navigation]);

  const slices = useMemo(
    () =>
      budget ? buildBudgetSlices(budget, categories, categoryBreakdown) : [],
    [budget, categories, categoryBreakdown],
  );

  if (!budget) {
    return null;
  }

  const spent = computeBudgetSpent(budget, categoryBreakdown);
  const progress = computeBudgetProgress(spent, budget.limitAmount, period);
  const over = progress.status === 'over';
  const dailyPace =
    progress.dailyPace === null ? 0 : Math.round(progress.dailyPace);

  const fail = (error: unknown) =>
    showToast(
      error instanceof Error ? error.message : t('budget.genericError'),
      'error',
    );

  const togglePin = async () => {
    setPinning(true);
    try {
      await editBudget(budget.idBudget, { isPinned: !budget.isPinned });
      showToast(
        t(budget.isPinned ? 'budget.unpinSuccess' : 'budget.pinSuccess'),
        'success',
      );
    } catch (error) {
      fail(error);
    } finally {
      setPinning(false);
    }
  };

  const stats = [
    {
      key: 'remaining',
      label: t(over ? 'budget.overLabel' : 'budget.remainingLabel'),
      value: formatCompact(over ? progress.overBy : progress.remaining),
      over,
    },
    {
      key: 'perDay',
      label: t('budget.perDayShort'),
      value: formatCompact(dailyPace),
      over: false,
    },
    {
      key: 'days',
      label: t('budget.daysLeftShort'),
      value: String(progress.remainingDays),
      over: false,
    },
  ];

  return (
    <>
      <MainLayout
        title={budget.name}
        onBack={navigation.goBack}
        backLabel={t('common.back')}
        withTabBar
        onRefresh={() => setRefreshKey(key => key + 1)}
        headerRight={
          <>
            <IconButton
              variant="surface"
              label={t(
                budget.isPinned
                  ? 'budget.unpinFromDashboard'
                  : 'budget.pinToDashboard',
              )}
              accessibilityState={{ selected: budget.isPinned }}
              disabled={pinning}
              onPress={togglePin}
              style={budget.isPinned && styles.pinned}
              renderIcon={(color, size) => (
                <Pin
                  size={size}
                  color={budget.isPinned ? colors.investmentText : color}
                />
              )}
            />
            <IconButton
              variant="surface"
              label={t('budget.editTitle')}
              onPress={() =>
                navigation.navigate(ROUTES.BUDGET_FORM, { budget })
              }
              renderIcon={(color, size) => <Pencil size={size} color={color} />}
            />
          </>
        }
      >
        <Reveal style={styles.hero}>
          <Gradient />
          <Typography variant="meta" tone="heroMuted" numberOfLines={1}>
            {budgetScopeLabel(budget, t)} · {period.monthLabel}
          </Typography>
          <View style={styles.amounts}>
            <Typography
              tone={over ? 'expense' : 'hero'}
              tabular
              numberOfLines={1}
              adjustsFontSizeToFit
              style={styles.amount}
            >
              {format(spent)}
            </Typography>
            <Typography variant="secondary" tone="heroMuted" numberOfLines={1}>
              {t('budget.spentOfPercent', {
                limit: format(budget.limitAmount),
                percent: progress.percent,
              })}
            </Typography>
          </View>
          <BudgetProgressBar
            tone="hero"
            ratio={progress.ratio}
            color={over ? colors.expense : budget.color}
            dayOfMonth={period.dayOfMonth}
            daysInMonth={period.daysInMonth}
            todayLabel={t('budget.todayLabel')}
          />
          <View style={styles.stats}>
            {stats.map(stat => (
              <View key={stat.key} style={styles.stat}>
                <Typography variant="caption" tone="subtle" numberOfLines={1}>
                  {stat.label}
                </Typography>
                <Typography
                  variant="num"
                  tone={stat.over ? 'expense' : 'default'}
                  tabular
                  numberOfLines={1}
                  style={styles.statValue}
                >
                  {stat.value}
                </Typography>
              </View>
            ))}
          </View>
        </Reveal>

        <Reveal delay={60}>
          <BudgetBreakdownList
            slices={slices}
            loading={isLoading || categoriesStatus !== 'loaded'}
            allocatedLimit={computeAllocatedLimit(budget)}
            totalLimit={budget.limitAmount}
            onSelectSlice={(slice, parent) =>
              setLimitTarget(
                parent
                  ? { idCategory: parent.id, idSubCategory: slice.id, slice }
                  : { idCategory: slice.id, idSubCategory: null, slice },
              )
            }
          />
        </Reveal>
      </MainLayout>

      <SetLimitSheet
        visible={!!limitTarget}
        slice={limitTarget?.slice ?? null}
        budgetName={budget.name}
        onClose={() => setLimitTarget(null)}
        onSubmit={limitAmount => {
          if (!limitTarget) {
            return;
          }
          setChildLimit(
            budget.idBudget,
            limitTarget.idCategory,
            limitTarget.idSubCategory,
            limitAmount,
          ).catch(fail);
        }}
      />
    </>
  );
}
