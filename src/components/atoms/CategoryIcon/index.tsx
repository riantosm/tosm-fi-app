import { View } from 'react-native';
import { resolveCategoryIcon } from '@/constants/categoryIcons';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';

export interface CategoryIconProps {
  /** Nama ikon tersimpan (lihat `constants/categoryIcons`). */
  icon: string;
  color: string;
  /** Diameter lingkaran (default 44). Ikon ≈ 45% diameter. */
  size?: number;
  /** Garis 1.5 berwarna (tombol pemilih ikon / ikon terpilih). */
  outlined?: boolean;
}

const useStyles = makeStyles(() => ({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  outlined: { borderWidth: 1.5 },
}));

/** Ikon kategori/subkategori di lingkaran `${warna}26` dengan glyph berwarna penuh. */
export default function CategoryIcon({
  icon,
  color,
  size = 44,
  outlined = false,
}: CategoryIconProps) {
  const styles = useStyles();
  const Icon = resolveCategoryIcon(icon);
  return (
    <View
      style={[
        styles.base,
        outlined && [styles.outlined, { borderColor: color }],
        { width: size, height: size, backgroundColor: `${color}26` },
      ]}
    >
      <Icon size={Math.round(size * 0.45)} color={color} />
    </View>
  );
}
