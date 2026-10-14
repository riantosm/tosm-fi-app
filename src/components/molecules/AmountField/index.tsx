import { useState } from 'react';
import { Banknote, Calculator } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import PressableScale from '@/components/atoms/PressableScale';
import TextField from '@/components/molecules/TextField';
import AmountCalculatorSheet from '@/components/organisms/AmountCalculatorSheet';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { fonts } from '@/theme/typography';
import { formatNumberInput, parseFormattedNumber } from '@/utils/numberInput';

export interface AmountFieldProps {
  label: string;
  /** Teks terformat ("1.000.000"). */
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  error?: string;
}

const useStyles = makeStyles(() => ({
  // Web: input nominal Outfit 400, angka sejajar.
  input: { fontFamily: fonts.numRegular, fontVariant: ['tabular-nums'] },
}));

/** Field nominal (ikon banknote) + tombol kalkulator yang membuka kalkulator bersama. */
export default function AmountField({
  label,
  value,
  onChange,
  helper,
  error,
}: AmountFieldProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  return (
    <>
      <TextField
        variant="filled"
        label={label}
        value={value}
        onChangeText={raw => onChange(formatNumberInput(raw))}
        placeholder="0"
        keyboardType="decimal-pad"
        style={styles.input}
        helper={helper}
        error={error}
        renderLeadingIcon={color => <Banknote size={18} color={color} />}
        renderTrailing={() => (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={t('transaction.amountTitle')}
            hitSlop={8}
            scaleTo={0.9}
            onPress={() => setCalculatorOpen(true)}
          >
            <Calculator size={18} color={colors.text3} />
          </PressableScale>
        )}
      />
      <AmountCalculatorSheet
        visible={calculatorOpen}
        amount={parseFormattedNumber(value)}
        onClose={() => setCalculatorOpen(false)}
        onConfirm={amount =>
          onChange(formatNumberInput(String(amount).replace('.', ',')))
        }
      />
    </>
  );
}
