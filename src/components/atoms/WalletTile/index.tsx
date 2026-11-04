import { useState } from 'react';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';
import { Wallet } from 'lucide-react-native';
import { makeStyles } from '@/theme/makeStyles';

export interface WalletTileProps {
  color: string;
  /** Logo yang diunggah; jatuh ke ikon dompet kalau kosong atau gagal dimuat. */
  logoUrl?: string | null;
  /** Sisi tile (default 40). Ikon = 45% sisi. */
  size?: number;
  /** Default 12. */
  radius?: number;
  /** Ukuran ikon dompet (default 45% sisi). */
  iconSize?: number;
  /** Latar `surface` (untuk tile di atas kotak berwarna) alih-alih warna dompet 15%. */
  onTint?: boolean;
  style?: StyleProp<ViewStyle>;
}

const useStyles = makeStyles(({ colors }) => ({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  onTint: { backgroundColor: colors.surface },
}));

/**
 * Tile ikon dompet (port WalletTile web): logo dompet kalau ada, selain itu
 * warna dompet 15% di belakang ikon `wallet` berwarna penuh.
 */
export default function WalletTile({
  color,
  logoUrl,
  size = 40,
  radius = 12,
  iconSize,
  onTint = false,
  style,
}: WalletTileProps) {
  const styles = useStyles();
  // Per URL, supaya logo baru dicoba lagi setelah logo lama gagal.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showLogo = !!logoUrl && failedUrl !== logoUrl;

  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: radius },
        onTint || showLogo ? styles.onTint : { backgroundColor: `${color}26` },
        style,
      ]}
    >
      {showLogo ? (
        <Image
          source={{ uri: logoUrl }}
          style={{ width: size, height: size }}
          resizeMode="contain"
          onError={() => setFailedUrl(logoUrl)}
        />
      ) : (
        <Wallet size={iconSize ?? Math.round(size * 0.45)} color={color} />
      )}
    </View>
  );
}
