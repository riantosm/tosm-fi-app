import { Component, type ErrorInfo, type ReactNode } from 'react';
import { View } from 'react-native';
import { CloudAlert, RefreshCw } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';
import { logCrash } from '@/utils/crashLogger';

const useStyles = makeStyles(({ colors, shadows }) => ({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: 36,
    paddingHorizontal: spacing.xl,
    borderRadius: 28,
    backgroundColor: colors.surface,
    ...shadows.pop,
  },
  halo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.expenseSoft,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  button: { alignSelf: 'stretch', marginTop: spacing.sm },
}));

/** Tampilan "Ups, terjadi kesalahan" (sama dengan ErrorBoundary web). */
function CrashFallback({ onRetry }: { onRetry: () => void }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <View style={styles.halo}>
          <View style={styles.icon}>
            <CloudAlert size={22} color={colors.expenseText} />
          </View>
        </View>
        <Typography variant="headline" align="center">
          {t('errorBoundary.title')}
        </Typography>
        <Typography variant="secondary" tone="muted" align="center">
          {t('errorBoundary.description')}
        </Typography>
        <Button
          label={t('errorBoundary.retryButton')}
          renderIcon={color => <RefreshCw size={18} color={color} />}
          onPress={onRetry}
          style={styles.button}
        />
      </View>
    </View>
  );
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Menangkap crash saat render, melaporkannya ke Log Error, dan menampilkan tombol Coba Lagi. */
export default class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logCrash('render', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.error) {
      return <CrashFallback onRetry={() => this.setState({ error: null })} />;
    }
    return this.props.children;
  }
}
