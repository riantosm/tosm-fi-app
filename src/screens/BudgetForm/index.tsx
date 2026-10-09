import { useState } from 'react';
import { View } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import { Banknote, Check, Plus, Trash2, Type, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import IconButton from '@/components/atoms/IconButton';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import SegmentedControl from '@/components/molecules/SegmentedControl';
import TextField from '@/components/molecules/TextField';
import ColorPicker from '@/components/organisms/ColorPicker';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';
import SelectCategoriesSheet from '@/components/organisms/SelectCategoriesSheet';
import SheetLayout from '@/components/templates/SheetLayout';
import { resolveCategoryIcon } from '@/constants/categoryIcons';
import { WALLET_COLOR_PRESETS } from '@/constants/walletColors';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useBudgetPeriod } from '@/hooks/useBudgetPeriod';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { BudgetInput } from '@/types';
import { transitions } from '@/utils/motion';
import { formatNumberInput, parseFormattedNumber } from '@/utils/numberInput';

type BudgetScope = 'all' | 'category';

const useStyles = makeStyles(({ colors }) => ({
  field: { gap: spacing.sm },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 200,
    paddingVertical: 4,
    paddingLeft: 10,
    paddingRight: 4,
    borderRadius: radius.pill,
  },
  chipText: { flexShrink: 1 },
  chipRemove: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  pick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  footerButton: { flex: 1 },
}));

