import { View } from 'react-native';
import { Wallet } from 'lucide-react-native';
import { makeStyles } from '@/theme/makeStyles';

export interface WalletTileProps {
  color: string;
  /** Sisi tile (default 40). Ikon = 45% sisi. */
  size?: number;
  /** Default 12. */
  radius?: number;
  /** Latar `surface` (untuk tile di atas kotak berwarna) alih-alih warna dompet 15%. */
  onTint?: boolean;
}

const useStyles = makeStyles(({ colors }) => ({
  base: { alignItems: 'center', justifyContent: 'center' },
  onTint: { backgroundColor: colors.surface },
}));

/** Tile ikon dompet: warna dompet 15% di belakang ikon `wallet` berwarna penuh (port WalletTile web). */
export default function WalletTile({
  color,
  size = 40,
  radius = 12,
  onTint = false,
}: WalletTileProps) {
  const styles = useStyles();
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: radius },
        onTint ? styles.onTint : { backgroundColor: `${color}26` },
      ]}
    >
      <Wallet size={Math.round(size * 0.45)} color={color} />
    </View>
  );
}
