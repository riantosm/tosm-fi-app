import { View } from 'react-native';
import { EllipsisVertical } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import CategoryIcon from '@/components/atoms/CategoryIcon';
import IconButton from '@/components/atoms/IconButton';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import SubCategoryPills from '@/screens/Categories/SubCategoryPills';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';
import type { Category, SubCategory } from '@/types';

export interface CategoryCardProps {
  category: Category;
  onEdit: () => void;
  onMore: () => void;
  onEditSubCategory: (sub: SubCategory) => void;
  onAddSubCategory: () => void;
}

const useStyles = makeStyles(() => ({
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  texts: { flex: 1, gap: spacing.xs },
  name: { fontSize: 15 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
}));

/** Kartu kategori (pen `auPuW`): ikon, nama, jenis + jumlah transaksi, menu ⋮, pill subkategori. */
export default function CategoryCard({
  category,
  onEdit,
  onMore,
  onEditSubCategory,
  onAddSubCategory,
}: CategoryCardProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const isIncome = category.type === 'income';

  return (
    <Card>
      <View style={styles.head}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`${t('category.editTitle')}: ${
            category.nameCategory
          }`}
          scaleTo={0.98}
          onPress={onEdit}
          style={styles.identity}
        >
          <CategoryIcon icon={category.icon} color={category.color} />
          <View style={styles.texts}>
            <Typography variant="label" numberOfLines={1} style={styles.name}>
              {category.nameCategory}
            </Typography>
            <View style={styles.meta}>
              <Badge
                tone={isIncome ? 'income' : 'expense'}
                label={t(isIncome ? 'category.income' : 'category.expense')}
              />
              <Typography variant="meta" tone="subtle" numberOfLines={1}>
                {t('category.trxShort', { count: category.transactionCount })}
              </Typography>
            </View>
          </View>
        </PressableScale>
        <IconButton
          variant="ghost"
          size={34}
          label={t('common.more')}
          onPress={onMore}
          renderIcon={(color, size) => (
            <EllipsisVertical size={size} color={color} />
          )}
        />
      </View>
      <SubCategoryPills
        category={category}
        onEditSubCategory={onEditSubCategory}
        onAddSubCategory={onAddSubCategory}
        onShowAll={onEdit}
      />
    </Card>
  );
}
