import { useState, type ReactNode, type RefObject } from 'react';
import { RefreshControl, View } from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { ChevronLeft } from 'lucide-react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import IconButton from '@/components/atoms/IconButton';
import LogoMark from '@/components/atoms/LogoMark';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import {
  useRevealFocusedInput,
  type RevealScrollable,
} from '@/hooks/useRevealFocusedInput';
import { makeStyles } from '@/theme/makeStyles';
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
  /**
   * Pengganti app bar (Dashboard): ikut di-scroll dan memanjang ke bawah status bar.
   * Diberi `insetTop` untuk padding atasnya sendiri.
   */
  renderHero?: (insetTop: number) => ReactNode;
  /** Beri ruang bawah untuk bottom nav mengambang. */
  withTabBar?: boolean;
  /** Tarik untuk muat ulang. */
  onRefresh?: () => Promise<unknown> | void;
  /** Dipanggil saat scroll mendekati dasar (infinite scroll). */
  onEndReached?: () => void;
  children: ReactNode;
}

const END_THRESHOLD = 200;

const useStyles = makeStyles(({ colors }) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  appBar: {
    height: layout.appBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: layout.gutter,
  },
  leading: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { flexShrink: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  content: {
    flexGrow: 1,
    gap: spacing.lg,
    paddingHorizontal: layout.gutter,
    paddingBottom: spacing.xxl,
  },
  contentWithHero: { paddingTop: spacing.xl },
  contentWithTabBar: { paddingBottom: layout.bottomNavSpace },
  hero: { marginHorizontal: -layout.gutter, marginTop: -spacing.xl },
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bg,
  },
}));

/** Kerangka layar HP (DESIGN_SYSTEM.md §5.1–§5.3): app bar 64 (atau hero) + konten scroll. */
export default function MainLayout({
  title,
  subtitle,
  onBack,
  backLabel,
  headerRight,
  renderHero,
  withTabBar = false,
  onRefresh,
  onEndReached,
  children,
}: MainLayoutProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setRefreshing(false);
    }
  };

  // Hero memanjang di bawah status bar; begitu discroll, latar status bar muncul (fade)
  // supaya konten tidak terlihat menabrak jam/ikon status.
  const scrollY = useSharedValue(0);
  const notifyEnd = () => onEndReached?.();
  const hasEndHandler = !!onEndReached;
  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
    if (
      hasEndHandler &&
      event.layoutMeasurement.height + event.contentOffset.y >=
        event.contentSize.height - END_THRESHOLD
    ) {
      runOnJS(notifyEnd)();
    }
  });
  // Keyboard: Android edge-to-edge tidak me-resize window, jadi area scroll dipendekkan setinggi
  // keyboard lalu input yang fokus digulir ke atasnya. iOS: padding yang sama dari event keyboard.
  const keyboardHeight = useKeyboardHeight();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  useRevealFocusedInput(
    scrollRef as unknown as RefObject<RevealScrollable | null>,
    () => scrollY.value,
    keyboardHeight,
  );

  const statusBarStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [insets.top, insets.top + 48],
      [0, 1],
      'clamp',
    ),
  }));

  const appBar = (
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
        <Typography variant="pageTitle" numberOfLines={1} style={styles.title}>
          {title}
        </Typography>
      </View>
      {!!headerRight && <View style={styles.actions}>{headerRight}</View>}
    </View>
  );

  return (
    <SafeAreaView
      edges={renderHero ? ['left', 'right'] : ['top', 'left', 'right']}
      style={[
        styles.safe,
        keyboardHeight > 0 && { paddingBottom: keyboardHeight },
      ]}
    >
      {!renderHero && appBar}
      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          !!renderHero && styles.contentWithHero,
          withTabBar && styles.contentWithTabBar,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.surface}
              progressViewOffset={renderHero ? insets.top : 0}
            />
          ) : undefined
        }
      >
        {renderHero && (
          <View style={styles.hero}>{renderHero(insets.top)}</View>
        )}
        {!!subtitle && (
          <Typography variant="secondary" tone="subtle">
            {subtitle}
          </Typography>
        )}
        {children}
      </Animated.ScrollView>
      {renderHero && (
        <Animated.View
          pointerEvents="none"
          style={[styles.statusBar, { height: insets.top }, statusBarStyle]}
        />
      )}
    </SafeAreaView>
  );
}
