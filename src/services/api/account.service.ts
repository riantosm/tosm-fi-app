import i18n from '@/i18n';
import {
  axiosInstance,
  getApiErrorMessage,
} from '@/services/api/axiosInstance';

/** Hapus semua data finansial akun (dompet, transaksi, investasi, dst.); akun user tetap ada. */
export async function resetAccountDataApi(): Promise<void> {
  try {
    await axiosInstance.delete('/account/data');
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('settingsDanger.resetError')),
      { cause: error },
    );
  }
}
