import { useCallback } from 'react';
import { useInstruments } from '@/hooks/useInstruments';
import { useWallets } from '@/hooks/useWallets';
import {
  createInvestmentTransferApi,
  createMoneyInApi,
  createMoneyOutApi,
  createProfitLossApi,
  deleteInvestmentTransactionApi,
  getInvestmentTimelinesApi,
  queryInvestmentTransactionsApi,
  updateInvestmentTransactionApi,
} from '@/services/api/investmentTransaction.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  bumpInvestmentVersion,
  bumpTransactionsVersion,
} from '@/store/slices/transactionSlice';
import type {
  InvestmentTransactionListParams,
  MoneyInInput,
  MoneyOutInput,
  ProfitLossInput,
  TransferInput,
  UpdateInvestmentTransactionInput,
} from '@/types';

/**
 * Query + mutasi ledger investasi. Daftar tidak disimpan di store; `version` (sinyal mutasi)
 * dipakai layar sebagai dependency refetch. Setelah mutasi, instrumen (nilai/modal akun)
 * dimuat ulang di latar belakang; mutasi yang bisa menyentuh transaksi dompet juga menaikkan sinyal transaksi.
 */
export function useInvestmentTransactions() {
  const dispatch = useAppDispatch();
  const version = useAppSelector(state => state.transaction.investmentVersion);
  const { loadInstruments } = useInstruments({ autoLoad: false });
  const { loadWallets } = useWallets({ autoLoad: false });

  const queryInvestmentTransactions = useCallback(
    (params: InvestmentTransactionListParams) =>
      queryInvestmentTransactionsApi(params),
    [],
  );

  const fetchTimelines = useCallback(() => getInvestmentTimelinesApi(), []);

  // Tidak ditunggu: form langsung ditutup, nilai akun menyusul saat instrumen selesai dimuat.
  const afterMutation = useCallback(
    (touchesWallet: boolean) => {
      dispatch(bumpInvestmentVersion());
      if (touchesWallet) {
        dispatch(bumpTransactionsVersion());
        loadWallets();
      }
      loadInstruments();
    },
    [dispatch, loadInstruments, loadWallets],
  );

  const createMoneyIn = useCallback(
    async (input: MoneyInInput) => {
      const created = await createMoneyInApi(input);
      afterMutation(false);
      return created;
    },
    [afterMutation],
  );

  const createMoneyOut = useCallback(
    async (input: MoneyOutInput) => {
      const created = await createMoneyOutApi(input);
      afterMutation(input.idTransaction !== null);
      return created;
    },
    [afterMutation],
  );

  const createTransfer = useCallback(
    async (input: TransferInput) => {
      const created = await createInvestmentTransferApi(input);
      afterMutation(false);
      return created;
    },
    [afterMutation],
  );

  const createProfitLoss = useCallback(
    async (input: ProfitLossInput) => {
      const created = await createProfitLossApi(input);
      afterMutation(false);
      return created;
    },
    [afterMutation],
  );

  const editInvestmentTransaction = useCallback(
    async (id: string, input: UpdateInvestmentTransactionInput) => {
      const updated = await updateInvestmentTransactionApi(id, input);
      afterMutation(updated.idTransaction !== null);
      return updated;
    },
    [afterMutation],
  );

  const deleteInvestmentTransaction = useCallback(
    async (id: string, linkedToWallet: boolean) => {
      await deleteInvestmentTransactionApi(id);
      afterMutation(linkedToWallet);
    },
    [afterMutation],
  );

  return {
    version,
    queryInvestmentTransactions,
    fetchTimelines,
    createMoneyIn,
    createMoneyOut,
    createTransfer,
    createProfitLoss,
    editInvestmentTransaction,
    deleteInvestmentTransaction,
  };
}
