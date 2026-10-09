import { View } from 'react-native';
import { Calendar } from 'lucide-react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { AssistantQuickReply } from '@/types';

const useStyles = makeStyles(({ colors }) => ({
  button: {
    minHeight: 44,
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  dot: { width: 8, height: 8, borderRadius: radius.pill },
  label: { flexShrink: 1, fontSize: 13.5 },
  disabled: { opacity: 0.5 },
}));

/** Pill outline primary sebagai jawaban sekali ketuk (pen V2/QuickReply). */
export default function QuickReplyButton({
  reply,
  onSelect,
  disabled,
}: {
  reply: AssistantQuickReply;
  onSelect: (reply: AssistantQuickReply) => void;
  disabled?: boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <PressableScale
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => onSelect(reply)}
      style={[styles.button, disabled && styles.disabled]}
    >
      {!!reply.dot && (
        <View style={[styles.dot, { backgroundColor: reply.dot }]} />
      )}
      {reply.icon === 'calendar' && (
        <Calendar size={15} color={colors.primaryText} />
      )}
      <Typography
        variant="label"
        tone="primary"
        numberOfLines={1}
        style={styles.label}
      >
        {reply.label}
      </Typography>
    </PressableScale>
  );
}
