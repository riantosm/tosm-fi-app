import { useState } from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';
import { Wallet } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Skeleton from '@/components/atoms/Skeleton';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import EmptyState from '@/components/molecules/EmptyState';
import SectionHead from '@/components/molecules/SectionHead';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { WalletUsageItem } from '@/types';
import { transitions } from '@/utils/motion';
import Reveal from '@/components/atoms/Reveal';

const useStyles = makeStyles(({ colors }) => ({
  list: { gap: spacing.md },
  item: {
    gap: 10,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderRadius: radius.control,
    backgroundColor: colors.surface2,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: radius.pill },
  name: { flex: 1 },
  foot: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  count: { width: 92 },
  track: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  fill: { height: '100%', borderRadius: radius.pill },
  dim: { opacity: 0.6 },
}));

function UsageBar({
  color,
  percentage,
}: {
  color: string;
  percentage: number;
}) {
  const styles = useStyles();
  const [width, setWidth] = useState(0);
  return (
    <View
      style={styles.track}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
    >
      {width > 0 && (
        <MotiView
          from={{ width: 0 }}
          animate={{ width: (width * Math.min(100, percentage)) / 100 }}
          transition={transitions.grow}
          style={[styles.fill, { backgroundColor: color }]}
        />
      )}
    </View>
  );
}

export interface WalletUsageCardProps {
  items: WalletUsageItem[];
  isLoading: boolean;
}

/** "Dompet Paling Aktif": dompet diurutkan dari jumlah transaksi periode ini. */
export default function WalletUsageCard({
  items,
  isLoading,
}: WalletUsageCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Card>
      <SectionHead
        eyebrow={t('reports.eyebrow.walletUsage')}
        title={t('reports.walletUsage.title')}
      />
      {isLoading && items.length === 0 ? (
        <View style={styles.list}>
          {[0, 1, 2].map(index => (
            <Skeleton key={index} height={70} radius={radius.control} />
          ))}
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          variant="inset"
          icon={<Wallet size={18} color={colors.text2} />}
          title={t('reports.walletUsage.empty')}
        />
      ) : (
        <View style={[styles.list, isLoading && styles.dim]}>
          {items.map((item, index) => (
            <Reveal delay={index * 40} key={item.idWallet} style={styles.item}>
              <View style={styles.head}>
                <View style={[styles.dot, { backgroundColor: item.color }]} />
                <Typography
                  variant="label"
                  numberOfLines={1}
                  style={styles.name}
                >
                  {item.nameWallet}
                </Typography>
                <Typography variant="label" tabular>
                  {Math.round(item.percentage)}%
                </Typography>
              </View>
              <View style={styles.foot}>
                <Typography
                  variant="caption"
                  tone="subtle"
                  numberOfLines={1}
                  style={styles.count}
                >
                  {t('reports.walletUsage.transactionCount', {
                    count: item.transactionCount,
                  })}
                </Typography>
                <UsageBar color={item.color} percentage={item.percentage} />
              </View>
            </Reveal>
          ))}
        </View>
      )}
    </Card>
  );
}
