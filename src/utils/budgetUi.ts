import type { TFunction } from 'i18next';
import { Layers, Shapes, type LucideIcon } from 'lucide-react-native';
import { resolveCategoryIcon } from '@/constants/categoryIcons';
import type { Budget, Category } from '@/types';

/** Semua kategori → layers; satu kategori → ikon kategorinya; beberapa → shapes. */
export function resolveBudgetIcon(
  budget: Budget,
  categories: Category[],
): LucideIcon {
  const ids = budget.idCategories ?? [];
  if (ids.length === 0) {
    return Layers;
  }
  if (ids.length === 1) {
    const category = categories.find(item => item.idCategory === ids[0]);
    if (category) {
      return resolveCategoryIcon(category.icon);
    }
  }
  return Shapes;
}

/** "Semua kategori" / "2 kategori" — `long` menulis "pengeluaran" untuk hero detail. */
export function budgetScopeLabel(
  budget: Budget,
  t: TFunction,
  long = false,
): string {
  const count = budget.idCategories?.length ?? 0;
  if (count === 0) {
    return long ? t('budget.scopeAllLong') : t('budget.scopeAll');
  }
  return t('budget.categoryCount', { count });
}
