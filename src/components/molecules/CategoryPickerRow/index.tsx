import { View } from 'react-native';
import { ChevronRight, Tag } from 'lucide-react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { resolveCategoryIcon } from '@/constants/categoryIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { Category, SubCategory } from '@/types';

export interface CategoryPickerRowProps {
  category: Category | null;
  subCategory?: SubCategory | null;
  placeholder: string;
  onPress: () => void;
}

const useStyles = makeStyles(({ colors }) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  tile: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  texts: { flex: 1, gap: 1 },
}));

/** Pemicu kategori + subkategori di kepala AmountCard. */
export default function CategoryPickerRow({
  category,
  subCategory,
  placeholder,
  onPress,
}: CategoryPickerRowProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const Icon = category ? resolveCategoryIcon(category.icon) : Tag;
  return (
    <PressableScale
      accessibilityRole="button"
      scaleTo={0.98}
      onPress={onPress}
      style={styles.row}
    >
      <View
        style={[
          styles.tile,
          category && { backgroundColor: `${category.color}26` },
        ]}
      >
        <Icon size={18} color={category ? category.color : colors.text3} />
      </View>
      <View style={styles.texts}>
        <Typography
          variant="label"
          tone={category ? 'default' : 'muted'}
          numberOfLines={1}
        >
          {category ? category.nameCategory : placeholder}
        </Typography>
        {!!subCategory && (
          <Typography variant="meta" tone="subtle" numberOfLines={1}>
            {subCategory.nameSubCategory}
          </Typography>
        )}
      </View>
      <ChevronRight size={18} color={colors.text3} />
    </PressableScale>
  );
}
