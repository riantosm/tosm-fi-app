import { View } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import { Check } from 'lucide-react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { transitions } from '@/utils/motion';

export interface OptionRowProps {
  /** Teks di tile depan ("Rp", "$", "0"). */
  leading: string;
  title: string;
  subtitle?: string;
  selected: boolean;
  onSelect: () => void;
}

const useStyles = makeStyles(({ colors }) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: colors.transparent,
    backgroundColor: colors.surface2,
  },
  rowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  tile: {
    width: 40,
    height: 40,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  tileText: { fontSize: 15 },
  texts: { flex: 1, minWidth: 0, gap: 1 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  radioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
}));

/** Baris pilihan tunggal (kartu radio, port OptionRow web): mata uang & format desimal. */
export default function OptionRow({
  leading,
  title,
  subtitle,
  selected,
  onSelect,
}: OptionRowProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <PressableScale
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      scaleTo={0.98}
      onPress={onSelect}
      style={[styles.row, selected && styles.rowSelected]}
    >
      <View style={styles.tile}>
        <Typography
          variant="cardTitle"
          style={[
            styles.tileText,
            { color: selected ? colors.primaryText : colors.text2 },
          ]}
        >
          {leading}
        </Typography>
      </View>
      <View style={styles.texts}>
        <Typography variant="label" numberOfLines={1}>
          {title}
        </Typography>
        {!!subtitle && (
          <Typography variant="numMeta" tone="subtle" tabular numberOfLines={1}>
            {subtitle}
          </Typography>
        )}
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        <AnimatePresence>
          {selected && (
            <MotiView
              from={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={transitions.fade}
            >
              <Check size={13} strokeWidth={3} color={colors.primaryFg} />
            </MotiView>
          )}
        </AnimatePresence>
      </View>
    </PressableScale>
  );
}
