import { View } from 'react-native';
import { Pin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import PressableScale from '@/components/atoms/PressableScale';
import ProgressRing from '@/components/atoms/ProgressRing';
import Skeleton from '@/components/atoms/Skeleton';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import EmptyState from '@/components/molecules/EmptyState';
import SectionHead from '@/components/molecules/SectionHead';
import { useTheme } from '@/contexts/ThemeContext';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';
import type { Budget, TransactionCategoryBreakdown } from '@/types';
import { computeBudgetSpent } from '@/utils/budgetBreakdown';

export interface BudgetsCardProps {
  budgets: Budget[];
  categoryBreakdown: TransactionCategoryBreakdown[];
  isLoading: boolean;
  onSeeAll: () => void;
  onOpenBudget: (budget: Budget) => void;
}

const useStyles = makeStyles(() => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 6,
  },
  texts: { flex: 1, gap: spacing.xxs },
  percent: { fontSize: 11.5 },
  dim: { opacity: 0.6 },
}));

/** "Bulan ini · Budget di-pin" — hanya budget yang di-pin (pen `wCEBW`). */
export default function BudgetsCard({
  budgets,
  categoryBreakdown,
  isLoading,
  onSeeAll,
  onOpenBudget,
}: BudgetsCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { format, formatNumber } = useMoneyFormat();
  const pinned = budgets.filter(budget => budget.isPinned);

  return (
    <Card>
      <SectionHead
        eyebrow={t('dashboard.budgetsEyebrow')}
        title={t('dashboard.budgetsTitle')}
        actionLabel={t('dashboard.seeAllShort')}
        onAction={onSeeAll}
      />
      {isLoading && pinned.length === 0 ? (
        [0, 1].map(i => (
          <View key={i} style={styles.row}>
            <Skeleton width={52} height={52} />
            <View style={styles.texts}>
              <Skeleton width="40%" height={13} />
              <Skeleton width="60%" height={11} />
            </View>
          </View>
        ))
      ) : pinned.length === 0 ? (
        <EmptyState
          icon={<Pin size={32} color={colors.primaryText} />}
          title={t('dashboard.noPinnedBudgets')}
        />
      ) : (
        <View style={isLoading && styles.dim}>
          {pinned.map(budget => {
            const spent = computeBudgetSpent(budget, categoryBreakdown);
            const ratio =
              budget.limitAmount > 0 ? spent / budget.limitAmount : 0;
            const over = ratio > 1;
            const remaining = budget.limitAmount - spent;
            return (
              <PressableScale
                key={budget.idBudget}
                accessibilityRole="button"
                scaleTo={0.98}
                onPress={() => onOpenBudget(budget)}
                style={styles.row}
              >
                <ProgressRing
                  size={52}
                  thickness={6}
                  value={over ? 1 : ratio}
                  color={over ? colors.expense : budget.color}
                >
                  <Typography
                    variant="tileLabel"
                    tone={over ? 'expense' : 'default'}
                    tabular
                    style={styles.percent}
                  >
                    {Math.round(ratio * 100)}%
                  </Typography>
                </ProgressRing>
                <View style={styles.texts}>
                  <Typography variant="label" numberOfLines={1}>
                    {budget.name}
                  </Typography>
                  <Typography
                    variant="meta"
                    tone="muted"
                    tabular
                    numberOfLines={1}
                  >
                    {format(spent)} / {formatNumber(budget.limitAmount)}
                  </Typography>
                  <Typography
                    variant="caption"
                    tone={over ? 'expense' : 'subtle'}
                    numberOfLines={1}
                  >
                    {over
                      ? t('dashboard.budgetOver', {
                          amount: format(Math.abs(remaining)),
                        })
                      : t('dashboard.budgetRemaining', {
                          amount: format(remaining),
                        })}
                  </Typography>
                </View>
              </PressableScale>
            );
          })}
        </View>
      )}
    </Card>
  );
}
