import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { MotiView } from 'moti';
import { SafeAreaView } from 'react-native-safe-area-context';
import Gradient from '@/components/atoms/Gradient';
import LogoMark from '@/components/atoms/LogoMark';
import Typography from '@/components/atoms/Typography';
import { colors } from '@/theme/colors';
import { layout, radius, spacing } from '@/theme/metrics';
import { fadeInUp } from '@/utils/motion';

export interface AuthLayoutProps {
  appName: string;
  /** Headline besar di header gradien. */
  headline: string;
  /** Judul + subjudul form di sheet. */
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Baris di bawah tombol submit, misalnya tautan ke Register/Login. */
  footer?: ReactNode;
  /** Elemen di dasar sheet, misalnya pemilih bahasa. */
  bottom?: ReactNode;
}

/** Layar Login/Register HP (DESIGN_SYSTEM.md §5.6): header gradien + sheet form sudut 32. */
export default function AuthLayout({
  appName,
  headline,
  title,
  subtitle,
  children,
  footer,
  bottom,
}: AuthLayoutProps) {
  return (
    <View style={styles.root}>
      <Gradient />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.brand}>
                <LogoMark />
                <Typography variant="wordmark" tone="hero">
                  {appName}
                </Typography>
              </View>
              <Typography variant="headline" tone="hero">
                {headline}
              </Typography>
            </View>

            <MotiView {...fadeInUp} style={styles.sheet}>
              <View style={styles.form}>
                <View style={styles.head}>
                  <Typography variant="headline">{title}</Typography>
                  <Typography tone="muted">{subtitle}</Typography>
                </View>
                {children}
                {!!footer && <View style={styles.footer}>{footer}</View>}
              </View>
              {!!bottom && <View style={styles.bottom}>{bottom}</View>}
            </MotiView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.heroBg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: {
    gap: 22,
    paddingTop: 18,
    paddingHorizontal: layout.heroGutter,
    paddingBottom: 28,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
});
