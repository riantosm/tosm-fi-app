import i18n from '@/i18n';
import {
  axiosInstance,
  getApiErrorMessage,
} from '@/services/api/axiosInstance';
import type {
  ApiResponse,
  ClientError,
  ClientErrorInput,
  ClientErrorListParams,
} from '@/types';

/**
 * Sengaja tanpa try/catch + pesan terjemahan: pemanggil (crash logger) selalu membungkusnya
 * dengan `.catch()` — melaporkan crash tidak boleh ikut melempar error baru.
 */
export async function reportClientErrorApi(
  input: ClientErrorInput,
): Promise<void> {
  await axiosInstance.post('/errors', input);
}

export async function getClientErrorsApi(
  params: ClientErrorListParams = {},
): Promise<ClientError[]> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<ClientError[]>>(
      '/errors',
      { params },
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('errorLog.genericError')),
      { cause: error },
    );
  }
}

export async function deleteClientErrorApi(
  idClientError: string,
): Promise<void> {
  try {
    await axiosInstance.delete(`/errors/${idClientError}`);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('errorLog.genericError')),
      { cause: error },
    );
  }
}
