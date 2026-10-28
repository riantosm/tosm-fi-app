import { View } from 'react-native';
import { Check, CircleCheck, FlaskConical, Lock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Gradient from '@/components/atoms/Gradient';
import Typography from '@/components/atoms/Typography';
import BottomSheet from '@/components/organisms/BottomSheet';
import {
  formatRupiah,
  PLAN_LIMITS,
  PRO_LIFETIME_LIST_PRICE,
} from '@/constants/plans';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { PlanFeature, PlanLimits } from '@/types';

// Batas Free yang disebut di baris "kenapa sheet ini muncul", per fitur.
const REASON_LIMIT: Partial<Record<PlanFeature, keyof PlanLimits>> = {
  wallets: 'wallets',
  categories: 'categories',
  budgets: 'budgets',
  schedules: 'schedules',
  instruments: 'instruments',
  aiMessages: 'aiMessagesPerMonth',
};

const BENEFITS = [
  'wallets',
  'budgets',
  'investment',
  'reports',
  'export',
  'ai',
] as const;

const useStyles = makeStyles(({ colors }) => ({
  body: { gap: spacing.lg },
  reason: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderRadius: radius.field,
    backgroundColor: colors.investmentSoft,
  },
  reasonText: { flex: 1 },
  price: {
    gap: spacing.xs,
    padding: spacing.xl,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  priceNote: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  strike: { textDecorationLine: 'line-through' },
  benefits: { gap: spacing.md },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  check: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  benefitText: { flex: 1 },
  sandbox: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderRadius: radius.field,
    backgroundColor: colors.surface2,
  },
  footerButton: { flex: 1 },
  pro: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  proIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.incomeSoft,
  },
  center: { textAlign: 'center' },
}));

export interface UpgradeSheetProps {
  visible: boolean;
  isPro: boolean;
  /** Fitur yang barusan dicoba; tampil sebagai alasan sheet muncul. */
  feature: PlanFeature | null;
  limits: PlanLimits;
  price: number;
  /** Midtrans sandbox: tampilkan catatan "tidak ada uang yang ditagih". */
  isSandbox: boolean;
  onPay: () => void;
  onClose: () => void;
}

/** Upgrade ke Pro (sama dengan UpgradeModal web): harga sekali bayar + manfaat + tombol bayar. */
export default function UpgradeSheet({
  visible,
  isPro,
  feature,
  limits,
  price,
  isSandbox,
  onPay,
  onClose,
}: UpgradeSheetProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const reasonKey = feature ? REASON_LIMIT[feature] : undefined;
  const reasonCount = reasonKey ? limits[reasonKey] : null;

  if (isPro) {
    return (
      <BottomSheet
        visible={visible}
        title={t('plan.alreadyProTitle')}
        closeLabel={t('common.close')}
        onClose={onClose}
        scroll={false}
      >
        <View style={styles.pro}>
          <View style={styles.proIcon}>
            <CircleCheck size={28} color={colors.incomeText} />
          </View>
          <Typography variant="body" tone="muted" style={styles.center}>
            {t('plan.alreadyProBody')}
          </Typography>
        </View>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      visible={visible}
      title={t('plan.upgradeTitle')}
      subtitle={t('plan.upgradeSubtitle')}
      closeLabel={t('common.close')}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="outline"
            size="lg"
            label={t('plan.later')}
            onPress={onClose}
            style={styles.footerButton}
          />
          <Button
            size="lg"
            label={t('plan.payButton', { price: formatRupiah(price) })}
            onPress={onPay}
            style={styles.footerButton}
          />
        </>
      }
    >
      <View style={styles.body}>
        {feature && (
          <View style={styles.reason}>
            <Lock size={16} color={colors.investmentText} />
            <Typography
              variant="secondary"
              tone="investment"
              style={styles.reasonText}
            >
              {t(`plan.reason.${feature}`, {
                count: typeof reasonCount === 'number' ? reasonCount : 0,
              })}
            </Typography>
          </View>
        )}

        <View style={styles.price}>
          <Gradient />
          <Typography variant="eyebrow" tone="heroMuted">
            {t('plan.proLifetime')}
          </Typography>
          <View style={styles.priceRow}>
            <Typography variant="headline" tone="hero">
              {formatRupiah(price)}
            </Typography>
            <Typography variant="secondary" tone="heroMuted">
              {t('plan.perOnce')}
            </Typography>
          </View>
          <View style={styles.priceNote}>
            <Typography variant="meta" tone="heroMuted" style={styles.strike}>
              {formatRupiah(PRO_LIFETIME_LIST_PRICE)}
            </Typography>
            <Typography variant="meta" tone="income">
              {t('plan.lifetimeAccess')}
            </Typography>
          </View>
        </View>

        <View style={styles.benefits}>
          {BENEFITS.map(key => (
            <View key={key} style={styles.benefit}>
              <View style={styles.check}>
                <Check size={13} color={colors.primaryText} />
              </View>
              <Typography variant="body" style={styles.benefitText}>
                {t(`plan.benefit.${key}`, {
                  count: PLAN_LIMITS.pro.aiMessagesPerMonth ?? 0,
                })}
              </Typography>
            </View>
          ))}
        </View>

        {isSandbox && (
          <View style={styles.sandbox}>
            <FlaskConical size={16} color={colors.primaryText} />
            <Typography variant="meta" tone="muted" style={styles.reasonText}>
              {t('plan.sandboxNotice')}
            </Typography>
          </View>
        )}
      </View>
    </BottomSheet>
  );
}
