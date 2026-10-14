import { View } from 'react-native';
import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';
import { formatPercent } from '@/utils/investment';
import { MINUS } from '@/utils/money';

export interface ProfitLossPillProps {
  profitLoss: number;
  /** P/L sebagai persentase modal. */
  percent: number;
  /** "↗ +1.860.000 · 6,1%" alih-alih hanya "▲ 6,1%". */
  showAmount?: boolean;
  /** Latar `surface` (di atas gradien hero) alih-alih tint income/expense. */
  onSurface?: boolean;
  /** Tanpa latar & padding (baris daftar). */
  plain?: boolean;
}

const useStyles = makeStyles(({ colors }) => ({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  plain: { paddingVertical: 0, paddingHorizontal: 0 },
  profit: { backgroundColor: colors.incomeSoft },
  loss: { backgroundColor: colors.expenseSoft },
  surface: { backgroundColor: colors.surface },
  text: { fontSize: 12, lineHeight: 15 },
  arrow: { fontSize: 10, lineHeight: 15 },
}));

/** Pil P/L hijau/merah untuk instrumen, akun, dan hero. */
export default function ProfitLossPill({
  profitLoss,
  percent,
  showAmount = false,
  onSurface = false,
  plain = false,
}: ProfitLossPillProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { i18n } = useTranslation();
  const { formatNumber } = useMoneyFormat();
  const loss = profitLoss < 0;
  const tone = loss ? 'expense' : 'income';
  const Trend = loss ? TrendingDown : TrendingUp;

  return (
    <View
      style={[
        styles.base,
        plain
          ? styles.plain
          : onSurface
          ? styles.surface
          : loss
          ? styles.loss
          : styles.profit,
      ]}
    >
      {showAmount ? (
        <>
          <Trend
            size={12}
            color={loss ? colors.expenseText : colors.incomeText}
          />
          <Typography variant="num" tone={tone} tabular style={styles.text}>
            {loss ? MINUS : '+'}
            {formatNumber(Math.abs(profitLoss))} ·{' '}
            {formatPercent(percent, i18n.language)}
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="num" tone={tone} style={styles.arrow}>
            {loss ? '▼' : '▲'}
          </Typography>
          <Typography variant="num" tone={tone} tabular style={styles.text}>
            {formatPercent(percent, i18n.language)}
          </Typography>
        </>
      )}
    </View>
  );
}
