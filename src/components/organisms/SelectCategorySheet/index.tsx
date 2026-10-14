import { useState } from 'react';
import { View } from 'react-native';
import { Plus, SearchX } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import EmptyState from '@/components/molecules/EmptyState';
import SearchField from '@/components/molecules/SearchField';
import BottomSheet from '@/components/organisms/BottomSheet';
import CategoryFormSheet from '@/components/organisms/CategoryFormSheet';
import { resolveCategoryIcon } from '@/constants/categoryIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useCategories } from '@/hooks/useCategories';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { Category, CategoryType } from '@/types';

export interface SelectCategorySheetProps {
  visible: boolean;
  type: CategoryType;
  categories: Category[];
  selectedId?: string | null;
  onSelect: (category: Category) => void;
  onClose: () => void;
}

const useStyles = makeStyles(({ colors }) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.sm },
  cell: {
    width: '25%',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: 2,
    borderRadius: radius.control,
  },
  cellSelected: { backgroundColor: colors.primarySoft },
  icon: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newIcon: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
}));

/**
 * Pilih kategori (pen `DSIav`): cari + grid 4 kolom ikon bulat, diakhiri tile "Baru" yang
 * membuka form kategori; kategori baru langsung terpilih.
 */
export default function SelectCategorySheet({
  visible,
  type,
  categories,
  selectedId,
  onSelect,
  onClose,
}: SelectCategorySheetProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const showToast = useToast();
  const { createCategory } = useCategories({ autoLoad: false });
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const normalized = query.trim().toLowerCase();
  const filtered = categories.filter(
    category =>
      category.type === type &&
      (!normalized ||
        category.nameCategory.toLowerCase().includes(normalized) ||
        category.subCategories.some(sub =>
          sub.nameSubCategory.toLowerCase().includes(normalized),
        )),
  );

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <>
      <BottomSheet
        visible={visible}
        title={t('transaction.selectCategoryTitle')}
        subtitle={t(
          type === 'income'
            ? 'transaction.incomeCategories'
            : 'transaction.expenseCategories',
        )}
        closeLabel={t('common.close')}
        onClose={close}
      >
        <SearchField
          variant="filled"
          value={query}
          onChangeText={setQuery}
          placeholder={t('transaction.searchCategory')}
          clearLabel={t('common.close')}
        />
        {filtered.length === 0 && normalized ? (
          <EmptyState
            variant="inset"
            icon={<SearchX size={18} color={colors.text2} />}
            title={t('transaction.noCategoryMatch')}
          />
        ) : (
          <View style={styles.grid}>
            {filtered.map(category => {
              const selected = category.idCategory === selectedId;
              const Icon = resolveCategoryIcon(category.icon);
              return (
                <PressableScale
                  key={category.idCategory}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    setQuery('');
                    onSelect(category);
                  }}
                  style={[styles.cell, selected && styles.cellSelected]}
                >
                  <View
                    style={[
                      styles.icon,
                      { backgroundColor: `${category.color}26` },
                    ]}
                  >
                    <Icon size={22} color={category.color} />
                  </View>
                  <Typography
                    variant={selected ? 'tileLabel' : 'metaMedium'}
                    tone={selected ? 'primary' : 'muted'}
                    align="center"
                    numberOfLines={1}
                  >
                    {category.nameCategory}
                  </Typography>
                </PressableScale>
              );
            })}
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={t('category.addTitle')}
              onPress={() => setCreating(true)}
              style={styles.cell}
            >
              <View style={[styles.icon, styles.newIcon]}>
                <Plus size={22} color={colors.text2} />
              </View>
              <Typography
                variant="metaMedium"
                tone="muted"
                align="center"
                numberOfLines={1}
              >
                {t('transaction.newCategoryShort')}
              </Typography>
            </PressableScale>
          </View>
        )}
      </BottomSheet>
      <CategoryFormSheet
        visible={creating}
        defaultType={type}
        onClose={() => setCreating(false)}
        onSubmit={async input => {
          try {
            const created = await createCategory(input);
            setCreating(false);
            setQuery('');
            onSelect(created);
          } catch (error) {
            showToast(
              error instanceof Error
                ? error.message
                : t('category.genericError'),
              'error',
            );
          }
        }}
      />
    </>
  );
}
