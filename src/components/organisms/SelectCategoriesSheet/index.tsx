import { useState } from 'react';
import { View } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import { Check, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import CategoryIcon from '@/components/atoms/CategoryIcon';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import BottomSheet from '@/components/organisms/BottomSheet';
import CategoryFormSheet from '@/components/organisms/CategoryFormSheet';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useCategories } from '@/hooks/useCategories';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { Category, CategoryType } from '@/types';
import { transitions } from '@/utils/motion';

export interface SelectCategoriesSheetProps {
  visible: boolean;
  type: CategoryType;
  selectedIds: string[];
  onClose: () => void;
  onConfirm: (categories: Category[]) => void;
}

const useStyles = makeStyles(({ colors }) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', margin: -4 },
  cellWrap: { width: '25%', padding: 4 },
  cell: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: 2,
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: colors.transparent,
    backgroundColor: colors.surface2,
  },
  cellSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  check: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  footerButton: { flex: 1 },
}));

/**
 * Pilih beberapa kategori (pen `Jt53V`) — untuk cakupan budget. Ada "Kategori baru" yang
 * langsung ikut terpilih setelah dibuat.
 */
export default function SelectCategoriesSheet({
  visible,
  type,
  selectedIds,
  onClose,
  onConfirm,
}: SelectCategoriesSheetProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const showToast = useToast();
  const { categories, createCategory } = useCategories({ autoLoad: false });
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(selectedIds),
  );
  const [creating, setCreating] = useState(false);

  // Mulai dari pilihan terbaru setiap kali sheet dibuka.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setSelected(new Set(selectedIds));
    }
  }

  const options = categories.filter(category => category.type === type);
  const count = options.filter(category =>
    selected.has(category.idCategory),
  ).length;

  const toggle = (idCategory: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idCategory)) {
        next.delete(idCategory);
      } else {
        next.add(idCategory);
      }
      return next;
    });

  return (
    <>
      <BottomSheet
        visible={visible}
        title={t('budget.selectCategoriesTitle')}
        subtitle={t('budget.selectedCount', { count })}
        onBack={onClose}
        backLabel={t('common.back')}
        closeLabel={t('common.close')}
        onClose={onClose}
        footer={
          <>
            <Button
              variant="outline"
              label={t('common.cancel')}
              onPress={onClose}
              style={styles.footerButton}
            />
            <Button
              label={
                count > 0
                  ? t('budget.pickCategories', { count })
                  : t('budget.pickCategory')
              }
              renderIcon={color => <Check size={18} color={color} />}
              onPress={() =>
                onConfirm(
                  options.filter(category => selected.has(category.idCategory)),
                )
              }
              style={styles.footerButton}
            />
          </>
        }
      >
        <View style={styles.grid}>
          {options.map(category => {
            const isSelected = selected.has(category.idCategory);
            return (
              <View key={category.idCategory} style={styles.cellWrap}>
                <PressableScale
                  accessibilityRole="checkbox"
                  accessibilityLabel={category.nameCategory}
                  accessibilityState={{ checked: isSelected }}
                  scaleTo={0.95}
                  onPress={() => toggle(category.idCategory)}
                  style={[styles.cell, isSelected && styles.cellSelected]}
                >
                  <View>
                    <CategoryIcon
                      icon={category.icon}
                      color={category.color}
                      size={48}
                    />
                    <AnimatePresence>
                      {isSelected && (
                        <MotiView
                          key="check"
                          from={{ opacity: 0, scale: 0.4 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.4 }}
                          transition={transitions.pop}
                          style={styles.check}
                        >
                          <Check size={12} color={colors.primaryFg} />
                        </MotiView>
                      )}
                    </AnimatePresence>
                  </View>
                  <Typography
                    variant={isSelected ? 'tileLabel' : 'caption'}
                    tone={isSelected ? 'primary' : 'muted'}
                    align="center"
                    numberOfLines={1}
                  >
                    {category.nameCategory}
                  </Typography>
                </PressableScale>
              </View>
            );
          })}
        </View>
        <Button
          variant="soft"
          size="md"
          label={t('budget.newCategory')}
          renderIcon={color => <Plus size={18} color={color} />}
          onPress={() => setCreating(true)}
        />
      </BottomSheet>

      <CategoryFormSheet
        visible={creating}
        defaultType={type}
        onClose={() => setCreating(false)}
        onSubmit={async input => {
          try {
            const created = await createCategory(input);
            setCreating(false);
            setSelected(prev => new Set(prev).add(created.idCategory));
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
