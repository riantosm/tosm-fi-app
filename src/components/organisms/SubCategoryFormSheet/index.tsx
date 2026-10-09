import { useState } from 'react';
import { View } from 'react-native';
import { Check, Trash2, Type } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import CategoryIcon from '@/components/atoms/CategoryIcon';
import IconButton from '@/components/atoms/IconButton';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import TextField from '@/components/molecules/TextField';
import BottomSheet from '@/components/organisms/BottomSheet';
import CategoryIconSheet from '@/components/organisms/CategoryIconSheet';
import { CATEGORY_ICONS } from '@/constants/categoryIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { SubCategory, SubCategoryInput } from '@/types';

export interface SubCategoryFormSheetProps {
  visible: boolean;
  /** Kosong = tambah subkategori. */
  subCategory?: SubCategory | null;
  categoryName?: string;
  categoryColor: string;
  onClose: () => void;
  /** Simpan; sheet ditutup oleh induk bila berhasil. */
  onSubmit: (input: SubCategoryInput) => Promise<void>;
  onDelete?: () => void;
}

const useStyles = makeStyles(({ colors }) => ({
  identity: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  iconColumn: { alignItems: 'center', gap: spacing.sm },
  nameColumn: { flex: 1 },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderRadius: radius.control,
    backgroundColor: colors.surface2,
  },
  dot: { width: 10, height: 10, borderRadius: radius.pill },
  noteText: { flex: 1 },
  footerButton: { flex: 1 },
}));

/** Tambah / edit subkategori (pen `XqmP6`) — warna selalu mengikuti kategori induk. */
export default function SubCategoryFormSheet({
  visible,
  subCategory = null,
  categoryName,
  categoryColor,
  onClose,
  onSubmit,
  onDelete,
}: SubCategoryFormSheetProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(CATEGORY_ICONS[0].name);
  const [saving, setSaving] = useState(false);
  const [iconOpen, setIconOpen] = useState(false);

  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setName(subCategory?.nameSubCategory ?? '');
      setIcon(subCategory?.icon ?? CATEGORY_ICONS[0].name);
      setSaving(false);
    }
  }

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ nameSubCategory: trimmed, icon });
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      closeLabel={t('common.close')}
      title={t(
        subCategory
          ? 'category.editSubCategoryTitle'
          : 'category.addSubCategoryTitle',
      )}
      subtitle={
        categoryName
          ? t('category.inCategory', { name: categoryName })
          : undefined
      }
      headerActions={
        subCategory &&
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
            label={t('transaction.save')}
            renderIcon={iconColor => <Check size={18} color={iconColor} />}
            loading={saving}
            disabled={!name.trim()}
            onPress={save}
            style={styles.footerButton}
          />
        </>
      }
    >
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
            <CategoryIcon
              icon={icon}
              color={categoryColor}
              size={52}
              outlined
            />
          </PressableScale>
        </View>
        <View style={styles.nameColumn}>
          <TextField
            variant="filled"
            label={t('category.subNameLabel')}
            value={name}
            onChangeText={setName}
            placeholder={t('category.subCategoryNamePlaceholder')}
            autoCapitalize="words"
            returnKeyType="done"
            renderLeadingIcon={iconColor => (
              <Type size={18} color={iconColor} />
            )}
          />
        </View>
      </View>

      <View style={styles.note}>
        <View style={[styles.dot, { backgroundColor: categoryColor }]} />
        <Typography variant="meta" tone="muted" style={styles.noteText}>
          {categoryName
            ? t('category.colorFollowsNamed', { name: categoryName })
            : t('category.colorFollowsCategory')}
        </Typography>
      </View>

      <CategoryIconSheet
        visible={iconOpen}
        value={icon}
        color={categoryColor}
        onClose={() => setIconOpen(false)}
        onSelect={selected => {
          setIcon(selected);
          setIconOpen(false);
        }}
      />
    </BottomSheet>
  );
}
