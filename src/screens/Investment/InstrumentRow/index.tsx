import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Monogram from '@/components/atoms/Monogram';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import AreaChart from '@/components/molecules/AreaChart';
import ProfitLossPill from '@/components/molecules/ProfitLossPill';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';
import type { Instrument, TimelinePoint } from '@/types';
import { activeAccounts, getInstrumentTotals } from '@/utils/investment';

export interface InstrumentRowProps {
  instrument: Instrument;
  sparkline: TimelinePoint[];
  divider?: boolean;
  onPress: () => void;
}

const useStyles = makeStyles(({ colors }) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  texts: { flex: 1, gap: 1 },
  spark: { width: 64 },
  value: { alignItems: 'flex-end', gap: 1 },
  amount: { fontSize: 14.5 },
}));

/** Baris instrumen HP (pen `Q1BjKl`): monogram, nama, sparkline, nilai + P/L %. */
export default function InstrumentRow({
  instrument,
  sparkline,
  divider = false,
  onPress,
}: InstrumentRowProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { formatNumber } = useMoneyFormat();
  const totals = getInstrumentTotals(instrument);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={instrument.nameInstrument}
      scaleTo={0.98}
      onPress={onPress}
      style={[styles.row, divider && styles.divider]}
    >
      <Monogram
        name={instrument.nameInstrument}
        color={instrument.color}
        variant="solid"
        shape="square"
        size={38}
      />
      <View style={styles.texts}>
        <Typography variant="label" numberOfLines={1}>
          {instrument.nameInstrument}
        </Typography>
        <Typography variant="caption" tone="subtle" numberOfLines={1}>
          {t('investment.accountsShort', {
            count: activeAccounts(instrument).length,
          })}
        </Typography>
      </View>
      <View style={styles.spark}>
        {sparkline.length > 1 && (
          <AreaChart
            height={28}
            series={[
              {
                key: 'current',
                values: sparkline.map(point => point.current),
                color: instrument.color,
                strokeWidth: 1.75,
                // Gradasi sama dengan sparkline kartu akun.
                fillOpacity: 0.3,
              },
            ]}
          />
        )}
      </View>
      <View style={styles.value}>
        <Typography variant="num" tabular style={styles.amount}>
          {formatNumber(totals.currentValue)}
        </Typography>
        <ProfitLossPill
          profitLoss={totals.profitLoss}
          percent={totals.profitLossPercent}
          plain
        />
      </View>
    </PressableScale>
  );
}
