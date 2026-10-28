import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, View } from 'react-native';
import { CreditCard, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import Button from '@/components/atoms/Button';
import IconButton from '@/components/atoms/IconButton';
import Typography from '@/components/atoms/Typography';
import EmptyState from '@/components/molecules/EmptyState';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useUpgrade } from '@/contexts/UpgradeContext';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import {
  checkoutProApi,
  getPaymentOrderStatusApi,
} from '@/services/api/plan.service';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';
import type { PaymentStatus, ProCheckout } from '@/types';

// Snap tidak memberi callback ke app, jadi order dicek berkala selama WebView terbuka.
const POLL_INTERVAL_MS = 3000;

const useStyles = makeStyles(({ colors }) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { flex: 1 },
  web: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
}));

/**
 * Bayar Pro Lifetime: halaman Snap Midtrans (redirectUrl dari checkout) di WebView. Link
 * aplikasi e-wallet (gojek://, shopeeid://, intent://) dibuka di luar; order dicek berkala
 * ke backend, yang menarik status dari Midtrans, sampai lunas.
 */
export default function ProCheckoutScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.PRO_CHECKOUT>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const showToast = useToast();
  const { refreshPlan } = useUpgrade();
  const [checkout, setCheckout] = useState<ProCheckout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const finished = useRef(false);

  const start = useCallback(() => {
    setError(null);
    checkoutProApi()
      .then(setCheckout)
      .catch(err =>
        setError(err instanceof Error ? err.message : t('plan.checkoutError')),
      );
  }, [t]);

  useEffect(start, [start]);

  const finish = useCallback(
    async (status: PaymentStatus) => {
      if (finished.current) {
        return;
      }
      finished.current = true;
      if (status === 'paid') {
        await refreshPlan().catch(() => {});
        showToast(t('plan.paymentSuccess'), 'success', 3000);
      } else {
        showToast(t('plan.paymentFailed'), 'error');
      }
      navigation.goBack();
    },
    [navigation, refreshPlan, showToast, t],
  );

  useEffect(() => {
    if (!checkout) {
      return;
    }
    const timer = setInterval(() => {
      getPaymentOrderStatusApi(checkout.orderId)
        .then(({ status }) => {
          if (status !== 'pending') {
            finish(status);
          }
        })
        .catch(() => {});
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [checkout, finish]);

  const close = async () => {
    // Pembayaran bisa saja baru lunas tepat sebelum ditutup.
    if (checkout) {
      const { status } = await getPaymentOrderStatusApi(checkout.orderId).catch(
        () => ({ status: 'pending' as PaymentStatus }),
      );
      if (status === 'paid') {
        finish(status);
        return;
      }
    }
    finished.current = true;
    navigation.goBack();
  };

  const openOutside = (request: ShouldStartLoadRequest | WebViewNavigation) => {
    const { url } = request;
    if (/^https?:\/\//i.test(url) || url.startsWith('about:')) {
      return true;
    }
    // intent://…#Intent;scheme=gojek;…;S.browser_fallback_url=…;end (Android)
    const fallback = /S\.browser_fallback_url=([^;]+)/.exec(url)?.[1];
    Linking.openURL(url).catch(() => {
      if (fallback) {
        Linking.openURL(decodeURIComponent(fallback)).catch(() => {});
      }
    });
    return false;
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Typography variant="cardTitle" style={styles.title}>
          {t('plan.checkoutTitle')}
        </Typography>
        <IconButton
          label={t('common.close')}
          variant="surface"
          renderIcon={(color, size) => <X size={size} color={color} />}
          onPress={close}
        />
      </View>
      {error ? (
        <View style={styles.center}>
          <EmptyState
            icon={<CreditCard size={24} color={colors.expenseText} />}
            title={t('plan.checkoutError')}
            description={error}
            action={<Button label={t('plan.retry')} onPress={start} />}
          />
        </View>
      ) : checkout ? (
        <WebView
          style={styles.web}
          source={{ uri: checkout.redirectUrl }}
          originWhitelist={['*']}
          onShouldStartLoadWithRequest={openOutside}
          setSupportMultipleWindows={false}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
        />
      ) : (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
    </View>
  );
}
