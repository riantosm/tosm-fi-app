import { useState } from 'react';
import { View } from 'react-native';
import { Check, Plus, Trash2, Type } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import CategoryIcon from '@/components/atoms/CategoryIcon';
import IconButton from '@/components/atoms/IconButton';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import SegmentedControl from '@/components/molecules/SegmentedControl';
import TextField from '@/components/molecules/TextField';
import BottomSheet from '@/components/organisms/BottomSheet';
import CategoryIconSheet from '@/components/organisms/CategoryIconSheet';
import ColorPicker from '@/components/organisms/ColorPicker';
import ReorderList from '@/components/organisms/ReorderList';
import { CATEGORY_ICONS } from '@/constants/categoryIcons';
import { WALLET_COLOR_PRESETS } from '@/constants/walletColors';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type {
  Category,
  CategoryInput,
  CategoryType,
  SubCategory,
} from '@/types';

export interface CategoryFormSheetProps {
  visible: boolean;
  /** Data live dari store (subkategori ikut terbarui). Kosong = tambah kategori. */
  category?: Category | null;
  defaultType: CategoryType;
  onClose: () => void;
  /** Simpan; sheet ditutup oleh induk bila berhasil. */
  onSubmit: (input: CategoryInput) => Promise<void>;
  onDelete?: () => void;
  onAddSubCategory?: () => void;
  onEditSubCategory?: (sub: SubCategory) => void;
  onDeleteSubCategory?: (sub: SubCategory) => void;
  onReorderSubCategories?: (orderedIds: string[]) => Promise<void>;
}

