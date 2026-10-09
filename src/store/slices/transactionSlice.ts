import { createSlice } from '@reduxjs/toolkit';
import { resetOnSignOut } from '@/store/slices/resetOnSignOut';

export interface TransactionState {
  /**
   * Sinyal mutasi: naik setiap kali transaksi/ledger dibuat, diubah, atau dihapus di mana pun.
   * Layar yang mem-fetch data transaksi sendiri (Dashboard, Transaksi, Budget, Laporan)
   * menjadikannya dependency untuk refetch. Daftar transaksi TIDAK disimpan di store.
   */
  version: number;
  /** Sinyal mutasi ledger investasi (setor, tarik, transfer, update nilai, edit, hapus). */
  investmentVersion: number;
}

const initialState: TransactionState = { version: 0, investmentVersion: 0 };

export const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    bumpTransactionsVersion: state => {
      state.version += 1;
    },
    bumpInvestmentVersion: state => {
      state.investmentVersion += 1;
    },
  },
  extraReducers: builder => resetOnSignOut(builder, initialState),
});

export const { bumpTransactionsVersion, bumpInvestmentVersion } =
  transactionSlice.actions;

export default transactionSlice.reducer;
