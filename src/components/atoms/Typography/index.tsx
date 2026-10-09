import { Text, type TextProps, type TextStyle } from 'react-native';
import { makeStyles } from '@/theme/makeStyles';
import { textStyles, type TextVariant } from '@/theme/typography';

export type TypographyTone =
  | 'default'
  | 'muted'
  | 'subtle'
  | 'primary'
  | 'income'
  | 'expense'
  | 'investment'
  | 'inverse'
  | 'hero'
  | 'heroMuted';

export interface TypographyProps extends TextProps {
  /** Peran teks (DESIGN_SYSTEM.md §3). Font, ukuran & berat ikut varian. */
  variant?: TextVariant;
  tone?: TypographyTone;
  align?: TextStyle['textAlign'];
  /** Angka sejajar (uang, persen). */
  tabular?: boolean;
}

const useStyles = makeStyles(({ colors }) => ({
  base: { includeFontPadding: false },
  tabular: { fontVariant: ['tabular-nums'] },
  default: { color: colors.text },
  muted: { color: colors.text2 },
  subtle: { color: colors.text3 },
  primary: { color: colors.primaryText },
  income: { color: colors.incomeText },
  expense: { color: colors.expenseText },
  investment: { color: colors.investmentText },
  inverse: { color: colors.primaryFg },
  hero: { color: colors.heroFg },
  heroMuted: { color: colors.heroFg2 },
}));

export default function Typography({
  variant = 'body',
  tone = 'default',
  align,
  tabular = false,
  style,
  ...rest
}: TypographyProps) {
  const styles = useStyles();
  return (
    <Text
      style={[
        styles.base,
        textStyles[variant],
        styles[tone],
        align && { textAlign: align },
        tabular && styles.tabular,
        style,
      ]}
      {...rest}
    />
  );
}
