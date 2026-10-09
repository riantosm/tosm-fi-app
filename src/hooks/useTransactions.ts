import { useCallback } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useWallets } from '@/hooks/useWallets';
import {
  createTransactionApi,
  deleteTransactionApi,
  queryTransactionsApi,
  updateTransactionApi,
} from '@/services/api/transaction.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { bumpTransactionsVersion } from '@/store/slices/transactionSlice';
import type { TransactionInput, TransactionListParams } from '@/types';

/**
 * Query + mutasi transaksi. Daftar tidak disimpan di store: setiap layar mem-fetch jendela
 * datanya sendiri, dan `version` (sinyal mutasi) dipakai sebagai dependency refetch.
 * Setelah mutasi, saldo dompet & hitungan kategori (milik backend) dimuat ulang di latar
 * belakang — form/dialog tidak menunggu sinkron selesai supaya bisa langsung ditutup.
 */
export function useTransactions() {
  const dispatch = useAppDispatch();
  const version = useAppSelector(state => state.transaction.version);
  const { loadWallets } = useWallets({ autoLoad: false });
  const { loadCategories } = useCategories({ autoLoad: false });

  const queryTransactions = useCallback(
    (params: TransactionListParams) => queryTransactionsApi(params),
    [],
  );

  const resync = useCallback(async () => {
    dispatch(bumpTransactionsVersion());
    await Promise.all([loadWallets(), loadCategories()]);
  }, [dispatch, loadWallets, loadCategories]);

  const createTransaction = useCallback(
    async (input: TransactionInput) => {
      const created = await createTransactionApi(input);
      resync();
      return created;
    },
    [resync],
  );

  const editTransaction = useCallback(
    async (idTransaction: string, input: TransactionInput) => {
      const updated = await updateTransactionApi(idTransaction, input);
      resync();
      return updated;
    },
    [resync],
  );

  const deleteTransaction = useCallback(
    async (idTransaction: string) => {
      await deleteTransactionApi(idTransaction);
      resync();
    },
    [resync],
  );

  return {
    version,
    queryTransactions,
    createTransaction,
    editTransaction,
    deleteTransaction,
    resync,
  };
}
