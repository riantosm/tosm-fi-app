import { generateShades } from '@/utils/color';
import type { TransactionCategoryBreakdown } from '@/types';

export const OTHER_SUB_CATEGORY_ID = '__other__';

export interface CategorySlice {
  id: string;
  /** `null` means "no subcategory" — render an "Other" label at display time. */
  name: string | null;
  icon: string;
  color: string;
  total: number;
  count: number;
  percentage: number;
  subSlices?: CategorySlice[];
}

/** Adapts the backend's nested category/subcategory breakdown into chart-ready slices. */
export function buildCategoryBreakdown(
  items: TransactionCategoryBreakdown[],
): CategorySlice[] {
  return items.map((category): CategorySlice => {
    const shades = generateShades(
      category.color,
      category.subCategoryBreakdown.length,
    );
    return {
      id: category.idCategory,
      name: category.nameCategory,
      icon: category.icon,
      color: category.color,
      total: category.amount,
      count: category.transactionCount,
      percentage: category.percentage,
      subSlices: category.subCategoryBreakdown.map((sub, index) => ({
        id: sub.idSubCategory ?? OTHER_SUB_CATEGORY_ID,
        name: sub.nameSubCategory,
        icon: sub.icon ?? category.icon,
        color: shades[index] ?? category.color,
        total: sub.amount,
        count: sub.transactionCount,
        percentage: sub.percentage,
      })),
    };
  });
}
