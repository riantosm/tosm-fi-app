import { View } from 'react-native';
import { ChevronDown, Landmark } from 'lucide-react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';

export interface InvestmentAccountSummaryProps {
  /** Label kecil di atas nama ("DARI" / "KE"). */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Kolom kanan ("Nilai" + nominal). */
  valueLabel?: string;
  value?: string;
  /** Jadikan kartu pemicu pemilih (chevron di kanan). */
  onPress?: () => void;
  /** Tampilan placeholder saat belum memilih. */
  empty?: boolean;
}

const useStyles = makeStyles(({ colors }) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: colors.surface2,
  },
  icon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.control,
    backgroundColor: colors.primarySoft,
  },
  texts: { flex: 1, gap: 1 },
  value: { alignItems: 'flex-end', gap: 1 },
  valueLabel: { fontSize: 11, lineHeight: 14 },
}));

/** Kartu akun di atas form uang investasi (Tarik dana, Update nilai, Transfer). */
export default function InvestmentAccountSummary({
  eyebrow,
  title,
  subtitle,
  valueLabel,
  value,
  onPress,
  empty = false,
}: InvestmentAccountSummaryProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <PressableScale
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      scaleTo={0.98}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.icon}>
        <Landmark size={18} color={colors.primaryText} />
      </View>
      <View style={styles.texts}>
        {!!eyebrow && (
          <Typography variant="eyebrow" tone="subtle">
            {eyebrow}
          </Typography>
        )}
        <Typography
          variant="label"
          tone={empty ? 'subtle' : 'default'}
          numberOfLines={1}
        >
          {title}
        </Typography>
        {!!subtitle && (
          <Typography variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </Typography>
        )}
      </View>
      {value !== undefined && (
        <View style={styles.value}>
          {!!valueLabel && (
            <Typography
              variant="caption"
              tone="subtle"
              style={styles.valueLabel}
            >
              {valueLabel}
            </Typography>
          )}
          <Typography variant="num" tabular>
            {value}
          </Typography>
        </View>
      )}
      {onPress && <ChevronDown size={16} color={colors.text3} />}
    </PressableScale>
  );
}
