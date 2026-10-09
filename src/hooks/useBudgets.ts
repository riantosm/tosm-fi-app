import { useCallback, useEffect } from 'react';
import {
  createBudgetApi,
  deleteBudgetApi,
  getBudgetsApi,
  reorderBudgetsApi,
  updateBudgetApi,
} from '@/services/api/budget.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addBudget,
  removeBudget,
  setBudgets,
  setBudgetsFailed,
  setBudgetsLoading,
  updateBudget,
} from '@/store/slices/budgetSlice';
import type { BudgetInput } from '@/types';

/** Budget bulanan dari store + mutasinya. Memuat otomatis sekali saat status masih `idle`. */
export function useBudgets({ autoLoad = true }: { autoLoad?: boolean } = {}) {
  const dispatch = useAppDispatch();
  const budgets = useAppSelector(state => state.budget.budgets);
  const status = useAppSelector(state => state.budget.status);

  const loadBudgets = useCallback(async () => {
    dispatch(setBudgetsLoading());
    try {
      dispatch(setBudgets(await getBudgetsApi()));
    } catch {
      dispatch(setBudgetsFailed());
    }
  }, [dispatch]);

  useEffect(() => {
    if (autoLoad && status === 'idle') {
      loadBudgets();
    }
  }, [autoLoad, status, loadBudgets]);

  const createBudget = useCallback(
    async (input: BudgetInput) => {
      const created = await createBudgetApi(input);
      dispatch(addBudget(created));
      return created;
    },
    [dispatch],
  );

  /** Patch sebagian (mis. hanya `isPinned` atau `childLimits`). */
  const editBudget = useCallback(
    async (idBudget: string, patch: Partial<BudgetInput>) => {
      const updated = await updateBudgetApi(idBudget, patch);
      dispatch(updateBudget(updated));
      return updated;
    },
    [dispatch],
  );

  const deleteBudget = useCallback(
    async (idBudget: string) => {
      await deleteBudgetApi(idBudget);
      dispatch(removeBudget(idBudget));
    },
    [dispatch],
  );

  const reorderBudgets = useCallback(
    async (orderedIds: string[]) => {
      dispatch(setBudgets(await reorderBudgetsApi(orderedIds)));
    },
    [dispatch],
  );

  /** Limit 0 mengembalikan baris ke "belum ada limit" (bukan batas nol). */
  const setChildLimit = useCallback(
    async (
      idBudget: string,
      idCategory: string,
      idSubCategory: string | null,
      limitAmount: number,
    ) => {
      const budget = budgets.find(item => item.idBudget === idBudget);
      if (!budget) {
        return;
      }
      const withoutExisting = budget.childLimits.filter(
        limit =>
          !(
            limit.idCategory === idCategory &&
            limit.idSubCategory === idSubCategory
          ),
      );
      const childLimits =
        limitAmount > 0
          ? [...withoutExisting, { idCategory, idSubCategory, limitAmount }]
          : withoutExisting;
      return editBudget(idBudget, { childLimits });
    },
    [budgets, editBudget],
  );

  return {
    budgets,
    status,
    loadBudgets,
    createBudget,
    editBudget,
    deleteBudget,
    reorderBudgets,
    setChildLimit,
  };
}
