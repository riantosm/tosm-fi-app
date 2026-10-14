import type { ReactNode } from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';
import { CircleAlert } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import AiMark from '@/components/atoms/AiMark';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';
import { transitions, withDelay } from '@/utils/motion';
import Reveal from '@/components/atoms/Reveal';

const useStyles = makeStyles(({ colors }) => ({
  aiRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  aiContent: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  aiBubble: {
    maxWidth: '92%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: colors.surface2,
  },
  // paddingRight 2: bubble selebar isi; tanpa sedikit ruang ekstra, pembulatan lebar teks di
  // Android kadang melempar kata terakhir ke baris kedua yang lalu terpotong ("…pakai Gopay").
  bubbleText: { lineHeight: 20, paddingRight: 2 },
  userWrap: { alignItems: 'flex-end', gap: 6, paddingLeft: 40 },
  userBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: colors.primary,
  },
  failed: { opacity: 0.7 },
  failedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  typing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.lg,
    paddingVertical: 15,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: colors.surface2,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.text3 },
}));

/** Setiap entri chat muncul dengan naik lembut yang sama. */
export function ChatEntry({ children }: { children: ReactNode }) {
  return <Reveal>{children}</Reveal>;
}

/** Kolom avatar AI + isinya (bubble, kartu, atau banner). */
export function AiRow({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.aiRow}>
      <AiMark size="xs" />
      <View style={styles.aiContent}>{children}</View>
    </View>
  );
}

export function AiBubble({ text }: { text: string }) {
  const styles = useStyles();
  return (
    <View style={styles.aiBubble}>
      <Typography variant="body" style={styles.bubbleText}>
        {text}
      </Typography>
    </View>
  );
}

export function UserBubble({
  text,
  failed,
}: {
  text: string;
  failed?: boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={styles.userWrap}>
      <View style={[styles.userBubble, failed && styles.failed]}>
        <Typography
          variant="body"
          tone="inverse"
          style={[styles.bubbleText, { color: colors.primaryFg }]}
        >
          {text}
        </Typography>
      </View>
      {failed && (
        <View style={styles.failedRow}>
          <CircleAlert size={14} color={colors.expenseText} />
          <Typography variant="captionMedium" tone="expense">
            {t('assistant.sendFailed')}
          </Typography>
        </View>
      )}
    </View>
  );
}

/** Tiga titik "mengetik" selagi menunggu balasan AI. */
export function TypingBubble() {
  const styles = useStyles();
  return (
    <AiRow>
      <View style={styles.typing}>
        {[0, 150, 300].map(delay => (
          <MotiView
            key={delay}
            from={{ opacity: 0.3, translateY: 0 }}
            animate={{ opacity: 1, translateY: -3 }}
            transition={withDelay(transitions.pulse, delay)}
            style={styles.dot}
          />
        ))}
      </View>
    </AiRow>
  );
}
