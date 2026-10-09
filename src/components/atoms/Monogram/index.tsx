import { View } from 'react-native';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { radius as radii } from '@/theme/metrics';
import { makeStyles } from '@/theme/makeStyles';
import { fonts } from '@/theme/typography';
import { getInitials } from '@/utils/format';

export interface MonogramProps {
  /** Nama sumber dua huruf (instrumen / akun investasi). */
  name: string;
  /** Warna data user. soft = `${color}26` + huruf berwarna; solid = isi penuh + huruf putih. */
  color: string;
  variant?: 'soft' | 'solid';
  /** circle (pemilih, alokasi aset) atau square (tile instrumen/akun). */
  shape?: 'circle' | 'square';
  size?: number;
}

const useStyles = makeStyles(() => ({
  base: { alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fonts.display, letterSpacing: 0.3 },
}));

/** Tile dua huruf untuk instrumen & akun investasi. */
export default function Monogram({
  name,
  color,
  variant = 'soft',
  shape = 'circle',
  size = 38,
}: MonogramProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const solid = variant === 'solid';
  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: shape === 'square' ? size * 0.3 : radii.pill,
          backgroundColor: solid ? color : `${color}26`,
        },
      ]}
    >
      <Typography
        style={[
          styles.text,
          { fontSize: size * 0.34, color: solid ? colors.onData : color },
        ]}
      >
        {getInitials(name)}
      </Typography>
    </View>
  );
}
