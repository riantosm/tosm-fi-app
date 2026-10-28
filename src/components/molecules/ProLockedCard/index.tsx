import { View } from 'react-native';
import { Lock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';

const useStyles = makeStyles(({ colors }) => ({
  body: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  center: { textAlign: 'center' },
}));

export interface ProLockedCardProps {
  eyebrow: string;
  title: string;
  description: string;
  onUpgrade: () => void;
}

/** Pengganti kartu khusus Pro di paket Free (sama dengan ProLockedCard web). */
export default function ProLockedCard({
  eyebrow,
  title,
  description,
  onUpgrade,
}: ProLockedCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Card>
      <Typography variant="eyebrow" tone="subtle">
        {eyebrow}
      </Typography>
      <View style={styles.body}>
        <View style={styles.icon}>
          <Lock size={20} color={colors.primaryText} />
        </View>
        <Typography variant="cardTitle" style={styles.center}>
          {title}
        </Typography>
        <Typography variant="secondary" tone="muted" style={styles.center}>
          {description}
        </Typography>
        <Button size="sm" label={t('plan.upgradeCta')} onPress={onUpgrade} />
      </View>
    </Card>
  );
}
