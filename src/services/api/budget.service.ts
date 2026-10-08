import i18n from '@/i18n';
import {
  axiosInstance,
  getApiErrorMessage,
} from '@/services/api/axiosInstance';
import type { ApiResponse, Budget, BudgetInput } from '@/types';

export async function getBudgetsApi(): Promise<Budget[]> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<Budget[]>>('/budgets');
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('budget.genericError')), {
      cause: error,
    });
  }
}

export async function createBudgetApi(input: BudgetInput): Promise<Budget> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<Budget>>(
      '/budgets',
      input,
    );
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('budget.genericError')), {
      cause: error,
    });
  }
}

export async function updateBudgetApi(
  idBudget: string,
  patch: Partial<BudgetInput>,
): Promise<Budget> {
  try {
    const { data } = await axiosInstance.patch<ApiResponse<Budget>>(
      `/budgets/${idBudget}`,
      patch,
    );
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('budget.genericError')), {
      cause: error,
    });
  }
}

export async function deleteBudgetApi(idBudget: string): Promise<void> {
  try {
    await axiosInstance.delete(`/budgets/${idBudget}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('budget.genericError')), {
      cause: error,
    });
  }
}

export async function reorderBudgetsApi(
  orderedIds: string[],
): Promise<Budget[]> {
  try {
    const { data } = await axiosInstance.patch<ApiResponse<Budget[]>>(
      '/budgets/reorder',
      { orderedIds },
    );
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('budget.genericError')), {
      cause: error,
    });
  }
}
