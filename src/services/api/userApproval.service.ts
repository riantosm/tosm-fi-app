import i18n from '@/i18n';
import {
  axiosInstance,
  getApiErrorMessage,
} from '@/services/api/axiosInstance';
import type { ApiResponse, AuthUser, UserPlan } from '@/types';

/** Khusus admin: daftar user (termasuk yang masih pending). */
export async function getUserListApi(): Promise<AuthUser[]> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<AuthUser[]>>(
      '/user/get-list-user',
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('userApproval.genericError')),
      { cause: error },
    );
  }
}

export async function acceptUserApi(idUser: string): Promise<AuthUser> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<AuthUser>>(
      '/user/accept-user',
      { idUser },
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('userApproval.genericError')),
      { cause: error },
    );
  }
}

/** Khusus admin: beri Pro gratis atau kembalikan ke Free. */
export async function setUserPlanApi(
  idUser: string,
  plan: UserPlan,
): Promise<AuthUser> {
  try {
    const { data } = await axiosInstance.patch<ApiResponse<AuthUser>>(
      `/user/${encodeURIComponent(idUser)}/plan`,
      { plan },
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('userApproval.genericError')),
      { cause: error },
    );
  }
}
