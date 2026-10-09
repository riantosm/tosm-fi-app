import { useCallback, useEffect } from 'react';
import {
  createWalletApi,
  deleteWalletApi,
  getWalletsApi,
  reorderWalletsApi,
  setPrimaryWalletApi,
  updateWalletApi,
} from '@/services/api/wallet.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addWallet,
  removeWallet,
  setWallets,
  setWalletsFailed,
  setWalletsLoading,
  updateWallet,
} from '@/store/slices/walletSlice';
import type { WalletInput } from '@/types';

/** Dompet user dari store. Memuat otomatis sekali saat status masih `idle`. */
export function useWallets({ autoLoad = true }: { autoLoad?: boolean } = {}) {
  const dispatch = useAppDispatch();
  const wallets = useAppSelector(state => state.wallet.wallets);
  const status = useAppSelector(state => state.wallet.status);

  const loadWallets = useCallback(async () => {
    dispatch(setWalletsLoading());
    try {
      dispatch(setWallets(await getWalletsApi()));
    } catch {
      dispatch(setWalletsFailed());
    }
  }, [dispatch]);

  useEffect(() => {
    if (autoLoad && status === 'idle') {
      loadWallets();
    }
  }, [autoLoad, status, loadWallets]);

  const createWallet = useCallback(
    async (input: WalletInput) => {
      dispatch(addWallet(await createWalletApi(input)));
    },
    [dispatch],
  );

  /** Hanya nama & warna; saldo diubah lewat koreksi saldo. */
  const editWallet = useCallback(
    async (idWallet: string, input: WalletInput) => {
      dispatch(updateWallet(await updateWalletApi(idWallet, input)));
    },
    [dispatch],
  );

  const deleteWallet = useCallback(
    async (idWallet: string) => {
      await deleteWalletApi(idWallet);
      dispatch(removeWallet(idWallet));
    },
    [dispatch],
  );

  /** Jadikan dompet utama; backend mengembalikan daftar dompet terbaru. */
  const setPrimaryWallet = useCallback(
    async (idWallet: string) => {
      dispatch(setWallets(await setPrimaryWalletApi(idWallet)));
    },
    [dispatch],
  );

  /** Simpan urutan baru (dipakai di semua pilihan dompet). */
  const reorderWallets = useCallback(
    async (orderedIds: string[]) => {
      dispatch(setWallets(await reorderWalletsApi(orderedIds)));
    },
    [dispatch],
  );

  return {
    wallets,
    status,
    loadWallets,
    createWallet,
    editWallet,
    deleteWallet,
    setPrimaryWallet,
    reorderWallets,
  };
}
