import WalletTile from '@/components/atoms/WalletTile';
import { radius } from '@/theme/metrics';
import type { WalletAccount } from '@/types';

/** Logo/ikon dompet seukuran slot `leading` Chip (port WalletChipIcon web). */
export default function WalletChipIcon({
  wallet,
}: {
  wallet: Pick<WalletAccount, 'color' | 'logoUrl'>;
}) {
  return (
    <WalletTile
      color={wallet.color}
      logoUrl={wallet.logoUrl}
      size={20}
      radius={radius.pill}
      iconSize={12}
    />
  );
}
