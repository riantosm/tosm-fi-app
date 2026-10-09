import { OTHER_SUB_CATEGORY_ID } from '@/utils/categoryBreakdown';
import { toIsoDateString } from '@/utils/month';
import { generateShades } from '@/utils/color';
import type { Budget, BudgetChildLimit } from '@/types';
import type { Category } from '@/types';
import type { TransactionCategoryBreakdown } from '@/types';

export interface BudgetSlice {
  id: string;
  /** `null` means "no subcategory" — render an "Other" label at display time. */
  name: string | null;
  icon: string;
  color: string;
  spent: number;
  /** `null` means the user hasn't set a limit for this row yet. */
  limit: number | null;
  count: number;
  subSlices?: BudgetSlice[];
}

export interface CurrentMonthRange {
  dateFrom: string;
  dateTo: string;
  daysInMonth: number;
  dayOfMonth: number;
}

export function getCurrentMonthRange(
  referenceDate: Date = new Date(),
): CurrentMonthRange {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    dateFrom: toIsoDateString(firstDay),
    dateTo: toIsoDateString(lastDay),
    daysInMonth: lastDay.getDate(),
    dayOfMonth: referenceDate.getDate(),
  };
}

function findLimit(
  childLimits: BudgetChildLimit[],
  idCategory: string,
  idSubCategory: string | null,
): number | null {
  return (
    childLimits.find(
      limit =>
        limit.idCategory === idCategory &&
        limit.idSubCategory === idSubCategory,
    )?.limitAmount ?? null
  );
}

/**
 * Builds every subcategory row for `category`, zero-filled from the category
 * list itself (not just the transaction breakdown) so a subcategory with no
 * spending yet this period still shows up with a settable limit — plus a
 * trailing "Other" row for transactions with a category but no subcategory,
 * only when it actually has spend (there's no real entity to zero-fill it from).
 */
function buildSubSlicesForCategory(
  category: Category,
  breakdownEntry: TransactionCategoryBreakdown | undefined,
  childLimits: BudgetChildLimit[],
): BudgetSlice[] {
  const shades = generateShades(
    category.color,
    category.subCategories.length || 1,
  );

  const subSlices = category.subCategories.map((sub, index): BudgetSlice => {
    const subBreakdown = breakdownEntry?.subCategoryBreakdown.find(
      item => item.idSubCategory === sub.idSubCategory,
    );
    return {
      id: sub.idSubCategory,
      name: sub.nameSubCategory,
      icon: sub.icon,
      color: shades[index] ?? category.color,
      spent: subBreakdown?.amount ?? 0,
      limit: findLimit(childLimits, category.idCategory, sub.idSubCategory),
      count: subBreakdown?.transactionCount ?? 0,
    };
  });

  const otherBreakdown = breakdownEntry?.subCategoryBreakdown.find(
    item => item.idSubCategory === null,
  );
  if (otherBreakdown && otherBreakdown.amount > 0) {
    subSlices.push({
      id: OTHER_SUB_CATEGORY_ID,
      name: null,
      icon: category.icon,
      color: category.color,
      spent: otherBreakdown.amount,
      // Keyed by the OTHER_SUB_CATEGORY_ID sentinel, not `null` — `null` is
      // reserved for the category-level limit itself, so the two don't collide.
      limit: findLimit(childLimits, category.idCategory, OTHER_SUB_CATEGORY_ID),
      count: otherBreakdown.transactionCount,
    });
  }

  return subSlices;
}

/**
 * Sum of every category-level limit set under `budget` — `childLimits`
 * entries with `idSubCategory: null` each represent one scoped category's
 * own limit.
 */
export function computeAllocatedLimit(budget: Budget): number {
  return budget.childLimits
    .filter(limit => limit.idSubCategory === null)
    .reduce((sum, limit) => sum + limit.limitAmount, 0);
}

/** Total spent by `budget` this period — every expense category if `idCategories` is empty, else just the scoped ones. */
export function computeBudgetSpent(
  budget: Budget,
  categoryBreakdown: TransactionCategoryBreakdown[],
): number {
  // Falls back to `[]` for a budget rehydrated from a pre-migration
  // redux-persist snapshot that predates this field — resolves itself once
  // the fresh `GET /budgets` fetch overwrites the persisted state, but the
  // very first render after rehydrate must not crash on it.
  const idCategories = budget.idCategories ?? [];
  if (idCategories.length === 0) {
    return categoryBreakdown.reduce(
      (sum, category) => sum + category.amount,
      0,
    );
  }
  return categoryBreakdown
    .filter(category => idCategories.includes(category.idCategory))
    .reduce((sum, category) => sum + category.amount, 0);
}

/**
 * Builds the breakdown rows for `budget` — one row per scoped expense
 * category (zero-filled from `categories`, not just actual spend), each with
 * its own subcategory rows. An empty `idCategories` scopes to every expense
 * category (e.g. "Monthly Spending"); a non-empty list scopes to just those.
 */
export function buildBudgetSlices(
  budget: Budget,
  categories: Category[],
  categoryBreakdown: TransactionCategoryBreakdown[],
): BudgetSlice[] {
  const expenseCategories = categories.filter(
    category => category.type === 'expense',
  );
  const idCategories = budget.idCategories ?? [];
  const scopedCategories =
    idCategories.length === 0
      ? expenseCategories
      : expenseCategories.filter(category =>
          idCategories.includes(category.idCategory),
        );

  return scopedCategories.map((category): BudgetSlice => {
    const breakdownEntry = categoryBreakdown.find(
      item => item.idCategory === category.idCategory,
    );
    return {
      id: category.idCategory,
      name: category.nameCategory,
      icon: category.icon,
      color: category.color,
      spent: breakdownEntry?.amount ?? 0,
      limit: findLimit(budget.childLimits, category.idCategory, null),
      count: breakdownEntry?.transactionCount ?? 0,
      subSlices: buildSubSlicesForCategory(
        category,
        breakdownEntry,
        budget.childLimits,
      ),
    };
  });
}

/** "ok" < 90% used, "warn" 90–100%, "over" past the limit. */
export type BudgetStatus = 'ok' | 'warn' | 'over';

export interface BudgetProgress {
  /** spent / limit (0 when there's no limit) — may exceed 1. */
  ratio: number;
  /** Rounded percentage for badges. */
  percent: number;
  status: BudgetStatus;
  /** Limit left this month (0 once over). */
  remaining: number;
  /** How far past the limit (0 when within it). */
  overBy: number;
  /** Days left after today. */
  remainingDays: number;
  /** `remaining` spread over the days left; `null` on the last day. */
  dailyPace: number | null;
}

const WARN_RATIO = 0.9;

export function computeBudgetProgress(
  spent: number,
  limit: number,
  range: Pick<CurrentMonthRange, 'daysInMonth' | 'dayOfMonth'>,
): BudgetProgress {
  const ratio = limit > 0 ? spent / limit : 0;
  const remaining = Math.max(0, limit - spent);
  const remainingDays = Math.max(0, range.daysInMonth - range.dayOfMonth);
  return {
    ratio,
    percent: Math.round(ratio * 100),
    status: ratio > 1 ? 'over' : ratio >= WARN_RATIO ? 'warn' : 'ok',
    remaining,
    overBy: Math.max(0, spent - limit),
    remainingDays,
    dailyPace: remainingDays > 0 ? remaining / remainingDays : null,
  };
}
