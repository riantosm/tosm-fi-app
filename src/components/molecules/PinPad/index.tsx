import { View } from 'react-native';
import { Delete, FingerprintPattern } from 'lucide-react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';
import { fonts } from '@/theme/typography';

export interface PinPadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  /** Ada → tombol sidik jari di kiri bawah (layar buka kunci). */
  onBiometric?: () => void;
  biometricLabel?: string;
  deleteLabel: string;
  disabled?: boolean;
}

const KEY = 72;
const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

const useStyles = makeStyles(({ colors }) => ({
  pad: { width: 288, gap: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  key: {
    width: KEY,
    height: KEY,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
  },
  keyGhost: { backgroundColor: colors.transparent },
  digit: { fontFamily: fonts.num, fontSize: 26, lineHeight: 32 },
}));

/** Keypad PIN bulat (pen `V2/PinPad`): 1–9, [sidik jari] 0 [hapus]. */
export default function PinPad({
  onDigit,
  onDelete,
  onBiometric,
  biometricLabel,
  deleteLabel,
  disabled = false,
}: PinPadProps) {
  const styles = useStyles();
  const { colors } = useTheme();

  const digitKey = (digit: string) => (
    <PressableScale
      key={digit}
      accessibilityRole="button"
      accessibilityLabel={digit}
      disabled={disabled}
      scaleTo={0.9}
      onPress={() => onDigit(digit)}
      style={styles.key}
    >
      <Typography style={styles.digit}>{digit}</Typography>
    </PressableScale>
  );

  return (
    <View style={styles.pad}>
      {ROWS.map(row => (
        <View key={row[0]} style={styles.row}>
          {row.map(digitKey)}
        </View>
      ))}
      <View style={styles.row}>
        {onBiometric ? (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={biometricLabel}
            disabled={disabled}
            scaleTo={0.9}
            onPress={onBiometric}
            style={[styles.key, styles.keyGhost]}
          >
            <FingerprintPattern size={30} color={colors.primary} />
          </PressableScale>
        ) : (
          <View style={[styles.key, styles.keyGhost]} />
        )}
        {digitKey('0')}
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={deleteLabel}
          disabled={disabled}
          scaleTo={0.9}
          onPress={onDelete}
          style={[styles.key, styles.keyGhost]}
        >
          <Delete size={26} color={colors.text2} />
        </PressableScale>
      </View>
    </View>
  );
}
