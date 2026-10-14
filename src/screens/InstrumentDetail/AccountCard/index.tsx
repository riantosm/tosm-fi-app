import type { ReactNode } from 'react';
import { View } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import {
  ArrowUpRight,
  Check,
  Pencil,
  TrendingUpDown,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Monogram from '@/components/atoms/Monogram';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import AreaChart from '@/components/molecules/AreaChart';
import ProfitLossPill from '@/components/molecules/ProfitLossPill';
import { useTheme } from '@/contexts/ThemeContext';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { Instrument, InvestmentAccount, TimelinePoint } from '@/types';
import { sumInvestmentAccounts } from '@/utils/investment';
import { transitions } from '@/utils/motion';

export interface AccountCardProps {
  account: InvestmentAccount;
  instrument: Instrument;
  sparkline: TimelinePoint[];
  selected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onWithdraw: () => void;
  onProfitLoss: () => void;
}

const useStyles = makeStyles(({ colors, shadows }) => ({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  selected: { borderWidth: 2, borderColor: colors.primary },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  monogram: { position: 'relative' },
  check: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.text3,
    backgroundColor: colors.surface,
  },
  checkOn: { borderColor: colors.primary, backgroundColor: colors.primary },
  texts: { flex: 1, gap: 1 },
  spark: { width: 56 },
  value: { alignItems: 'flex-end', gap: 1 },
  amount: { fontSize: 14.5 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: {
    flex: 1,
    height: 33,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
  },
  actionPrimary: { backgroundColor: colors.primary },
}));

/**
 * Kartu akun di detail instrumen (pen `Dn41X`): ketuk untuk memilih/melepas dari grafik;
 * Edit / Tarik / P/L di bawah.
 */
export default function AccountCard({
  account,
  instrument,
  sparkline,
  selected,
  onToggleSelect,
  onEdit,
  onWithdraw,
  onProfitLoss,
}: AccountCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { formatNumber } = useMoneyFormat();
  const totals = sumInvestmentAccounts([account]);

  const action = (
    key: string,
    label: string,
    Icon: typeof Pencil,
    onPress: () => void,
    primary = false,
  ): ReactNode => (
    <PressableScale
      key={key}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${account.nameInvestmentAccount}`}
      scaleTo={0.95}
      onPress={onPress}
      style={[styles.action, primary && styles.actionPrimary]}
    >
      <Icon size={14} color={primary ? colors.primaryFg : colors.text2} />
      <Typography
        variant={primary ? 'tileLabel' : 'metaMedium'}
        style={{ color: primary ? colors.primaryFg : colors.text2 }}
      >
        {label}
      </Typography>
    </PressableScale>
  );

  return (
    <PressableScale
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={t('investment.toggleAccountChart', {
        name: account.nameInvestmentAccount,
      })}
      scaleTo={0.99}
      onPress={onToggleSelect}
      style={[styles.card, selected && styles.selected]}
    >
      <View style={styles.top}>
        <View style={styles.monogram}>
          <Monogram
            name={account.nameInvestmentAccount}
            color={instrument.color}
            shape="square"
            size={34}
            fontSize={13}
          />
          <View style={[styles.check, selected && styles.checkOn]}>
            <AnimatePresence>
              {selected && (
                <MotiView
                  key="on"
                  from={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={transitions.pop}
                >
                  <Check size={11} color={colors.primaryFg} />
                </MotiView>
              )}
            </AnimatePresence>
          </View>
        </View>
        <View style={styles.texts}>
          <Typography variant="label" numberOfLines={1}>
            {account.nameInvestmentAccount}
          </Typography>
          <Typography variant="caption" tone="subtle" numberOfLines={1}>
            {t('investment.capitalShort', {
              amount: formatNumber(totals.investedAmount),
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
      </View>
      <View style={styles.actions}>
        {action('edit', t('investment.edit'), Pencil, onEdit)}
        {action(
          'withdraw',
          t('investment.withdrawShort'),
          ArrowUpRight,
          onWithdraw,
        )}
        {action(
          'pl',
          t('investment.plShort'),
          TrendingUpDown,
          onProfitLoss,
          true,
        )}
      </View>
    </PressableScale>
  );
}
