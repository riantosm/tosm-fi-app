import { useState } from 'react';
import { View } from 'react-native';
import { Check, Minus, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import BottomSheet from '@/components/organisms/BottomSheet';
import SubCategoryFormSheet from '@/components/organisms/SubCategoryFormSheet';
import { resolveCategoryIcon } from '@/constants/categoryIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useCategories } from '@/hooks/useCategories';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { Category, SubCategory } from '@/types';

export interface SelectSubCategorySheetProps {
  visible: boolean;
  category: Category | null;
  selectedId: string | null;
  /** `null` = tanpa subkategori. */
  onSelect: (sub: SubCategory | null) => void;
  onBack: () => void;
  onClose: () => void;
}

const useStyles = makeStyles(({ colors }) => ({
  list: { gap: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.control,
  },
  rowSelected: { backgroundColor: colors.primarySoft },
  icon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1 },
  footerButton: { flex: 1 },
}));

/**
 * Pilih subkategori (pen `c2WsJ`): "Tanpa subkategori" + daftar, tombol kembali ke kategori,
 * dan "Subkategori baru" di footer (subkategori baru langsung terpilih).
 */
export default function SelectSubCategorySheet({
  visible,
  category,
  selectedId,
  onSelect,
  onBack,
  onClose,
}: SelectSubCategorySheetProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const showToast = useToast();
  const { createSubCategory } = useCategories({ autoLoad: false });
  const [creating, setCreating] = useState(false);
  if (!category) {
    return null;
  }

  const rows: { key: string; sub: SubCategory | null }[] = [
    { key: 'none', sub: null },
    ...category.subCategories.map(sub => ({ key: sub.idSubCategory, sub })),
  ];

  return (
    <>
      <BottomSheet
        visible={visible}
        title={category.nameCategory}
        subtitle={t('transaction.selectSubCategoryTitle')}
        onBack={onBack}
        backLabel={t('common.back')}
        closeLabel={t('common.close')}
        onClose={onClose}
        footer={
          <Button
            variant="soft"
            label={t('transaction.newSubCategory')}
            renderIcon={color => <Plus size={18} color={color} />}
            onPress={() => setCreating(true)}
            style={styles.footerButton}
          />
        }
      >
        <View style={styles.list}>
          {rows.map(({ key, sub }) => {
            const selected = (sub?.idSubCategory ?? null) === selectedId;
            const Icon = sub ? resolveCategoryIcon(sub.icon) : Minus;
            return (
              <PressableScale
                key={key}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                scaleTo={0.98}
                onPress={() => onSelect(sub)}
                style={[styles.row, selected && styles.rowSelected]}
              >
                <View
                  style={[
                    styles.icon,
                    {
                      backgroundColor: sub
                        ? `${category.color}26`
                        : colors.surface2,
                    },
                  ]}
                >
                  <Icon size={16} color={sub ? category.color : colors.text3} />
                </View>
                <Typography
                  variant={selected ? 'label' : 'body'}
                  tone={selected ? 'primary' : 'default'}
                  numberOfLines={1}
                  style={styles.label}
                >
                  {sub ? sub.nameSubCategory : t('transaction.noSubCategory')}
                </Typography>
                {selected && <Check size={18} color={colors.primaryText} />}
              </PressableScale>
            );
          })}
        </View>
      </BottomSheet>
      <SubCategoryFormSheet
        visible={creating}
        categoryName={category.nameCategory}
        categoryColor={category.color}
        onClose={() => setCreating(false)}
        onSubmit={async input => {
          try {
            const created = await createSubCategory(category.idCategory, input);
            setCreating(false);
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
