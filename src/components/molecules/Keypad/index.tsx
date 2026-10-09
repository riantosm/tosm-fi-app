import { ActivityIndicator, View } from 'react-native';
import { Delete } from 'lucide-react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { CalculatorOperator } from '@/hooks/useAmountCalculator';

export interface KeypadProps {
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onTripleZero: () => void;
  onOperator: (operator: CalculatorOperator) => void;
  onBackspace: () => void;
  decimalLabel: string;
  confirmLabel: string;
  backspaceLabel: string;
  onConfirm: () => void;
  /** Sedang menyimpan: tombol konfirmasi menampilkan spinner & tidak bisa ditekan. */
  confirming?: boolean;
}

type Key =
  | { kind: 'digit'; value: string }
  | { kind: 'op'; value: CalculatorOperator; label: string }
  | { kind: 'decimal' }
  | { kind: 'tripleZero' };

const ROWS: Key[][] = [
  [
    { kind: 'digit', value: '7' },
    { kind: 'digit', value: '8' },
    { kind: 'digit', value: '9' },
    { kind: 'op', value: '÷', label: '÷' },
  ],
  [
    { kind: 'digit', value: '4' },
    { kind: 'digit', value: '5' },
    { kind: 'digit', value: '6' },
    { kind: 'op', value: '×', label: '×' },
  ],
  [
    { kind: 'digit', value: '1' },
    { kind: 'digit', value: '2' },
    { kind: 'digit', value: '3' },
    { kind: 'op', value: '-', label: '−' },
  ],
  [
    { kind: 'tripleZero' },
    { kind: 'digit', value: '0' },
    { kind: 'decimal' },
    { kind: 'op', value: '+', label: '+' },
  ],
];

const useStyles = makeStyles(({ colors }) => ({
  grid: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  key: {
    flex: 1,
    height: 56,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
  },
  op: { backgroundColor: colors.primarySoft },
  confirm: { borderRadius: 16, backgroundColor: colors.primary },
  label: { fontSize: 21, lineHeight: 26 },
  confirmLabel: { fontSize: 15 },
}));

/** Keypad kalkulator nominal (pen V2/Keypad): 7-8-9-÷ … 000-0-,-+, lalu ⌫ + Selesai. */
export default function Keypad({
  onDigit,
  onDecimal,
  onTripleZero,
  onOperator,
  onBackspace,
  decimalLabel,
  confirmLabel,
  backspaceLabel,
  onConfirm,
  confirming = false,
}: KeypadProps) {
  const styles = useStyles();
  const { colors } = useTheme();

  const press = (key: Key) => {
    switch (key.kind) {
      case 'digit':
        return onDigit(key.value);
      case 'op':
        return onOperator(key.value);
      case 'decimal':
        return onDecimal();
      case 'tripleZero':
        return onTripleZero();
    }
  };
  const label = (key: Key) =>
    key.kind === 'digit'
      ? key.value
      : key.kind === 'op'
      ? key.label
      : key.kind === 'decimal'
      ? decimalLabel
      : '000';

  return (
    <View style={styles.grid}>
      {ROWS.map((row, index) => (
        <View key={index} style={styles.row}>
          {row.map(key => (
            <PressableScale
              key={label(key)}
              accessibilityRole="button"
              accessibilityLabel={label(key)}
              scaleTo={0.94}
              onPress={() => press(key)}
              style={[styles.key, key.kind === 'op' && styles.op]}
            >
              <Typography
                variant="amount"
                tone={key.kind === 'op' ? 'primary' : 'default'}
                style={styles.label}
              >
                {label(key)}
              </Typography>
            </PressableScale>
          ))}
        </View>
      ))}
      <View style={styles.row}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={backspaceLabel}
          scaleTo={0.94}
          onPress={onBackspace}
          style={styles.key}
        >
          <Delete size={22} color={colors.text2} />
        </PressableScale>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={confirmLabel}
          accessibilityState={{ busy: confirming, disabled: confirming }}
          disabled={confirming}
          scaleTo={0.96}
          onPress={onConfirm}
          style={[styles.key, styles.confirm]}
        >
          {confirming ? (
            <ActivityIndicator color={colors.primaryFg} />
          ) : (
            <Typography
              variant="label"
              tone="inverse"
              style={styles.confirmLabel}
            >
              {confirmLabel}
            </Typography>
          )}
        </PressableScale>
      </View>
    </View>
  );
}
