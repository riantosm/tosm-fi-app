import { navigationRef } from '@/navigation/navigationRef';
import { ROUTES } from '@/navigation/paths';
import type { Transaction } from '@/types';

/** Buka transaksi dari daftar: koreksi saldo → sheet Koreksi saldo, lainnya → form transaksi. */
export function openTransaction(transaction: Transaction) {
  if (!navigationRef.isReady()) {
    return;
  }
  if (transaction.type === 'correction') {
    if (transaction.idWallet) {
      navigationRef.navigate(ROUTES.BALANCE_CORRECTION, {
        idWallet: transaction.idWallet,
        transaction,
      });
    }
    return;
  }
  navigationRef.navigate(ROUTES.TRANSACTION_FORM, { transaction });
}
