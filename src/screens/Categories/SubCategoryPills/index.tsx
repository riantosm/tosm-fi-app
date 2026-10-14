import { useRef, useState } from 'react';
import { View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { resolveCategoryIcon } from '@/constants/categoryIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { Category, SubCategory } from '@/types';

export interface SubCategoryPillsProps {
  category: Category;
  onEditSubCategory: (sub: SubCategory) => void;
  onAddSubCategory: () => void;
  /** "+N" membuka daftar lengkap (Edit kategori). */
  onShowAll: () => void;
}

const GAP = spacing.sm;
const ADD_WIDTH = 32;
const MORE_WIDTH = 40;

const useStyles = makeStyles(({ colors }) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP,
    overflow: 'hidden',
  },
  measure: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'row',
    gap: GAP,
    opacity: 0,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    maxWidth: 180,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  pillText: { flexShrink: 1 },
  more: {
    height: 32,
    minWidth: 32,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
  },
  add: {
    width: ADD_WIDTH,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
}));

/**
 * Satu baris pill subkategori (pen `auPuW`): sebanyak yang muat, lalu "+N", lalu "+".
 * Lebar pill diukur dari salinan tak terlihat supaya tidak pernah membungkus/terpotong.
 */
export default function SubCategoryPills({
  category,
  onEditSubCategory,
  onAddSubCategory,
  onShowAll,
}: SubCategoryPillsProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const subs = category.subCategories;
  const [rowWidth, setRowWidth] = useState(0);
  const [widths, setWidths] = useState<Record<string, number>>({});
  // Lebar dikumpulkan di ref dan state diperbarui sekali setelah semua pill terukur (dulu satu
  // setState per pill → kartu dirender ulang puluhan kali saat halaman dibuka).
  const pendingWidths = useRef<Record<string, number>>({});
  const recordWidth = (id: string, width: number) => {
    pendingWidths.current[id] = width;
    const complete = subs.every(
      sub => pendingWidths.current[sub.idSubCategory] !== undefined,
    );
    const changed = subs.some(
      sub =>
        pendingWidths.current[sub.idSubCategory] !== widths[sub.idSubCategory],
    );
    if (complete && changed) {
      setWidths({ ...pendingWidths.current });
    }
  };

  const measured = subs.every(sub => widths[sub.idSubCategory] !== undefined);
  const ready = rowWidth > 0 && measured;
  // Sebelum terukur tidak ada pill yang ditampilkan (hindari kedipan pill terpotong).
  let visibleCount = 0;
  if (ready) {
    const available = rowWidth - ADD_WIDTH - GAP;
    let used = 0;
    visibleCount = 0;
    for (let index = 0; index < subs.length; index++) {
      const next =
        used + widths[subs[index].idSubCategory] + (index > 0 ? GAP : 0);
      const reserve = index < subs.length - 1 ? MORE_WIDTH + GAP : 0;
      if (next + reserve > available) {
        break;
      }
      used = next;
      visibleCount++;
    }
  }
  const hidden = ready ? subs.length - visibleCount : 0;

  const renderPill = (sub: SubCategory, onPress?: () => void) => {
    const Icon = resolveCategoryIcon(sub.icon);
    return (
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${t('category.editSubCategoryTitle')}: ${
          sub.nameSubCategory
        }`}
        disabled={!onPress}
        scaleTo={0.95}
        onPress={onPress}
        style={[
          styles.pill,
          {
            borderColor: `${category.color}59`,
            backgroundColor: `${category.color}14`,
          },
        ]}
      >
        <Icon size={14} color={category.color} />
        <Typography
          variant="secondaryMedium"
          numberOfLines={1}
          style={styles.pillText}
        >
          {sub.nameSubCategory}
        </Typography>
      </PressableScale>
    );
  };

  // Salinan pengukur: bentuk sama, tanpa Pressable/animasi (lebih ringan).
  const renderMeasurePill = (sub: SubCategory) => {
    const Icon = resolveCategoryIcon(sub.icon);
    return (
      <View style={styles.pill}>
        <Icon size={14} color={category.color} />
        <Typography
          variant="secondaryMedium"
          numberOfLines={1}
          style={styles.pillText}
        >
          {sub.nameSubCategory}
        </Typography>
      </View>
    );
  };

  return (
    <View
      style={styles.row}
      onLayout={event => setRowWidth(event.nativeEvent.layout.width)}
    >
      <View
        style={styles.measure}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {subs.map(sub => (
          <View
            key={sub.idSubCategory}
            onLayout={event =>
              recordWidth(sub.idSubCategory, event.nativeEvent.layout.width)
            }
          >
            {renderMeasurePill(sub)}
          </View>
        ))}
      </View>

      {subs.slice(0, visibleCount).map(sub => (
        <View key={sub.idSubCategory}>
          {renderPill(sub, () => onEditSubCategory(sub))}
        </View>
      ))}
      {hidden > 0 && (
        <PressableScale
          accessibilityRole="button"
          scaleTo={0.95}
          onPress={onShowAll}
          style={styles.more}
        >
          <Typography variant="tileLabel" tone="muted">
            +{hidden}
          </Typography>
        </PressableScale>
      )}
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={t('category.addSubCategory')}
        scaleTo={0.9}
        onPress={onAddSubCategory}
        style={styles.add}
      >
        <Plus size={14} color={colors.text3} />
      </PressableScale>
    </View>
  );
}
