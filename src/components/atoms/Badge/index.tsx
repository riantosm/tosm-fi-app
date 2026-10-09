import { View, type StyleProp, type ViewStyle } from 'react-native';
import Typography, { type TypographyTone } from '@/components/atoms/Typography';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';

export type BadgeTone =
  | 'primary'
  | 'income'
  | 'expense'
  | 'investment'
  | 'neutral';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  style?: StyleProp<ViewStyle>;
}

const TEXT_TONE: Record<BadgeTone, TypographyTone> = {
  primary: 'primary',
  income: 'income',
  expense: 'expense',
  investment: 'investment',
  neutral: 'muted',
};

const useStyles = makeStyles(({ colors }) => ({
  base: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    // Di kolom: selebar isi, rata kiri. Di baris: atur lewat `style` (mis. alignSelf center).
    alignSelf: 'flex-start',
  },
  primary: { backgroundColor: colors.primarySoft },
  income: { backgroundColor: colors.incomeSoft },
  expense: { backgroundColor: colors.expenseSoft },
  investment: { backgroundColor: colors.investmentSoft },
  neutral: { backgroundColor: colors.surface2 },
}));

export default function Badge({ label, tone = 'primary', style }: BadgeProps) {
  const styles = useStyles();
  return (
    <View style={[styles.base, styles[tone], style]}>
      <Typography variant="badge" tone={TEXT_TONE[tone]} numberOfLines={1}>
        {label}
      </Typography>
    </View>
  );
}
