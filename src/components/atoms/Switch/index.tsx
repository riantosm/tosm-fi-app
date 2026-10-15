import { MotiView } from 'moti';
import PressableScale from '@/components/atoms/PressableScale';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';
import { transitions } from '@/utils/motion';

export interface SwitchProps {
  value: boolean;
  /** Tidak ada → hanya tampilan (baris induk yang menangani tap). */
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

const TRACK_WIDTH = 46;
const TRACK_HEIGHT = 28;
const KNOB = 22;
const PADDING = 3;

const useStyles = makeStyles(({ colors }) => ({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    padding: PADDING,
    borderRadius: radius.pill,
    justifyContent: 'center',
  },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: radius.pill,
    backgroundColor: colors.onData,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  disabled: { opacity: 0.45 },
}));

/** Switch on/off Mist (pen `V2/Switch On` / `Off`): track `primary` / `text3`, knob putih. */
export default function Switch({
  value,
  onValueChange,
  disabled = false,
  accessibilityLabel,
}: SwitchProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <PressableScale
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled || !onValueChange}
      onPress={() => onValueChange?.(!value)}
      hitSlop={8}
      style={disabled && styles.disabled}
    >
      <MotiView
        animate={{ backgroundColor: value ? colors.primary : colors.text3 }}
        transition={transitions.fade}
        style={styles.track}
      >
        <MotiView
          animate={{
            translateX: value ? TRACK_WIDTH - KNOB - PADDING * 2 : 0,
          }}
          transition={transitions.indicator}
          style={styles.knob}
        />
      </MotiView>
    </PressableScale>
  );
}
