import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import WalletTile from '@/components/atoms/WalletTile';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { fonts } from '@/theme/typography';
import type { WalletAccount } from '@/types';

export interface WalletCardProps {
  wallet: WalletAccount;
  /** Porsi dari total saldo, 0–100. */
  share: number;
  /** card = kartu grid · row = baris tampilan list (di dalam Card). */
  variant?: 'card' | 'row';
  /** Baris list: tampilkan garis pemisah di atas. */
  divider?: boolean;
  onPress: () => void;
}

const useStyles = makeStyles(({ colors, shadows }) => ({
  card: {
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.transparent,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  cardPrimary: { borderColor: colors.primary },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  texts: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flexShrink: 1 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  symbol: { fontFamily: fonts.displayMedium, fontSize: 13, lineHeight: 18 },
  amount: { flexShrink: 1, fontSize: 24, lineHeight: 30, letterSpacing: -0.4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
  },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
}));

/** Kartu / baris dompet (pen `cnoOe` grid · `YYZ1Z` list) — port WalletCard web. */
export default function WalletCard({
  wallet,
  share,
  variant = 'card',
  divider = false,
  onPress,
}: WalletCardProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { symbol, formatNumber } = useMoneyFormat();
  const pct = Math.round(share);
  const count = t('wallet.transactionCount', { n: wallet.transactionCount });

  const name = (
    <View style={styles.nameRow}>
      <Typography variant="label" numberOfLines={1} style={styles.name}>
        {wallet.nameWallet}
      </Typography>
      {wallet.isPrimary && <Badge label={t('wallet.primary')} />}
    </View>
  );

  if (variant === 'row') {
    return (
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${wallet.nameWallet}, ${symbol} ${formatNumber(
          wallet.balance,
        )}`}
        scaleTo={0.98}
        onPress={onPress}
        style={[styles.row, divider && styles.divider]}
      >
        <WalletTile color={wallet.color} size={38} />
        <View style={styles.texts}>
          {name}
          <Typography variant="caption" tone="subtle" numberOfLines={1}>
            {count} · {pct}%
          </Typography>
        </View>
        <Typography variant="num" tabular>
          {formatNumber(wallet.balance)}
        </Typography>
      </PressableScale>
    );
  }

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${wallet.nameWallet}, ${symbol} ${formatNumber(
        wallet.balance,
      )}`}
      scaleTo={0.98}
      onPress={onPress}
      style={[styles.card, wallet.isPrimary && styles.cardPrimary]}
    >
      <View style={styles.top}>
        <WalletTile color={wallet.color} />
        <View style={styles.texts}>
          {name}
          <Typography variant="caption" tone="subtle" numberOfLines={1}>
            {count}
          </Typography>
        </View>
        <Typography variant="caption" tone="subtle" tabular>
          {pct}%
        </Typography>
      </View>
      <View style={styles.amountRow}>
        <Typography tone="subtle" style={styles.symbol}>
          {symbol}
        </Typography>
        <Typography
          variant="heroAmount"
          tabular
          numberOfLines={1}
          adjustsFontSizeToFit
          style={styles.amount}
        >
          {formatNumber(wallet.balance)}
        </Typography>
      </View>
    </PressableScale>
  );
}
