import i18n from '@/i18n';
import {
  axiosInstance,
  getApiErrorMessage,
} from '@/services/api/axiosInstance';
import type {
  ApiResponse,
  PayOccurrenceInput,
  PayOccurrenceResult,
  ScheduleOccurrence,
} from '@/types';

export async function getPendingOccurrencesApi(): Promise<
  ScheduleOccurrence[]
> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<ScheduleOccurrence[]>>(
      '/schedules/occurrences',
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('schedule.genericError')),
      { cause: error },
    );
  }
}

export async function payOccurrenceApi(
  idOccurrence: string,
  input: PayOccurrenceInput,
): Promise<PayOccurrenceResult> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<PayOccurrenceResult>>(
      `/schedules/occurrences/${idOccurrence}/pay`,
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

export async function cancelOccurrenceApi(
  idOccurrence: string,
): Promise<ScheduleOccurrence> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<ScheduleOccurrence>>(
      `/schedules/occurrences/${idOccurrence}/cancel`,
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('schedule.genericError')),
      { cause: error },
    );
  }
}