const useStyles = makeStyles(({ colors }) => ({
  identity: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  iconColumn: { alignItems: 'center', gap: spacing.sm },
  nameColumn: { flex: 1 },
  section: { gap: 10 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  empty: {
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderRadius: radius.control,
    backgroundColor: colors.surface2,
  },
  subContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  subName: { flex: 1 },
  footerButton: { flex: 1 },
}));

/**
 * Tambah / edit kategori (pen `gyYoq` · `Fuwp0`) — port CategoryFormModal web: jenis, ikon,
 * nama, warna, dan (saat edit) daftar subkategori yang bisa diseret, diedit, dihapus.
 */
export default function CategoryFormSheet({
  visible,
  category = null,
  defaultType,
  onClose,
  onSubmit,
  onDelete,
  onAddSubCategory,
  onEditSubCategory,
  onDeleteSubCategory,
  onReorderSubCategories,
}: CategoryFormSheetProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [type, setType] = useState<CategoryType>(defaultType);
  const [name, setName] = useState('');
  const [color, setColor] = useState(WALLET_COLOR_PRESETS[0]);
  const [icon, setIcon] = useState(CATEGORY_ICONS[0].name);
  const [saving, setSaving] = useState(false);
  const [iconOpen, setIconOpen] = useState(false);
  // Urutan subkategori selama diseret / disimpan (null = ikut store).
  const [subOrder, setSubOrder] = useState<SubCategory[] | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  // Isi ulang form setiap kali sheet dibuka.
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setType(category?.type ?? defaultType);
      setName(category?.nameCategory ?? '');
      setColor(category?.color ?? WALLET_COLOR_PRESETS[0]);
      setIcon(category?.icon ?? CATEGORY_ICONS[0].name);
      setSaving(false);
      setSubOrder(null);
    }
  }

  const isEdit = !!category;
  const subCategories = subOrder ?? category?.subCategories ?? [];

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ nameCategory: trimmed, type, color, icon });
    } finally {
      setSaving(false);
    }
  };

  const saveOrder = async (next: SubCategory[]) => {
    setSavingOrder(true);
    try {
      await onReorderSubCategories?.(next.map(sub => sub.idSubCategory));
    } finally {
      setSavingOrder(false);
      setSubOrder(null);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      closeLabel={t('common.close')}
      title={t(isEdit ? 'category.editTitle' : 'category.addTitle')}
      subtitle={
        category
          ? t('wallet.transactionCount', { n: category.transactionCount })
          : undefined
      }
      headerActions={
        isEdit &&
        onDelete && (
          <IconButton
            label={t('wallet.deleteButton')}
            disabled={saving}
            onPress={onDelete}
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
            disabled={saving}
            onPress={onClose}
            style={styles.footerButton}
          />
          <Button
            label={t(
              isEdit ? 'transaction.saveChanges' : 'category.saveCategory',
            )}
            renderIcon={iconColor => <Check size={18} color={iconColor} />}
            loading={saving}
            disabled={!name.trim()}
            onPress={save}
            style={styles.footerButton}
          />
        </>
      }
    >
      <SegmentedControl<CategoryType>
        value={type}
        onChange={setType}
        activeColor={
          type === 'expense' ? colors.expenseText : colors.incomeText
        }
        options={[
          { value: 'expense', label: t('category.expense') },
          { value: 'income', label: t('category.income') },
        ]}
      />

      <View style={styles.identity}>
        <View style={styles.iconColumn}>
          <Typography variant="fieldLabel" tone="muted">
            {t('category.iconLabel')}
          </Typography>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={t('category.chooseIcon')}
            scaleTo={0.92}
            onPress={() => setIconOpen(true)}
          >
            <CategoryIcon icon={icon} color={color} size={52} outlined />
          </PressableScale>
        </View>
        <View style={styles.nameColumn}>
          <TextField
            variant="filled"
            label={t('category.nameLabel')}
            value={name}
            onChangeText={setName}
            placeholder={t('category.namePlaceholder')}
            autoCapitalize="words"
            returnKeyType="done"
            renderLeadingIcon={iconColor => (
              <Type size={18} color={iconColor} />
            )}
          />
        </View>
      </View>

      <ColorPicker
        label={t('wallet.colorLabel')}
        value={color}
        onChange={setColor}
        presets={WALLET_COLOR_PRESETS}
      />

      {category && (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Typography variant="fieldLabel" tone="muted">
              {t('category.subCategoriesLabel')} · {subCategories.length}
            </Typography>
            {subCategories.length > 1 && (
              <Typography variant="caption" tone="subtle">
                {t('category.dragToReorder')}
              </Typography>
            )}
          </View>
          {subCategories.length === 0 ? (
            <View style={styles.empty}>
              <Typography variant="meta" tone="subtle">
                {t('category.noSubCategories')}
              </Typography>
            </View>
          ) : (
            <ReorderList
              variant="inset"
              showArrows={false}
              disabled={savingOrder}
              items={subCategories}
              keyExtractor={sub => sub.idSubCategory}
              onReorder={setSubOrder}
              onDragEnd={saveOrder}
              renderContent={sub => (
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel={`${t('category.editSubCategoryTitle')}: ${
                    sub.nameSubCategory
                  }`}
                  scaleTo={0.98}
                  onPress={() => onEditSubCategory?.(sub)}
                  style={styles.subContent}
                >
                  <CategoryIcon icon={sub.icon} color={color} size={32} />
                  <Typography numberOfLines={1} style={styles.subName}>
                    {sub.nameSubCategory}
                  </Typography>
                  <Typography variant="meta" tone="subtle" tabular>
                    {t('category.trxShort', { count: sub.transactionCount })}
                  </Typography>
                </PressableScale>
              )}
              renderTrailing={sub => (
                <IconButton
                  variant="ghost"
                  size={32}
                  label={`${t('wallet.deleteButton')}: ${sub.nameSubCategory}`}
                  onPress={() => onDeleteSubCategory?.(sub)}
                  renderIcon={(iconColor, size) => (
                    <Trash2 size={size - 2} color={iconColor} />
                  )}
                />
              )}
            />
          )}
          <Button
            variant="soft"
            size="md"
            label={t('category.addSubCategory')}
            renderIcon={iconColor => <Plus size={18} color={iconColor} />}
            onPress={onAddSubCategory}
          />
        </View>
      )}

      <CategoryIconSheet
        visible={iconOpen}
        value={icon}
        color={color}
        onClose={() => setIconOpen(false)}
        onSelect={selected => {
          setIcon(selected);
          setIconOpen(false);
        }}
      />
    </BottomSheet>
  );
}
