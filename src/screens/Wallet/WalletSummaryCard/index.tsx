import { useState } from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';
import { useTranslation } from 'react-i18next';
import Gradient from '@/components/atoms/Gradient';
import Skeleton from '@/components/atoms/Skeleton';
import Typography from '@/components/atoms/Typography';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { fonts } from '@/theme/typography';
import type { WalletAccount } from '@/types';
import { transitions, withDelay } from '@/utils/motion';

export interface WalletSummaryCardProps {
  wallets: WalletAccount[];
  loading?: boolean;
}

const BAR_GAP = 3;

const useStyles = makeStyles(({ colors }) => ({
  card: {
    gap: 14,
    padding: spacing.xl,
    overflow: 'hidden',
    borderRadius: 24,
  },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  symbol: { fontFamily: fonts.displayMedium, fontSize: 17, lineHeight: 22 },
  amount: { flexShrink: 1, fontSize: 34, lineHeight: 40 },
  bar: { flexDirection: 'row', height: 10, gap: BAR_GAP },
  empty: {
    flex: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.heroControl,
  },
  segment: { height: '100%', minWidth: 6, borderRadius: 3 },
  first: {
    borderTopLeftRadius: radius.pill,
    borderBottomLeftRadius: radius.pill,
  },
  last: {
    borderTopRightRadius: radius.pill,
    borderBottomRightRadius: radius.pill,
  },
}));

/** Hero Dompet (pen `cnoOe`): total semua dompet + porsi tiap dompet dalam satu bar bertumpuk. */
export default function WalletSummaryCard({
  wallets,
  loading = false,
}: WalletSummaryCardProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { symbol, formatNumber } = useMoneyFormat();
  const [barWidth, setBarWidth] = useState(0);
  const total = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const positiveTotal = wallets.reduce(
    (sum, wallet) => sum + Math.max(0, wallet.balance),
    0,
  );
  const shares = wallets
    .map(wallet => ({
      wallet,
      share:
        positiveTotal > 0 ? Math.max(0, wallet.balance) / positiveTotal : 0,
    }))
    .filter(item => item.share > 0);
  // Lebar piksel (bukan %) supaya celah antar-segmen tidak membuat bar meluber.
  const usable = Math.max(0, barWidth - BAR_GAP * (shares.length - 1));

  return (
    <View style={styles.card}>
      <Gradient />
      <Typography variant="secondary" tone="heroMuted" numberOfLines={1}>
        {t('wallet.totalShort', { count: wallets.length })}
      </Typography>
      {loading ? (
        <Skeleton width={220} height={40} />
      ) : (
        <View style={styles.amountRow}>
          <Typography tone="heroMuted" style={styles.symbol}>
            {symbol}
          </Typography>
          <Typography
            variant="heroAmount"
            tone="hero"
            tabular
            numberOfLines={1}
            adjustsFontSizeToFit
            style={styles.amount}
          >
            {formatNumber(total)}
          </Typography>
        </View>
      )}
      <View
        style={styles.bar}
        onLayout={event => setBarWidth(event.nativeEvent.layout.width)}
      >
        {shares.length === 0 || barWidth === 0 ? (
          <View style={styles.empty} />
        ) : (
          shares.map(({ wallet, share }, index) => (
            <MotiView
              key={wallet.idWallet}
              from={{ width: 0 }}
              animate={{ width: Math.max(6, usable * share) }}
              transition={withDelay(transitions.grow, 100 + index * 50)}
              style={[
                styles.segment,
                index === 0 && styles.first,
                index === shares.length - 1 && styles.last,
                { backgroundColor: wallet.color },
              ]}
            />
          ))
        )}
      </View>
    </View>
  );
}
