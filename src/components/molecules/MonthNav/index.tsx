import { View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import IconButton from '@/components/atoms/IconButton';
import Typography from '@/components/atoms/Typography';
import { makeStyles } from '@/theme/makeStyles';
import { fonts } from '@/theme/typography';

export interface MonthNavProps {
  label: string;
  previousLabel: string;
  nextLabel: string;
  onPrevious: () => void;
  onNext: () => void;
}

const useStyles = makeStyles(() => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 16,
    lineHeight: 22,
    textTransform: 'capitalize',
  },
}));

/** "‹ Oktober 2026 ›" di atas grid kalender. */
export default function MonthNav({
  label,
  previousLabel,
  nextLabel,
  onPrevious,
  onNext,
}: MonthNavProps) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <IconButton
        size={32}
        label={previousLabel}
        onPress={onPrevious}
        renderIcon={(color, size) => <ChevronLeft size={size} color={color} />}
      />
      <Typography variant="label" style={styles.label}>
        {label}
      </Typography>
      <IconButton
        size={32}
        label={nextLabel}
        onPress={onNext}
        renderIcon={(color, size) => <ChevronRight size={size} color={color} />}
      />
    </View>
  );
}
