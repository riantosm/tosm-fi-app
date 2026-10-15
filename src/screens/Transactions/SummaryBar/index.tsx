import { memo } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import PressableScale from '@/components/atoms/PressableScale';
import Typography, { type TypographyTone } from '@/components/atoms/Typography';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';
import { MINUS } from '@/utils/money';

export interface SummaryBarProps {
  expense: number;
  income: number;
  /** Ketuk tile → Laporan (sama dengan web HP). */
  onPress?: () => void;
}

const useStyles = makeStyles(({ colors, shadows }) => ({
  row: { flexDirection: 'row', gap: spacing.sm },
  cell: {
    flex: 1,
    gap: 2,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  label: { fontSize: 11.5 },
  value: { fontSize: 16, lineHeight: 21 },
}));

/** Keluar / Masuk / Selisih bulan (pen `VKsHQ`). */
function SummaryBar({ expense, income, onPress }: SummaryBarProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { formatCompact } = useMoneyFormat();
  const net = income - expense;
  const cells: {
    key: string;
    label: string;
    value: string;
    tone: TypographyTone;
  }[] = [
    {
      key: 'expense',
      label: t('transaction.summaryExpenseShort'),
      value: `${expense > 0 ? MINUS : ''}${formatCompact(expense)}`,
      tone: 'expense',
    },
    {
      key: 'income',
      label: t('transaction.summaryIncomeShort'),
      value: `${income > 0 ? '+' : ''}${formatCompact(income)}`,
      tone: 'income',
    },
    {
      key: 'net',
      label: t('transaction.summaryNet'),
      value: `${net > 0 ? '+' : net < 0 ? MINUS : ''}${formatCompact(
        Math.abs(net),
      )}`,
      // Selisih negatif = merah, sama dengan web.
      tone: net < 0 ? 'expense' : 'primary',
    },
  ];
  return (
    <View style={styles.row}>
      {cells.map(cell => (
        <PressableScale
          key={cell.key}
          accessibilityRole="button"
          disabled={!onPress}
          scaleTo={0.97}
          onPress={onPress}
          style={styles.cell}
        >
          <Typography variant="caption" tone="subtle" style={styles.label}>
            {cell.label}
          </Typography>
          <Typography
            variant="num"
            tone={cell.tone}
            tabular
            numberOfLines={1}
            style={styles.value}
          >
            {cell.value}
          </Typography>
        </PressableScale>
      ))}
    </View>
  );
}

// Memo: layar induk sering dirender ulang karena state sheet/dialog; daftar ini tidak perlu ikut.
export default memo(SummaryBar);
