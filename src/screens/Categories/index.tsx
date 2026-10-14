import { useState } from 'react';
import { View } from 'react-native';
import {
  ArrowUpDown,
  Check,
  Info,
  Pencil,
  Plus,
  Tags,
  Trash2,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import CategoryIcon from '@/components/atoms/CategoryIcon';
import IconButton from '@/components/atoms/IconButton';
import Skeleton from '@/components/atoms/Skeleton';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import EmptyState from '@/components/molecules/EmptyState';
import SegmentedControl from '@/components/molecules/SegmentedControl';
import ActionSheet from '@/components/organisms/ActionSheet';
import CategoryFormSheet from '@/components/organisms/CategoryFormSheet';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';
import ReorderList from '@/components/organisms/ReorderList';
import SubCategoryFormSheet from '@/components/organisms/SubCategoryFormSheet';
import MainLayout from '@/components/templates/MainLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useCategories } from '@/hooks/useCategories';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import CategoryCard from '@/screens/Categories/CategoryCard';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type {
  Category,
  CategoryInput,
  CategoryType,
  SubCategory,
  SubCategoryInput,
} from '@/types';
import Reveal from '@/components/atoms/Reveal';

type TypeFilter = 'all' | CategoryType;

type PendingDelete =
  | { kind: 'category'; category: Category }
  | { kind: 'sub'; sub: SubCategory };

const useStyles = makeStyles(({ colors, shadows }) => ({
  section: { gap: spacing.md },
  filters: { gap: spacing.sm },
  tabs: { borderRadius: radius.pill, ...shadows.card },
  count: { paddingHorizontal: spacing.xs },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.control,
    backgroundColor: colors.primarySoft,
  },
  hintText: { flex: 1 },
  reorderName: { flex: 1 },
}));

