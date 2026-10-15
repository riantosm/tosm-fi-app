import type { ReactNode } from 'react';
import { View } from 'react-native';
import { CircleAlert } from 'lucide-react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Gradient from '@/components/atoms/Gradient';
import Reveal from '@/components/atoms/Reveal';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { layout, radius, spacing } from '@/theme/metrics';

export interface PinLayoutProps {
  /** Baris atas (kembali, logo/judul, langkah). */
  header: ReactNode;
  /** Ikon/avatar di atas judul. */
  badge: ReactNode;
  title: string;
  subtitle: string;
  /** Titik PIN. */
  children: ReactNode;
  /** Pill merah di bawah titik (PIN salah / tidak cocok). */
  error?: string;
  /** Keypad di sheet bawah. */
  pad: ReactNode;
  /** Di bawah keypad (lupa PIN, petunjuk). */
  footer?: ReactNode;
}

const useStyles = makeStyles(({ colors, shadows }) => ({
  root: { flex: 1, backgroundColor: colors.heroBg },
  safe: { flex: 1 },
  header: {
    height: layout.appBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: layout.gutter,
  },
  top: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: spacing.xxl,
  },
  title: { marginTop: 18, letterSpacing: -0.5 },
  subtitle: { marginTop: 6, lineHeight: 20 },
  body: { alignItems: 'center', gap: 18, marginTop: 28 },
  // Tinggi pill dicadangkan supaya titik PIN tidak bergeser saat error muncul.
  errorSlot: { minHeight: 34, justifyContent: 'center' },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.expenseSoft,
  },
  sheet: {
    alignItems: 'center',
    gap: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
    borderTopLeftRadius: radius.hero,
    borderTopRightRadius: radius.hero,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
}));

/**
 * Kerangka layar PIN (pen "Kunci aplikasi · PIN", "Buat PIN"): latar gradien hero dengan
 * badge + judul + titik PIN, lalu sheet bawah berisi keypad.
 */
export default function PinLayout({
  header,
  badge,
  title,
  subtitle,
  children,
  error,
  pad,
  footer,
}: PinLayoutProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <Gradient />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
        <View style={styles.header}>{header}</View>
        <Reveal variant="fade" style={styles.top}>
          {badge}
          <Typography
            variant="headline"
            tone="hero"
            align="center"
            style={styles.title}
          >
            {title}
          </Typography>
          <Typography tone="heroMuted" align="center" style={styles.subtitle}>
            {subtitle}
          </Typography>
          <View style={styles.body}>
            {children}
            <View style={styles.errorSlot}>
              {!!error && (
                <Reveal variant="fade" style={styles.error}>
                  <CircleAlert size={15} color={colors.expenseText} />
                  <Typography variant="tileLabel" tone="expense">
                    {error}
                  </Typography>
                </Reveal>
              )}
            </View>
          </View>
        </Reveal>
        <Reveal
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.md },
          ]}
        >
          {pad}
          {footer}
        </Reveal>
      </SafeAreaView>
    </View>
  );
}
