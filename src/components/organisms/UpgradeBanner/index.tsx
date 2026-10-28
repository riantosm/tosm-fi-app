import { View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import AiMark from '@/components/atoms/AiMark';
import Button from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { formatRupiah, PRO_LIFETIME_PRICE } from '@/constants/plans';
import { useUpgrade } from '@/contexts/UpgradeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';

const useStyles = makeStyles(({ colors }) => ({
  root: {
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.card,
    backgroundColor: colors.primarySoft,
  },
  text: { gap: spacing.xs },
}));

/** "Upgrade ke Pro" untuk akun Free (sama dengan UpgradeBanner web); Pro tidak merender apa pun. */
export default function UpgradeBanner() {
  const styles = useStyles();
  const { t } = useTranslation();
  const { isPro, info, openUpgrade } = useUpgrade();

  if (isPro) {
    return null;
  }

  return (
    <View style={styles.root}>
      <AiMark size="lg" />
      <View style={styles.text}>
        <Typography variant="cardTitle" tone="hero">
          {t('plan.bannerTitle')}
        </Typography>
        <Typography variant="secondary" tone="muted">
          {t('plan.bannerBody', {
            price: formatRupiah(info?.proLifetimePrice ?? PRO_LIFETIME_PRICE),
          })}
        </Typography>
      </View>
      <Button
        label={t('plan.upgradeCta')}
        renderIcon={color => <ArrowRight size={18} color={color} />}
        onPress={() => openUpgrade()}
      />
    </View>
  );
}