/** Halaman Kategori (pen `auPuW` · `y0vxv` · `ZVCxG`) — port CategoriesPage web. */
export default function CategoriesScreen(
  _props: RootStackScreenProps<typeof ROUTES.CATEGORIES>,
) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const showToast = useToast();
  const {
    categories,
    status,
    loadCategories,
    createCategory,
    editCategory,
    deleteCategory,
    reorderCategories,
    createSubCategory,
    editSubCategory,
    deleteSubCategory,
    reorderSubCategories,
  } = useCategories();

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [reordering, setReordering] = useState(false);
  const [localOrder, setLocalOrder] = useState<Category[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [categorySheet, setCategorySheet] = useState<{
    idCategory: string | null;
    defaultType: CategoryType;
  } | null>(null);
  const [subSheet, setSubSheet] = useState<{
    idCategory: string;
    idSubCategory: string | null;
  } | null>(null);
  const [menuFor, setMenuFor] = useState<Category | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  // Data live dari store supaya sheet ikut terbarui setelah subkategori berubah.
  const editingCategory = categorySheet?.idCategory
    ? categories.find(item => item.idCategory === categorySheet.idCategory) ??
      null
    : null;
  const subParent = subSheet
    ? categories.find(item => item.idCategory === subSheet.idCategory) ?? null
    : null;
  const editingSub = subSheet?.idSubCategory
    ? subParent?.subCategories.find(
        sub => sub.idSubCategory === subSheet.idSubCategory,
      ) ?? null
    : null;

  const subCount = categories.reduce(
    (sum, category) => sum + category.subCategories.length,
    0,
  );
  const visible =
    typeFilter === 'all'
      ? categories
      : categories.filter(category => category.type === typeFilter);
  const initialLoading = status !== 'loaded' && categories.length === 0;
  const empty = status === 'loaded' && categories.length === 0;

  const fail = (error: unknown) =>
    showToast(
      error instanceof Error ? error.message : t('category.genericError'),
      'error',
    );

  const openCreate = () =>
    setCategorySheet({
      idCategory: null,
      defaultType: typeFilter === 'income' ? 'income' : 'expense',
    });

  const submitCategory = async (input: CategoryInput) => {
    try {
      if (categorySheet?.idCategory) {
        await editCategory(categorySheet.idCategory, input);
      } else {
        await createCategory(input);
      }
      setCategorySheet(null);
    } catch (error) {
      fail(error);
    }
  };

  const submitSub = async (input: SubCategoryInput) => {
    if (!subSheet) {
      return;
    }
    try {
      if (subSheet.idSubCategory) {
        await editSubCategory(
          subSheet.idCategory,
          subSheet.idSubCategory,
          input,
        );
      } else {
        await createSubCategory(subSheet.idCategory, input);
      }
      setSubSheet(null);
    } catch (error) {
      fail(error);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }
    setDeleting(true);
    try {
      if (pendingDelete.kind === 'category') {
        await deleteCategory(pendingDelete.category.idCategory);
        setCategorySheet(null);
      } else {
        await deleteSubCategory(
          pendingDelete.sub.idCategory,
          pendingDelete.sub.idSubCategory,
        );
        setSubSheet(null);
      }
      setPendingDelete(null);
    } catch (error) {
      fail(error);
    } finally {
      setDeleting(false);
    }
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      await reorderCategories(localOrder.map(category => category.idCategory));
      setReordering(false);
    } catch (error) {
      fail(error);
    } finally {
      setSavingOrder(false);
    }
  };

  const deleteMessage = (() => {
    if (pendingDelete?.kind !== 'category') {
      return t('category.deleteSubConfirmDescription');
    }
    const names = pendingDelete.category.subCategories.map(
      sub => sub.nameSubCategory,
    );
    return names.length > 0
      ? t('category.deleteConfirmWithSubs', {
          count: names.length,
          names: names.join(', '),
        })
      : t('category.deleteConfirmNoSubs');
  })();

  const headerRight = reordering ? (
    <>
      <Button
        size="sm"
        variant="outline"
        label={t('common.cancel')}
        disabled={savingOrder}
        onPress={() => setReordering(false)}
      />
      <Button
        size="sm"
        label={t('wallet.saveShort')}
        loading={savingOrder}
        renderIcon={color => <Check size={16} color={color} />}
        onPress={saveOrder}
      />
    </>
  ) : empty ? undefined : (
    <>
      {categories.length > 1 && (
        <IconButton
          variant="surface"
          label={t('category.toggleReorder')}
          onPress={() => {
            setLocalOrder(categories);
            setReordering(true);
          }}
          renderIcon={(color, size) => (
            <ArrowUpDown size={size} color={color} />
          )}
        />
      )}
      <IconButton
        variant="primary"
        label={t('category.addCategory')}
        onPress={openCreate}
        renderIcon={(color, size) => <Plus size={size} color={color} />}
      />
    </>
  );

  return (
    <>
      <MainLayout
        title={t('nav.category')}
        withTabBar
        headerRight={headerRight}
        onRefresh={reordering ? undefined : loadCategories}
      >
        {reordering ? (
          <Reveal key="reorder" style={styles.section}>
            <View style={styles.hint}>
              <Info size={16} color={colors.primaryText} />
              <Typography variant="meta" tone="primary" style={styles.hintText}>
                {t('wallet.reorderHintShort')}
              </Typography>
            </View>
            <ReorderList
              items={localOrder}
              keyExtractor={category => category.idCategory}
              onReorder={setLocalOrder}
              renderContent={category => (
                <>
                  <CategoryIcon
                    icon={category.icon}
                    color={category.color}
                    size={40}
                  />
                  <Typography
                    variant="label"
                    numberOfLines={1}
                    style={styles.reorderName}
                  >
                    {category.nameCategory}
                  </Typography>
                </>
              )}
            />
          </Reveal>
        ) : empty ? (
          <Card key="empty">
            <EmptyState
              icon={<Tags size={30} color={colors.primaryText} />}
              title={t('category.noCategories')}
              description={t('category.emptyDescription')}
              action={
                <Button
                  label={t('category.addFirst')}
                  renderIcon={color => <Plus size={18} color={color} />}
                  onPress={openCreate}
                />
              }
            />
          </Card>
        ) : (
          <>
            <View style={styles.filters}>
              <View style={styles.tabs}>
                <SegmentedControl<TypeFilter>
                  variant="compact"
                  size="md"
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={[
                    { value: 'all', label: t('common.all') },
                    { value: 'expense', label: t('category.expense') },
                    { value: 'income', label: t('category.income') },
                  ]}
                />
              </View>
              {!initialLoading && (
                <Typography variant="meta" tone="subtle" style={styles.count}>
                  {t('category.categoryCountLabel', {
                    count: categories.length,
                  })}{' '}
                  · {t('category.subCategoryCountLabel', { count: subCount })}
                </Typography>
              )}
            </View>
            <Reveal key={`list-${typeFilter}`} style={styles.section}>
              {initialLoading
                ? [0, 1, 2, 3].map(index => (
                    <Skeleton key={index} height={122} radius={radius.card} />
                  ))
                : visible.map((category, index) => (
                    <Reveal
                      delay={Math.min(index, 6) * 40}
                      key={category.idCategory}
                    >
                      <CategoryCard
                        category={category}
                        onEdit={() =>
                          setCategorySheet({
                            idCategory: category.idCategory,
                            defaultType: category.type,
                          })
                        }
                        onMore={() => setMenuFor(category)}
                        onEditSubCategory={sub =>
                          setSubSheet({
                            idCategory: category.idCategory,
                            idSubCategory: sub.idSubCategory,
                          })
                        }
                        onAddSubCategory={() =>
                          setSubSheet({
                            idCategory: category.idCategory,
                            idSubCategory: null,
                          })
                        }
                      />
                    </Reveal>
                  ))}
            </Reveal>
          </>
        )}
      </MainLayout>

      <ActionSheet
        visible={!!menuFor}
        title={menuFor?.nameCategory ?? ''}
        onClose={() => setMenuFor(null)}
        actions={[
          {
            key: 'edit',
            label: t('category.editTitle'),
            renderIcon: color => <Pencil size={18} color={color} />,
            onPress: () => {
              if (menuFor) {
                setCategorySheet({
                  idCategory: menuFor.idCategory,
                  defaultType: menuFor.type,
                });
              }
              setMenuFor(null);
            },
          },
          {
            key: 'delete',
            label: t('wallet.deleteButton'),
            danger: true,
            renderIcon: color => <Trash2 size={18} color={color} />,
            onPress: () => {
              if (menuFor) {
                setPendingDelete({ kind: 'category', category: menuFor });
              }
              setMenuFor(null);
            },
          },
        ]}
      />

      <CategoryFormSheet
        visible={!!categorySheet}
        category={editingCategory}
        defaultType={categorySheet?.defaultType ?? 'expense'}
        onClose={() => setCategorySheet(null)}
        onSubmit={submitCategory}
        onDelete={
          editingCategory
            ? () =>
                setPendingDelete({
                  kind: 'category',
                  category: editingCategory,
                })
            : undefined
        }
        onAddSubCategory={() =>
          editingCategory &&
          setSubSheet({
            idCategory: editingCategory.idCategory,
            idSubCategory: null,
          })
        }
        onEditSubCategory={sub =>
          setSubSheet({
            idCategory: sub.idCategory,
            idSubCategory: sub.idSubCategory,
          })
        }
        onDeleteSubCategory={sub => setPendingDelete({ kind: 'sub', sub })}
        onReorderSubCategories={async orderedIds => {
          if (!editingCategory) {
            return;
          }
          try {
            await reorderSubCategories(editingCategory.idCategory, orderedIds);
          } catch (error) {
            fail(error);
          }
        }}
      />

      <SubCategoryFormSheet
        visible={!!subSheet}
        subCategory={editingSub}
        categoryName={subParent?.nameCategory}
        categoryColor={subParent?.color ?? colors.txNeutral}
        onClose={() => setSubSheet(null)}
        onSubmit={submitSub}
        onDelete={
          editingSub
            ? () => setPendingDelete({ kind: 'sub', sub: editingSub })
            : undefined
        }
      />

      <ConfirmDialog
        visible={!!pendingDelete}
        tone="danger"
        renderIcon={color => <Trash2 size={24} color={color} />}
        title={
          pendingDelete?.kind === 'category'
            ? t('category.deleteConfirmTitle', {
                name: pendingDelete.category.nameCategory,
              })
            : t('category.deleteSubCategoryConfirmTitle', {
                name: pendingDelete?.sub.nameSubCategory ?? '',
              })
        }
        message={deleteMessage}
        confirmLabel={
          pendingDelete?.kind === 'category'
            ? t('category.deleteCategoryAction')
            : t('wallet.deleteButton')
        }
        cancelLabel={t('common.cancel')}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
