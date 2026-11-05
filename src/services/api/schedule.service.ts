import i18n from '@/i18n';
import {
  axiosInstance,
  getApiErrorMessage,
} from '@/services/api/axiosInstance';
import type {
  ApiResponse,
  Schedule,
  ScheduleInput,
  ScheduleOccurrence,
} from '@/types';

export async function getSchedulesApi(): Promise<Schedule[]> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<Schedule[]>>(
      '/schedules',
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('schedule.genericError')),
      { cause: error },
    );
  }
}

/** `idTransaction` = transaksi asal yang jadi pembayaran jatuh tempo pertama. */
export async function createScheduleApi(
  input: ScheduleInput,
  idTransaction?: string,
): Promise<Schedule> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<Schedule>>(
      '/schedules',
      idTransaction ? { ...input, idTransaction } : input,
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('schedule.genericError')),
      { cause: error },
    );
  }
}

/** Tandai jatuh tempo pertama jadwal sebagai dibayar oleh transaksi yang sudah dicatat. */
export async function linkScheduleTransactionApi(
  idSchedule: string,
  idTransaction: string,
): Promise<ScheduleOccurrence> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<ScheduleOccurrence>>(
      `/schedules/${idSchedule}/link-transaction`,
      { idTransaction },
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('schedule.genericError')),
      { cause: error },
    );
  }
}

export async function updateScheduleApi(
  idSchedule: string,
  input: ScheduleInput,
): Promise<Schedule> {
  try {
    const { data } = await axiosInstance.patch<ApiResponse<Schedule>>(
      `/schedules/${idSchedule}`,
      input,
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('schedule.genericError')),
      { cause: error },
    );
  }
}

export async function setScheduleActiveApi(
  idSchedule: string,
  isActive: boolean,
): Promise<Schedule> {
  try {
    const { data } = await axiosInstance.patch<ApiResponse<Schedule>>(
      `/schedules/${idSchedule}/pause`,
      { isActive },
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('schedule.genericError')),
      { cause: error },
    );
  }
}

export async function deleteScheduleApi(idSchedule: string): Promise<void> {
  try {
    await axiosInstance.delete(`/schedules/${idSchedule}`);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('schedule.genericError')),
      { cause: error },
    );
  }
}
