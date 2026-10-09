import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import CategoryIcon from '@/components/atoms/CategoryIcon';
import Typography from '@/components/atoms/Typography';
import Keypad from '@/components/molecules/Keypad';
import BottomSheet from '@/components/organisms/BottomSheet';
import { useAmountCalculator } from '@/hooks/useAmountCalculator';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { fonts } from '@/theme/typography';
import type { BudgetSlice } from '@/utils/budgetBreakdown';

export interface SetLimitSheetProps {
  visible: boolean;
  slice: BudgetSlice | null;
  budgetName: string;
  onClose: () => void;
  /** 0 mengembalikan baris ke "belum ada limit". */
  onSubmit: (limitAmount: number) => void;
}

const useStyles = makeStyles(({ colors }) => ({
  sliceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  sliceTexts: { flex: 1, gap: 1 },
  display: {
    minHeight: 96,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.card,
    backgroundColor: colors.surface2,
  },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  symbol: { fontFamily: fonts.displayMedium, fontSize: 18 },
  value: { flexShrink: 1 },
}));

/** "Atur limit" (pen `R4Ro9g`): limit per kategori/subkategori lewat kalkulator. */
export default function SetLimitSheet(props: SetLimitSheetProps) {
  const { t } = useTranslation();
  return (
    <BottomSheet
      visible={props.visible}
      title={t('budget.setLimitTitle')}
      subtitle={t('budget.inBudget', { name: props.budgetName })}
      closeLabel={t('common.close')}
      onClose={props.onClose}
    >
      {/* Dipasang ulang tiap dibuka supaya kalkulator mulai dari limit baris itu. */}
      {props.visible && props.slice && (
        <LimitBody {...props} slice={props.slice} />
      )}
    </BottomSheet>
  );
}

function LimitBody({
  slice,
  onClose,
  onSubmit,
}: SetLimitSheetProps & { slice: BudgetSlice }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { symbol, format } = useMoneyFormat();
  const calc = useAmountCalculator(slice.limit ?? 0);
  const fontSize =
    calc.displayValue.length > 14
      ? 28
      : calc.displayValue.length > 11
      ? 32
      : 38;

  return (
    <>
      <View style={[styles.sliceCard, { backgroundColor: `${slice.color}1F` }]}>
        <View style={styles.iconWrap}>
          <CategoryIcon icon={slice.icon} color={slice.color} size={40} />
        </View>
        <View style={styles.sliceTexts}>
          <Typography variant="label" numberOfLines={1}>
            {slice.name ?? t('dashboard.otherSubCategory')}
          </Typography>
          <Typography variant="meta" tone="muted" tabular numberOfLines={1}>
            {t('budget.spentThisMonth', { amount: format(slice.spent) })}
          </Typography>
        </View>
      </View>

      <View style={styles.display}>
        <Typography variant="meta" tone="subtle" tabular numberOfLines={1}>
          {calc.hasExpression
            ? calc.expressionDisplay
            : t('budget.limitPerMonth')}
        </Typography>
        <View style={styles.valueRow}>
          <Typography tone="subtle" style={styles.symbol}>
            {symbol}
          </Typography>
          <Typography
            variant="amount"
            tabular
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.value, { fontSize, lineHeight: fontSize * 1.15 }]}
          >
            {calc.displayValue}
          </Typography>
        </View>
      </View>

      <Keypad
        onDigit={calc.handleDigit}
        onDecimal={calc.handleDecimal}
        onTripleZero={calc.handleTripleZero}
        onOperator={calc.handleOperator}
        onBackspace={calc.handleBackspace}
        decimalLabel={calc.decimalSeparator}
        confirmLabel={t('budget.saveLimit')}
        backspaceLabel={t('common.backspace')}
        onConfirm={() => {
          onSubmit(Math.max(0, calc.value));
          onClose();
        }}
      />
    </>
  );
}
