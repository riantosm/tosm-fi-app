import { View } from 'react-native';
import Checkbox from '@/components/atoms/Checkbox';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';

export interface CheckboxRowProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  hint?: string;
}

const useStyles = makeStyles(({ colors }) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderRadius: radius.control,
    backgroundColor: colors.surface2,
  },
  texts: { flex: 1, gap: 1 },
}));

/** Kotak centang + judul + petunjuk dalam satu baris `surface2` (mis. "Setor ke dompet"). */
export default function CheckboxRow({
  checked,
  onChange,
  title,
  hint,
}: CheckboxRowProps) {
  const styles = useStyles();
  return (
    <PressableScale
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={title}
      scaleTo={0.99}
      onPress={() => onChange(!checked)}
      style={styles.row}
    >
      <Checkbox checked={checked} />
      <View style={styles.texts}>
        <Typography variant="label">{title}</Typography>
        {!!hint && (
          <Typography variant="meta" tone="muted">
            {hint}
          </Typography>
        )}
      </View>
    </PressableScale>
  );
}
