import { View } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Skeleton from '@/components/atoms/Skeleton';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import EmptyState from '@/components/molecules/EmptyState';
import SectionHead from '@/components/molecules/SectionHead';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/hooks/useLanguage';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { TopSpendingItem } from '@/types';
import { formatDayMonth } from '@/utils/calendar';
import { toIntlLocale } from '@/utils/locale';
import { MINUS } from '@/utils/money';
import Reveal from '@/components/atoms/Reveal';

const useStyles = makeStyles(({ colors }) => ({
  list: { gap: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 6,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
  },
  texts: { flex: 1, gap: 1 },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  skeletonTexts: { flex: 1, gap: 6 },
  dim: { opacity: 0.6 },
}));

function RankBadge({ rank }: { rank: number }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const medal =
    rank === 1
      ? colors.investment
      : rank === 2
      ? colors.medalSilver
      : rank === 3
      ? colors.medalBronze
      : undefined;
  return (
    <View style={[styles.badge, !!medal && { backgroundColor: medal }]}>
      {medal ? (
        <Trophy size={16} color={colors.onData} />
      ) : (
        <Typography variant="captionStrong" tone="subtle" tabular>
          {rank}
        </Typography>
      )}
    </View>
  );
}

export interface TopSpendingCardProps {
  items: TopSpendingItem[];
  isLoading: boolean;
}

/** "Top Pengeluaran": 10 pengeluaran terbesar periode ini, medali untuk 3 teratas. */
export default function TopSpendingCard({
  items,
  isLoading,
}: TopSpendingCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { formatNumber } = useMoneyFormat();
  const locale = toIntlLocale(language);

  return (
    <Card>
      <SectionHead
        eyebrow={t('reports.eyebrow.topSpending')}
        title={t('reports.topSpending.title')}
      />
      {isLoading && items.length === 0 ? (
        <View style={styles.list}>
          {[0, 1, 2, 3, 4].map(index => (
            <View key={index} style={styles.skeletonRow}>
              <Skeleton width={32} height={32} radius={radius.pill} />
              <View style={styles.skeletonTexts}>
                <Skeleton width="60%" height={14} radius={radius.pill} />
                <Skeleton width="40%" height={12} radius={radius.pill} />
              </View>
              <Skeleton width={64} height={14} radius={radius.pill} />
            </View>
          ))}
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          variant="inset"
          icon={<Trophy size={18} color={colors.text2} />}
          title={t('reports.topSpending.empty')}
        />
      ) : (
        <View style={[styles.list, isLoading && styles.dim]}>
          {items.map((item, index) => (
            <Reveal
              delay={index * 30}
              key={item.idTransaction}
              style={styles.row}
            >
              <RankBadge rank={item.rank} />
              <View style={styles.texts}>
                <Typography variant="label" numberOfLines={1}>
                  {item.title}
                </Typography>
                <Typography variant="caption" tone="subtle" numberOfLines={1}>
                  {formatDayMonth(new Date(item.date), locale)} ·{' '}
                  {item.subCategoryName
                    ? `${item.categoryName} · ${item.subCategoryName}`
                    : item.categoryName}
                </Typography>
              </View>
              <Typography variant="num" tone="expense" tabular>
                {MINUS}
                {formatNumber(item.amount)}
              </Typography>
            </Reveal>
          ))}
        </View>
      )}
    </Card>
  );
}
