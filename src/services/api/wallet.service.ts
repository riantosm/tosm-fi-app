import i18n from '@/i18n';
import {
  axiosInstance,
  getApiErrorMessage,
} from '@/services/api/axiosInstance';
import type { ApiResponse, WalletAccount, WalletInput } from '@/types';

export async function getWalletsApi(): Promise<WalletAccount[]> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<WalletAccount[]>>(
      '/wallets',
    );
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('wallet.genericError')), {
      cause: error,
    });
  }
}

export async function createWalletApi(
  input: WalletInput,
): Promise<WalletAccount> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<WalletAccount>>(
      '/wallets',
      input,
    );
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('wallet.genericError')), {
      cause: error,
    });
  }
}

/** Saldo tidak ikut dikirim — hanya nama & warna yang bisa diubah (saldo lewat koreksi). */
export async function updateWalletApi(
  id: string,
  input: WalletInput,
): Promise<WalletAccount> {
  try {
    const { data } = await axiosInstance.patch<ApiResponse<WalletAccount>>(
      `/wallets/${id}`,
      { nameWallet: input.nameWallet, color: input.color },
    );
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('wallet.genericError')), {
      cause: error,
    });
  }
}

export async function deleteWalletApi(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`/wallets/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('wallet.genericError')), {
      cause: error,
    });
  }
}

export async function setPrimaryWalletApi(
  id: string,
): Promise<WalletAccount[]> {
  try {
    const { data } = await axiosInstance.patch<ApiResponse<WalletAccount[]>>(
      `/wallets/${id}/primary`,
    );
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('wallet.genericError')), {
      cause: error,
    });
  }
}

export async function reorderWalletsApi(
  orderedIds: string[],
): Promise<WalletAccount[]> {
  try {
    const { data } = await axiosInstance.patch<ApiResponse<WalletAccount[]>>(
      '/wallets/reorder',
      { orderedIds },
    );
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('wallet.genericError')), {
      cause: error,
    });
  }
}
