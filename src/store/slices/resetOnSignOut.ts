import { createAction, type ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { onLogout, onSessionExpired } from '@/store/slices/authSlice';

/** Reset Data (Zona Berbahaya): data akun di server dihapus, sesi tetap login. */
export const accountDataReset = createAction('account/dataReset');

/**
 * Data domain milik akun: dikosongkan saat logout / sesi berakhir / Reset Data. Status kembali
 * `idle`, jadi hook dengan `autoLoad` memuat ulang dari server.
 */
export function resetOnSignOut<S>(
  builder: ActionReducerMapBuilder<S>,
  initialState: S,
) {
  builder
    .addCase(onLogout, () => initialState)
    .addCase(onSessionExpired, () => initialState)
    .addCase(accountDataReset, () => initialState);
}
