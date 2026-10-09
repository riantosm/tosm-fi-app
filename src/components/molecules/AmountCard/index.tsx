import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Calculator } from 'lucide-react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { fonts } from '@/theme/typography';
import Reveal from '@/components/atoms/Reveal';

export interface AmountCardProps {
  amount: number;
  /** Ada → tombol kalkulator di kanan; seluruh baris angka bisa ditekan. */
  onPickAmount?: () => void;
  pickAmountLabel?: string;
  /** Biasanya CategoryPickerRow (dipisah garis dari angka). */
  header?: ReactNode;
  caption?: string;
}

const useStyles = makeStyles(({ colors, shadows }) => ({
  card: {
    gap: 14,
    padding: 18,
    borderRadius: radius.card,
    backgroundColor: colors.surface2,
  },
  divider: { height: 1, backgroundColor: colors.border },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  number: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  symbol: { fontFamily: fonts.displayMedium, fontSize: 18 },
  numberValue: { flexShrink: 1 },
  calc: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...shadows.card,
  },
}));

/** Blok nominal besar "IDR 45.000" di setiap form uang (pen AmountCard). */
export default function AmountCard({
  amount,
  onPickAmount,
  pickAmountLabel,
  header,
  caption,
}: AmountCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { symbol, formatNumber } = useMoneyFormat();
  const value = formatNumber(amount);
  const fontSize = value.length > 14 ? 28 : value.length > 11 ? 34 : 40;

  const number = (
    <View style={styles.number}>
      <Typography tone="subtle" style={styles.symbol}>
        {symbol}
      </Typography>
      <Reveal variant="fade" key={value} style={styles.numberValue}>
        <Typography
          variant="amount"
          tabular
          numberOfLines={1}
          style={{ fontSize, lineHeight: fontSize * 1.15 }}
        >
          {value}
        </Typography>
      </Reveal>
    </View>
  );

  return (
    <View style={styles.card}>
      {header && (
        <>
          {header}
          <View style={styles.divider} />
        </>
      )}
      {!!caption && (
        <Typography variant="meta" tone="subtle">
          {caption}
        </Typography>
      )}
      {onPickAmount ? (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={pickAmountLabel}
          scaleTo={0.99}
          onPress={onPickAmount}
          style={styles.numberRow}
        >
          {number}
          <View style={styles.calc}>
            <Calculator size={18} color={colors.primaryText} />
          </View>
        </PressableScale>
      ) : (
        number
      )}
    </View>
  );
}
