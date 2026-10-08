import i18n from '@/i18n';
import {
  axiosInstance,
  getApiErrorMessage,
} from '@/services/api/axiosInstance';
import type {
  ApiResponse,
  AuthUser,
  ChangePasswordInput,
  LoginCredentials,
  LoginResponse,
  RegisterInput,
  UpdateProfileInput,
} from '@/types';

export async function registerApi(input: RegisterInput): Promise<AuthUser> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<AuthUser>>(
      '/auth/register',
      input,
    );
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('auth.genericError')), {
      cause: error,
    });
  }
}

export async function loginApi(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      credentials,
    );
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('auth.genericError')), {
      cause: error,
    });
  }
}

/** Token dikirim eksplisit karena dipanggil sebelum token masuk ke store (alur login). */
export async function getMeApi(token?: string): Promise<AuthUser> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<AuthUser>>(
      '/user/me',
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
    );
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('auth.genericError')), {
      cause: error,
    });
  }
}

/** Harus dipanggil sebelum token dihapus dari store (interceptor yang memasang token). */
export async function logoutApi(): Promise<void> {
  await axiosInstance.post('/auth/logout');
}

export async function updateProfileApi(
  input: UpdateProfileInput,
): Promise<AuthUser> {
  try {
    const { data } = await axiosInstance.patch<ApiResponse<AuthUser>>(
      '/user/me',
      input,
    );
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('profile.genericError')), {
      cause: error,
    });
  }
}

export async function changePasswordApi(
  input: ChangePasswordInput,
): Promise<void> {
  try {
    await axiosInstance.patch('/user/me/password', input);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('profile.genericError')), {
      cause: error,
    });
  }
}
