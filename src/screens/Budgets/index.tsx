import { useState } from 'react';
import { View } from 'react-native';
import {
  ArrowUpDown,
  Check,
  Info,
  Pin,
  Plus,
  Target,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import BudgetTile from '@/components/atoms/BudgetTile';
import Button from '@/components/atoms/Button';
import IconButton from '@/components/atoms/IconButton';
import PressableScale from '@/components/atoms/PressableScale';
import Skeleton from '@/components/atoms/Skeleton';
import Typography from '@/components/atoms/Typography';
import { budgetScopeLabel } from '@/utils/budgetUi';
import Card from '@/components/molecules/Card';
import EmptyState from '@/components/molecules/EmptyState';
import ReorderList from '@/components/organisms/ReorderList';
import MainLayout from '@/components/templates/MainLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useBudgetPeriod } from '@/hooks/useBudgetPeriod';
import { useBudgets } from '@/hooks/useBudgets';
import { useBudgetSpending } from '@/hooks/useBudgetSpending';
import { useCategories } from '@/hooks/useCategories';
import { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import BudgetCard from '@/screens/Budgets/BudgetCard';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { Budget } from '@/types';
import Reveal from '@/components/atoms/Reveal';

const useStyles = makeStyles(({ colors }) => ({
  section: { gap: spacing.md },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.control,
    backgroundColor: colors.primarySoft,
  },
  hintText: { flex: 1 },
  reorderTexts: { flex: 1, gap: 1 },
  reorderTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reorderName: { flexShrink: 1 },
}));

/** Halaman Budget (pen `Lu9SC` · `JqSyG`) — port BudgetsPage web (daftar). */
export default function BudgetsScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.BUDGETS>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const showToast = useToast();
  const period = useBudgetPeriod();
  const { categories, loadCategories } = useCategories();
  const { budgets, status, loadBudgets, reorderBudgets } = useBudgets();
  const [refreshKey, setRefreshKey] = useState(0);
  const { categoryBreakdown } = useBudgetSpending(refreshKey);
  const [reordering, setReordering] = useState(false);
  const [localOrder, setLocalOrder] = useState<Budget[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);

  const initialLoading = status !== 'loaded' && budgets.length === 0;
  const empty = status === 'loaded' && budgets.length === 0;
  const daysLeft = Math.max(0, period.daysInMonth - period.dayOfMonth);
  const openCreate = () => navigation.navigate(ROUTES.BUDGET_FORM);

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      await reorderBudgets(localOrder.map(budget => budget.idBudget));
      setReordering(false);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('budget.genericError'),
        'error',
      );
    } finally {
      setSavingOrder(false);
    }
  };

  const headerRight = reordering ? (
    <>
      <Button
        size="sm"
        variant="outline"
        label={t('common.cancel')}
        disabled={savingOrder}
        onPress={() => setReordering(false)}
      />
      <Button
        size="sm"
        label={t('wallet.saveShort')}
        loading={savingOrder}
        renderIcon={color => <Check size={16} color={color} />}
        onPress={saveOrder}
      />
    </>
  ) : empty ? undefined : (
    <>
      {budgets.length > 1 && (
        <IconButton
          variant="surface"
          label={t('budget.toggleReorder')}
          onPress={() => {
            setLocalOrder(budgets);
            setReordering(true);
          }}
          renderIcon={(color, size) => (
            <ArrowUpDown size={size} color={color} />
          )}
        />
      )}
      <IconButton
        variant="primary"
        label={t('budget.addBudget')}
        onPress={openCreate}
        renderIcon={(color, size) => <Plus size={size} color={color} />}
      />
    </>
  );

  return (
    <MainLayout
      title={t('navShort.budgets')}
      withTabBar
      headerRight={headerRight}
      subtitle={
        !empty && !reordering
          ? t('budget.pageSubtitleShort', {
              month: period.monthLabel,
              count: daysLeft,
            })
          : undefined
      }
      onRefresh={
        reordering
          ? undefined
          : () => {
              setRefreshKey(key => key + 1);
              return Promise.all([loadBudgets(), loadCategories()]);
            }
      }
    >
      {reordering ? (
        <Reveal key="reorder" style={styles.section}>
          <View style={styles.hint}>
            <Info size={16} color={colors.primaryText} />
            <Typography variant="meta" tone="primary" style={styles.hintText}>
              {t('wallet.reorderHintShort')}
            </Typography>
          </View>
          <ReorderList
            items={localOrder}
            keyExtractor={budget => budget.idBudget}
            onReorder={setLocalOrder}
            renderContent={budget => (
              <>
                <BudgetTile budget={budget} categories={categories} />
                {/* Sama dengan web: nama + pin, cakupan kategori di bawahnya. */}
                <View style={styles.reorderTexts}>
                  <View style={styles.reorderTitle}>
                    <Typography
                      variant="label"
                      numberOfLines={1}
                      style={styles.reorderName}
                    >
                      {budget.name}
                    </Typography>
                    {budget.isPinned && (
                      <Pin
                        size={14}
                        color={colors.investmentText}
                        accessibilityLabel={t('budget.pinnedBadge')}
                      />
                    )}
                  </View>
                  <Typography variant="meta" tone="subtle" numberOfLines={1}>
                    {budgetScopeLabel(budget, t)}
                  </Typography>
                </View>
              </>
            )}
          />
        </Reveal>
      ) : empty ? (
        <Card>
          <EmptyState
            icon={<Target size={30} color={colors.primaryText} />}
            title={t('budget.emptyTitle')}
            description={t('budget.emptyDescriptionShort')}
            action={
              <Button
                label={t('budget.addFirst')}
                renderIcon={color => <Plus size={18} color={color} />}
                onPress={openCreate}
              />
            }
          />
        </Card>
      ) : (
        <Reveal key="list" style={styles.section}>
          {initialLoading ? (
            [0, 1, 2].map(index => (
              <Skeleton key={index} height={140} radius={radius.card} />
            ))
          ) : (
            <>
              {budgets.map((budget, index) => (
                <Reveal delay={Math.min(index, 6) * 40} key={budget.idBudget}>
                  <BudgetCard
                    budget={budget}
                    categories={categories}
                    categoryBreakdown={categoryBreakdown}
                    period={period}
                    onPress={() =>
                      navigation.navigate(ROUTES.BUDGET_DETAIL, {
                        idBudget: budget.idBudget,
                      })
                    }
                  />
                </Reveal>
              ))}
              <PressableScale
                accessibilityRole="button"
                scaleTo={0.98}
                onPress={openCreate}
                style={styles.addCard}
              >
                <Plus size={18} color={colors.primaryText} />
                <Typography variant="label" tone="primary">
                  {t('budget.addBudget')}
                </Typography>
              </PressableScale>
            </>
          )}
        </Reveal>
      )}
    </MainLayout>
  );
}
