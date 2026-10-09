import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { ArrowUp, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import PressableScale from '@/components/atoms/PressableScale';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/metrics';

const MAX_INPUT_HEIGHT = 132;

const useStyles = makeStyles(({ colors }) => ({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  field: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: 4,
    borderRadius: 24,
    backgroundColor: colors.surface2,
  },
  input: {
    flex: 1,
    maxHeight: MAX_INPUT_HEIGHT,
    paddingVertical: 8,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
  },
  sendActive: { backgroundColor: colors.primary },
}));

/** Input pill + tombol kirim bulat (pen V2/ChatInput). Multi-baris, tumbuh sampai 132. */
export default function ChatComposer({
  onSend,
  disabled,
  bottomInset,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  /** Padding bawah (safe area / tinggi keyboard). */
  bottomInset: number;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const canSend = value.trim().length > 0 && !disabled;

  const submit = () => {
    if (!canSend) {
      return;
    }
    onSend(value);
    setValue('');
  };

  return (
    <View style={[styles.bar, { paddingBottom: bottomInset }]}>
      <View style={styles.field}>
        <Sparkles size={18} color={colors.primaryText} />
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={t('assistant.placeholder')}
          placeholderTextColor={colors.text3}
          accessibilityLabel={t('assistant.placeholder')}
          multiline
          style={styles.input}
        />
      </View>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={t('assistant.send')}
        accessibilityState={{ disabled: !canSend }}
        disabled={!canSend}
        onPress={submit}
        style={[styles.send, canSend && styles.sendActive]}
      >
        <ArrowUp size={20} color={canSend ? colors.primaryFg : colors.text3} />
      </PressableScale>
    </View>
  );
}