/** Tambah / edit budget (pen `O98YEF`) — port BudgetFormModal web. */
export default function BudgetFormScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof ROUTES.BUDGET_FORM>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const showToast = useToast();
  const { monthLabel } = useBudgetPeriod();
  const { categories } = useCategories();
  const { createBudget, editBudget, deleteBudget } = useBudgets({
    autoLoad: false,
  });
  const budget = route.params?.budget ?? null;
  const close = navigation.goBack;
  const initialIds = budget?.idCategories ?? [];

  const [name, setName] = useState(budget?.name ?? '');
  const [color, setColor] = useState(budget?.color ?? WALLET_COLOR_PRESETS[0]);
  const [scope, setScope] = useState<BudgetScope>(
    initialIds.length > 0 ? 'category' : 'all',
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);
  const [limitInput, setLimitInput] = useState(
    budget ? formatNumberInput(String(budget.limitAmount)) : '',
  );
  const [busy, setBusy] = useState<'save' | 'delete' | null>(null);
  const [sheet, setSheet] = useState<'categories' | 'delete' | null>(null);

  // Hanya kategori pengeluaran yang masih ada (kategori terhapus diabaikan).
  const selectedCategories = categories.filter(
    category =>
      category.type === 'expense' && selectedIds.includes(category.idCategory),
  );
  const scopeValid = scope === 'all' || selectedCategories.length > 0;
  const canSubmit =
    !!name.trim() && scopeValid && parseFormattedNumber(limitInput) > 0;

  const fail = (error: unknown) =>
    showToast(
      error instanceof Error ? error.message : t('budget.genericError'),
      'error',
    );

  const save = async () => {
    if (!canSubmit) {
      return;
    }
    const input: BudgetInput = {
      name: name.trim(),
      color,
      idCategories:
        scope === 'category'
          ? selectedCategories.map(category => category.idCategory)
          : [],
      limitAmount: parseFormattedNumber(limitInput),
      childLimits: budget?.childLimits ?? [],
      // Disematkan diatur dari tombol pin, bukan form — edit tidak boleh mereset.
      isPinned: budget?.isPinned ?? false,
    };
    setBusy('save');
    try {
      if (budget) {
        await editBudget(budget.idBudget, input);
      } else {
        await createBudget(input);
      }
      close();
    } catch (error) {
      fail(error);
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!budget) {
      return;
    }
    setBusy('delete');
    try {
      await deleteBudget(budget.idBudget);
      showToast(t('budget.deleteSuccess'), 'success');
      setSheet(null);
      close();
    } catch (error) {
      fail(error);
      setBusy(null);
    }
  };

  return (
    <>
      <SheetLayout
        onClose={close}
        closeLabel={t('common.close')}
        title={t(budget ? 'budget.editTitle' : 'budget.addTitle')}
        subtitle={t('budget.appliesTo', { month: monthLabel })}
        headerActions={
          budget && (
            <IconButton
              label={t('budget.deleteButton')}
              disabled={!!busy}
              onPress={() => setSheet('delete')}
              renderIcon={(_, size) => (
                <Trash2 size={size} color={colors.expenseText} />
              )}
            />
          )
        }
        footer={
          <>
            <Button
              variant="outline"
              label={t('common.cancel')}
              disabled={!!busy}
              onPress={close}
              style={styles.footerButton}
            />
            <Button
              label={t(
                budget ? 'transaction.saveChanges' : 'budget.saveBudget',
              )}
              renderIcon={iconColor => <Check size={18} color={iconColor} />}
              loading={busy === 'save'}
              disabled={!!busy || !canSubmit}
              onPress={save}
              style={styles.footerButton}
            />
          </>
        }
      >
        <TextField
          variant="filled"
          label={t('budget.nameLabel')}
          value={name}
          onChangeText={setName}
          placeholder={t('budget.namePlaceholder')}
          autoCapitalize="sentences"
          renderLeadingIcon={iconColor => <Type size={18} color={iconColor} />}
        />

        <View style={styles.field}>
          <Typography variant="fieldLabel" tone="muted">
            {t('budget.scopeLabel')}
          </Typography>
          <SegmentedControl<BudgetScope>
            value={scope}
            onChange={setScope}
            activeColor={colors.primaryText}
            options={[
              { value: 'all', label: t('budget.scopeAll') },
              { value: 'category', label: t('budget.scopeCategory') },
            ]}
          />
          <AnimatePresence>
            {scope === 'category' && (
              <MotiView
                key="chips"
                from={{ opacity: 0, translateY: -6 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -6 }}
                transition={transitions.fade}
                style={styles.chips}
              >
                {selectedCategories.map(category => {
                  const Icon = resolveCategoryIcon(category.icon);
                  return (
                    <View
                      key={category.idCategory}
                      style={[
                        styles.chip,
                        { backgroundColor: `${category.color}1F` },
                      ]}
                    >
                      <Icon size={14} color={category.color} />
                      <Typography
                        variant="meta"
                        numberOfLines={1}
                        style={styles.chipText}
                      >
                        {category.nameCategory}
                      </Typography>
                      <PressableScale
                        accessibilityRole="button"
                        accessibilityLabel={`${t('common.remove')}: ${
                          category.nameCategory
                        }`}
                        scaleTo={0.85}
                        hitSlop={6}
                        onPress={() =>
                          setSelectedIds(prev =>
                            prev.filter(id => id !== category.idCategory),
                          )
                        }
                        style={styles.chipRemove}
                      >
                        <X size={14} color={colors.text3} />
                      </PressableScale>
                    </View>
                  );
                })}
                <PressableScale
                  accessibilityRole="button"
                  scaleTo={0.95}
                  onPress={() => setSheet('categories')}
                  style={styles.pick}
                >
                  <Plus size={14} color={colors.primaryText} />
                  <Typography variant="captionStrong" tone="primary">
                    {t(
                      selectedCategories.length === 0
                        ? 'budget.selectCategoryPlaceholder'
                        : 'budget.addCategoryButton',
                    )}
                  </Typography>
                </PressableScale>
              </MotiView>
            )}
          </AnimatePresence>
        </View>

        <TextField
          variant="filled"
          label={t('budget.limitLabel')}
          value={limitInput}
          onChangeText={raw => setLimitInput(formatNumberInput(raw))}
          placeholder="0"
          keyboardType="decimal-pad"
          renderLeadingIcon={iconColor => (
            <Banknote size={18} color={iconColor} />
          )}
        />

        <ColorPicker
          label={t('wallet.colorLabel')}
          value={color}
          onChange={setColor}
          presets={WALLET_COLOR_PRESETS}
        />
      </SheetLayout>

      <SelectCategoriesSheet
        visible={sheet === 'categories'}
        type="expense"
        selectedIds={selectedCategories.map(category => category.idCategory)}
        onClose={() => setSheet(null)}
        onConfirm={picked => {
          setSelectedIds(picked.map(category => category.idCategory));
          setSheet(null);
        }}
      />
      {budget && (
        <ConfirmDialog
          visible={sheet === 'delete'}
          tone="danger"
          renderIcon={iconColor => <Trash2 size={24} color={iconColor} />}
          title={t('budget.deleteConfirmTitle', { name: budget.name })}
          message={t('budget.deleteConfirmDescription')}
          confirmLabel={t('budget.deleteBudgetAction')}
          cancelLabel={t('common.cancel')}
          loading={busy === 'delete'}
          onConfirm={remove}
          onCancel={() => setSheet(null)}
        />
      )}
    </>
  );
}
