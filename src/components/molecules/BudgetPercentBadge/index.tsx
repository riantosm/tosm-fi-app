import { View } from 'react-native';
import Typography from '@/components/atoms/Typography';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';
import type { BudgetStatus } from '@/utils/budgetBreakdown';

export interface BudgetPercentBadgeProps {
  percent: number;
  status: BudgetStatus;
  /** Versi kecil untuk baris rincian. */
  small?: boolean;
}

const useStyles = makeStyles(({ colors }) => ({
  base: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  small: { paddingVertical: 3, paddingHorizontal: 8 },
  ok: { backgroundColor: colors.surface2 },
  warn: { backgroundColor: colors.investmentSoft },
  over: { backgroundColor: colors.expenseSoft },
  text: { fontSize: 13, lineHeight: 16 },
  textSmall: { fontSize: 11.5, lineHeight: 14 },
}));

const TONE = { ok: 'muted', warn: 'investment', over: 'expense' } as const;

/** Pil "77%": netral, kuning mulai 90%, merah saat lewat limit. */
export default function BudgetPercentBadge({
  percent,
  status,
  small = false,
}: BudgetPercentBadgeProps) {
  const styles = useStyles();
  return (
    <View style={[styles.base, small && styles.small, styles[status]]}>
      <Typography
        variant="num"
        tone={TONE[status]}
        tabular
        style={small ? styles.textSmall : styles.text}
      >
        {percent}%
      </Typography>
    </View>
  );
}
