import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { resetOnSignOut } from '@/store/slices/resetOnSignOut';
import type { LoadStatus, WalletAccount } from '@/types';

export interface WalletState {
  wallets: WalletAccount[];
  status: LoadStatus;
}

const initialState: WalletState = { wallets: [], status: 'idle' };

/** Dompet milik user (dipakai lintas layar). Saldo dimiliki backend. */
export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletsLoading: state => {
      state.status = 'loading';
    },
    setWallets: (state, action: PayloadAction<WalletAccount[]>) => {
      state.wallets = action.payload;
      state.status = 'loaded';
    },
    setWalletsFailed: state => {
      state.status = 'loaded';
    },
    addWallet: (state, action: PayloadAction<WalletAccount>) => {
      state.wallets.push(action.payload);
    },
    updateWallet: (state, action: PayloadAction<WalletAccount>) => {
      const index = state.wallets.findIndex(
        wallet => wallet.idWallet === action.payload.idWallet,
      );
      if (index !== -1) {
        state.wallets[index] = action.payload;
      }
    },
    removeWallet: (state, action: PayloadAction<string>) => {
      state.wallets = state.wallets.filter(
        wallet => wallet.idWallet !== action.payload,
      );
    },
  },
  extraReducers: builder => resetOnSignOut(builder, initialState),
});

export const {
  setWalletsLoading,
  setWallets,
  setWalletsFailed,
  addWallet,
  updateWallet,
  removeWallet,
} = walletSlice.actions;

export default walletSlice.reducer;
