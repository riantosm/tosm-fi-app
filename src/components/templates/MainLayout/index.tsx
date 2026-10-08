import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconButton from '@/components/atoms/IconButton';
import LogoMark from '@/components/atoms/LogoMark';
import Typography from '@/components/atoms/Typography';
import { colors } from '@/theme/colors';
import { layout, spacing } from '@/theme/metrics';

export interface MainLayoutProps {
  title: string;
  /** Subjudul halaman (Inter 13, text3) di awal konten. */
  subtitle?: string;
  /** Ada → tombol kembali (sub-halaman). Tidak ada → LogoMark (halaman menu/tab). */
  onBack?: () => void;
  backLabel?: string;
  /** Aksi kanan app bar, biasanya 1–3 IconButton 38 varian `surface`. */
  headerRight?: ReactNode;
  /** Beri ruang bawah untuk bottom nav mengambang. */
  withTabBar?: boolean;
  children: ReactNode;
}

/** Kerangka layar HP (DESIGN_SYSTEM.md §5.1, §5.3): app bar 64 + konten scroll. */
export default function MainLayout({
  title,
  subtitle,
  onBack,
  backLabel,
  headerRight,
  withTabBar = false,
  children,
}: MainLayoutProps) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <View style={styles.appBar}>
        <View style={styles.leading}>
          {onBack ? (
            <IconButton
              label={backLabel ?? ''}
              onPress={onBack}
              renderIcon={(color, size) => (
                <ChevronLeft size={size + 2} color={color} />
              )}
            />
          ) : (
            <LogoMark />
          )}
          <Typography
            variant="pageTitle"
            numberOfLines={1}
            style={styles.title}
          >
            {title}
          </Typography>
        </View>
        {!!headerRight && <View style={styles.actions}>{headerRight}</View>}
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          withTabBar && styles.contentWithTabBar,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!!subtitle && (
          <Typography variant="secondary" tone="subtle">
            {subtitle}
          </Typography>
        )}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  appBar: {
    height: layout.appBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: layout.gutter,
  },
  leading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: { flexShrink: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  content: {
    flexGrow: 1,
    gap: spacing.lg,
    paddingHorizontal: layout.gutter,
    paddingBottom: spacing.xxl,
  },
  contentWithTabBar: { paddingBottom: layout.bottomNavSpace },
});
