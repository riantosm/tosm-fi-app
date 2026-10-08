import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Typography, { type TypographyTone } from '@/components/atoms/Typography';
import { colors } from '@/theme/colors';
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

const toneStyles: Record<BadgeTone, { box: ViewStyle; text: TypographyTone }> =
  {
    primary: { box: { backgroundColor: colors.primarySoft }, text: 'primary' },
    income: { box: { backgroundColor: colors.incomeSoft }, text: 'income' },
    expense: { box: { backgroundColor: colors.expenseSoft }, text: 'expense' },
    investment: {
      box: { backgroundColor: colors.investmentSoft },
      text: 'investment',
    },
    neutral: { box: { backgroundColor: colors.surface2 }, text: 'muted' },
  };

export default function Badge({ label, tone = 'primary', style }: BadgeProps) {
  const { box, text } = toneStyles[tone];
  return (
    <View style={[styles.base, box, style]}>
      <Typography variant="badge" tone={text} numberOfLines={1}>
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    // Di kolom: selebar isi, rata kiri. Di baris: atur lewat `style` (mis. alignSelf center).
    alignSelf: 'flex-start',
  },
});
