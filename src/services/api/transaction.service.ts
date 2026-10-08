import i18n from '@/i18n';
import {
  axiosInstance,
  getApiErrorMessage,
} from '@/services/api/axiosInstance';
import type {
  ApiResponse,
  Transaction,
  TransactionInput,
  TransactionListParams,
  TransactionListResult,
} from '@/types';

export async function queryTransactionsApi(
  params: TransactionListParams,
): Promise<TransactionListResult> {
  try {
    const { data } = await axiosInstance.get<
      ApiResponse<TransactionListResult>
    >('/transactions', { params });
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('transaction.genericError')),
      { cause: error },
    );
  }
}

export async function createTransactionApi(
  input: TransactionInput,
): Promise<Transaction> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<Transaction>>(
      '/transactions',
      input,
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('transaction.genericError')),
      { cause: error },
    );
  }
}

export async function updateTransactionApi(
  idTransaction: string,
  input: TransactionInput,
): Promise<Transaction> {
  try {
    const { data } = await axiosInstance.patch<ApiResponse<Transaction>>(
      `/transactions/${idTransaction}`,
      input,
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('transaction.genericError')),
      { cause: error },
    );
  }
}

export async function deleteTransactionApi(
  idTransaction: string,
): Promise<void> {
  try {
    await axiosInstance.delete(`/transactions/${idTransaction}`);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('transaction.genericError')),
      { cause: error },
    );
  }
}
