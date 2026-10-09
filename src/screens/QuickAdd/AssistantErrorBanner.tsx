import { View } from 'react-native';
import { Hourglass, Plus, RotateCw, WifiOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { AssistantErrorKind } from '@/types';

const useStyles = makeStyles(({ colors }) => ({
  wrap: { alignSelf: 'stretch', gap: 10 },
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
    borderRadius: radius.field,
  },
  quota: { backgroundColor: colors.investmentSoft },
  network: { backgroundColor: colors.expenseSoft },
  icon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  texts: { flex: 1, gap: 2 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
}));

/** Banner kuota penuh (amber) / koneksi gagal (merah) + aksi pemulihan. */
export default function AssistantErrorBanner({
  error,
  onRetry,
  onManualEntry,
  isBusy,
}: {
  error: AssistantErrorKind;
  onRetry: () => void;
  onManualEntry: () => void;
  isBusy?: boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const isQuota = error === 'quota';
  const accent = isQuota ? colors.investmentText : colors.expenseText;

  return (
    <View style={styles.wrap}>
      <View style={[styles.box, isQuota ? styles.quota : styles.network]}>
        <View style={styles.icon}>
          {isQuota ? (
            <Hourglass size={16} color={accent} />
          ) : (
            <WifiOff size={16} color={accent} />
          )}
        </View>
        <View style={styles.texts}>
          <Typography variant="label" style={{ color: accent }}>
            {isQuota ? t('assistant.quotaTitle') : t('assistant.networkTitle')}
          </Typography>
          <Typography variant="secondary" tone="muted">
            {isQuota ? t('assistant.quotaBody') : t('assistant.networkBody')}
          </Typography>
        </View>
      </View>
      <View style={styles.actions}>
        <Button
          size="sm"
          label={t('assistant.retry')}
          disabled={isBusy}
          onPress={onRetry}
          renderIcon={color => <RotateCw size={16} color={color} />}
        />
        {isQuota && (
          <Button
            size="sm"
            variant="outline"
            label={t('assistant.manualEntry')}
            onPress={onManualEntry}
            renderIcon={color => <Plus size={16} color={color} />}
          />
        )}
      </View>
    </View>
  );
}
