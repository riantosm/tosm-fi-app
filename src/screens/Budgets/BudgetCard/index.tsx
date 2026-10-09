import { View } from 'react-native';
import { Pin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import BudgetTile from '@/components/atoms/BudgetTile';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import BudgetPercentBadge from '@/components/molecules/BudgetPercentBadge';
import BudgetProgressBar from '@/components/molecules/BudgetProgressBar';
import { useTheme } from '@/contexts/ThemeContext';
import type { BudgetPeriod } from '@/hooks/useBudgetPeriod';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { Budget, Category, TransactionCategoryBreakdown } from '@/types';
import {
  computeBudgetProgress,
  computeBudgetSpent,
} from '@/utils/budgetBreakdown';

export interface BudgetCardProps {
  budget: Budget;
  categories: Category[];
  categoryBreakdown: TransactionCategoryBreakdown[];
  period: BudgetPeriod;
  onPress: () => void;
}

const useStyles = makeStyles(({ colors, shadows }) => ({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.transparent,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  over: { borderColor: colors.expense },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  texts: { flex: 1, gap: 2 },
  name: { fontSize: 15 },
  side: { flexDirection: 'row', alignItems: 'center', gap: 10 },
}));

/** Kartu budget HP (pen `Lu9SC`): terpakai / limit, persen, bar + "Hari ini", sisa per hari. */
export default function BudgetCard({
  budget,
  categories,
  categoryBreakdown,
  period,
  onPress,
}: BudgetCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { format, formatNumber } = useMoneyFormat();
  const spent = computeBudgetSpent(budget, categoryBreakdown);
  const progress = computeBudgetProgress(spent, budget.limitAmount, period);
  const over = progress.status === 'over';

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={budget.name}
      scaleTo={0.98}
      onPress={onPress}
      style={[styles.card, over && styles.over]}
    >
      <View style={styles.top}>
        <BudgetTile budget={budget} categories={categories} />
        <View style={styles.texts}>
          <Typography variant="label" numberOfLines={1} style={styles.name}>
            {budget.name}
          </Typography>
          <Typography
            variant="meta"
            tone={over ? 'expense' : 'muted'}
            tabular
            numberOfLines={1}
          >
            {format(spent)} / {formatNumber(budget.limitAmount)}
          </Typography>
        </View>
        <View style={styles.side}>
          {budget.isPinned && (
            <Pin
              size={16}
              color={colors.investmentText}
              accessibilityLabel={t('budget.pinnedBadge')}
            />
          )}
          <BudgetPercentBadge
            percent={progress.percent}
            status={progress.status}
          />
        </View>
      </View>
      <BudgetProgressBar
        ratio={progress.ratio}
        color={over ? colors.expense : budget.color}
        dayOfMonth={period.dayOfMonth}
        daysInMonth={period.daysInMonth}
        todayLabel={t('budget.todayLabel')}
      />
      <Typography
        variant="meta"
        tone={over ? 'expense' : 'muted'}
        numberOfLines={1}
      >
        {over
          ? t('budget.overBy', { amount: formatNumber(progress.overBy) })
          : progress.dailyPace === null
          ? t('budget.paceLastDay', {
              remaining: formatNumber(progress.remaining),
            })
          : t('budget.paceHint', {
              remaining: formatNumber(progress.remaining),
              daily: formatNumber(Math.round(progress.dailyPace)),
            })}
      </Typography>
    </PressableScale>
  );
}
