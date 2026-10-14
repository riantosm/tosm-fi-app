import { useRef, type ComponentRef, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Gradient from '@/components/atoms/Gradient';
import LogoMark from '@/components/atoms/LogoMark';
import Typography from '@/components/atoms/Typography';
import { makeStyles } from '@/theme/makeStyles';
import { layout, radius, spacing } from '@/theme/metrics';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useRevealFocusedInput } from '@/hooks/useRevealFocusedInput';
import Reveal from '@/components/atoms/Reveal';

export interface AuthLayoutProps {
  appName: string;
  /** Headline besar di header gradien. */
  headline: string;
  /** Judul + subjudul form di sheet. */
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Aksi kanan header (tombol tema). */
  headerRight?: ReactNode;
  /** Baris di bawah tombol submit, misalnya tautan ke Register/Login. */
  footer?: ReactNode;
  /** Elemen di dasar sheet, misalnya pemilih bahasa. */
  bottom?: ReactNode;
}

const useStyles = makeStyles(({ colors }) => ({
  root: { flex: 1, backgroundColor: colors.heroBg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: {
    gap: 22,
    paddingTop: 18,
    paddingHorizontal: layout.heroGutter,
    paddingBottom: 28,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  // Web HP: headline hero Outfit 600/24; judul form tracking -0.01em.
  headline: { fontSize: 24, lineHeight: 30 },
  title: { letterSpacing: -0.26 },
  sheet: {
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: spacing.xl,
    paddingTop: 28,
    paddingHorizontal: layout.heroGutter,
    paddingBottom: spacing.xxl,
    borderTopLeftRadius: radius.hero,
    borderTopRightRadius: radius.hero,
    backgroundColor: colors.surface,
  },
  form: { gap: 18 },
  head: { gap: spacing.sm },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  bottom: { alignItems: 'center' },
}));

/** Layar Login/Register HP (DESIGN_SYSTEM.md §5.6): header gradien + sheet form sudut 32. */
export default function AuthLayout({
  appName,
  headline,
  title,
  subtitle,
  children,
  headerRight,
  footer,
  bottom,
}: AuthLayoutProps) {
  const styles = useStyles();
  // Android edge-to-edge tidak me-resize window: area scroll dipendekkan setinggi keyboard, lalu
  // input yang fokus digulir ke atas keyboard (iOS: KeyboardAvoidingView).
  const keyboardHeight = useKeyboardHeight();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const offsetRef = useRef(0);
  useRevealFocusedInput(scrollRef, () => offsetRef.current, keyboardHeight);

  return (
    <View style={styles.root}>
      <Gradient />
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[
          styles.flex,
          Platform.OS === 'android' && { paddingBottom: keyboardHeight },
        ]}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            ref={scrollRef}
            onScroll={event => {
              offsetRef.current = event.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={32}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.top}>
                <View style={styles.brand}>
                  <LogoMark />
                  <Typography variant="wordmark" tone="hero">
                    {appName}
                  </Typography>
                </View>
                {headerRight}
              </View>
              <Typography
                variant="pageTitle"
                tone="hero"
                style={styles.headline}
              >
                {headline}
              </Typography>
            </View>

            <Reveal style={styles.sheet}>
              <View style={styles.form}>
                <View style={styles.head}>
                  <Typography variant="headline" style={styles.title}>
                    {title}
                  </Typography>
                  <Typography tone="muted">{subtitle}</Typography>
                </View>
                {children}
                {!!footer && <View style={styles.footer}>{footer}</View>}
              </View>
              {!!bottom && <View style={styles.bottom}>{bottom}</View>}
            </Reveal>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
