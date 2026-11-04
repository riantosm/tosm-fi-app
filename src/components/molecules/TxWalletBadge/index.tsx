import WalletTile from '@/components/atoms/WalletTile';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';
import type { WalletAccount } from '@/types';

const useStyles = makeStyles(({ colors, shadows }) => ({
  // Cincin surface memisahkan badge dari tile kategori di belakangnya.
  ring: { borderWidth: 2, borderColor: colors.surface, ...shadows.card },
}));

/** Dompet transaksi (logo, atau ikon berwarna dompet) di pojok tile TxRow (port web). */
export default function TxWalletBadge({
  wallet,
}: {
  wallet: Pick<WalletAccount, 'color' | 'logoUrl'>;
}) {
  const styles = useStyles();
  return (
    <WalletTile
      color={wallet.color}
      logoUrl={wallet.logoUrl}
      size={22}
      radius={radius.pill}
      iconSize={11}
      onTint
      style={styles.ring}
    />
  );
}
