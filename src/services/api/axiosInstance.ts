import axios from 'axios';
import { DeviceEventEmitter } from 'react-native';
import Config from 'react-native-config';
import {
  PLAN_LIMIT_CODE,
  PLAN_LIMIT_EVENT,
  type PlanLimitEventDetail,
} from '@/constants/plans';
import { store } from '@/store';
import { onSessionExpired } from '@/store/slices/authSlice';

export const axiosInstance = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 20000,
});

axiosInstance.interceptors.request.use(config => {
  const { token } = store.getState().auth;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // GET yang di-scope tanggal (transaksi, laporan, investasi) butuh offset zona waktu
  // lokal supaya batas bulan/hari dihitung lokal, bukan UTC (tosm-fi-be: utils/timezone.ts).
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      tzOffsetMinutes: new Date().getTimezoneOffset(),
    };
  }
  return config;
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // 401 = token hilang/invalid/kedaluwarsa. Auto-logout hanya kalau memang sedang login;
    // 401 dari request login itu sendiri (password salah) ditangani pemanggilnya.
    const isUnauthorized =
      axios.isAxiosError(error) && error.response?.status === 401;
    if (isUnauthorized && store.getState().auth.isLogin) {
      store.dispatch(onSessionExpired());
    }
    // 403 PLAN_LIMIT = batas paket Free menahan request; UpgradeContext membuka sheet
    // Upgrade. Pemanggil tetap menerima error (toast biasanya).
    const body = axios.isAxiosError(error) ? error.response?.data : undefined;
    if (
      error.response?.status === 403 &&
      body?.data?.code === PLAN_LIMIT_CODE
    ) {
      const detail: PlanLimitEventDetail = {
        feature: body.data.feature,
        message: body.message,
      };
      DeviceEventEmitter.emit(PLAN_LIMIT_EVENT, detail);
    }
    return Promise.reject(error);
  },
);

/** Ambil `message` dari envelope error backend, atau fallback. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') {
      return message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
