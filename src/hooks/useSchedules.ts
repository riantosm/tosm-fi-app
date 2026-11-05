import { useCallback, useEffect } from 'react';
import { useScheduleOccurrences } from '@/hooks/useScheduleOccurrences';
import {
  createScheduleApi,
  deleteScheduleApi,
  getSchedulesApi,
  linkScheduleTransactionApi,
  setScheduleActiveApi,
  updateScheduleApi,
} from '@/services/api/schedule.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addSchedule,
  removeSchedule,
  setSchedules,
  setSchedulesFailed,
  setSchedulesLoading,
  updateSchedule,
} from '@/store/slices/scheduleSlice';
import type { ScheduleInput } from '@/types';

/**
 * Jadwal berulang dari store + mutasinya. Setelah mutasi, tagihan tertunda (Dashboard &
 * Transaksi) dimuat ulang di latar belakang karena backend bisa menambah/menghapus tagihan.
 */
export function useSchedules({ autoLoad = true }: { autoLoad?: boolean } = {}) {
  const dispatch = useAppDispatch();
  const schedules = useAppSelector(state => state.schedule.schedules);
  const status = useAppSelector(state => state.schedule.status);
  const { loadPendingOccurrences } = useScheduleOccurrences({
    autoLoad: false,
  });

  const loadSchedules = useCallback(async () => {
    dispatch(setSchedulesLoading());
    try {
      dispatch(setSchedules(await getSchedulesApi()));
    } catch {
      dispatch(setSchedulesFailed());
    }
  }, [dispatch]);

  useEffect(() => {
    if (autoLoad && status === 'idle') {
      loadSchedules();
    }
  }, [autoLoad, status, loadSchedules]);

  const createSchedule = useCallback(
    async (input: ScheduleInput, idTransaction?: string) => {
      const created = await createScheduleApi(input, idTransaction);
      dispatch(addSchedule(created));
      loadPendingOccurrences();
      return created;
    },
    [dispatch, loadPendingOccurrences],
  );

  const editSchedule = useCallback(
    async (idSchedule: string, input: ScheduleInput) => {
      const updated = await updateScheduleApi(idSchedule, input);
      dispatch(updateSchedule(updated));
      loadPendingOccurrences();
      return updated;
    },
    [dispatch, loadPendingOccurrences],
  );

  const setScheduleActive = useCallback(
    async (idSchedule: string, isActive: boolean) => {
      const updated = await setScheduleActiveApi(idSchedule, isActive);
      dispatch(updateSchedule(updated));
      loadPendingOccurrences();
      return updated;
    },
    [dispatch, loadPendingOccurrences],
  );

  const deleteSchedule = useCallback(
    async (idSchedule: string) => {
      await deleteScheduleApi(idSchedule);
      dispatch(removeSchedule(idSchedule));
      loadPendingOccurrences();
    },
    [dispatch, loadPendingOccurrences],
  );

  const linkTransaction = useCallback(
    async (idSchedule: string, idTransaction: string) => {
      await linkScheduleTransactionApi(idSchedule, idTransaction);
      loadPendingOccurrences();
    },
    [loadPendingOccurrences],
  );

  return {
    schedules,
    status,
    loadSchedules,
    createSchedule,
    linkTransaction,
    editSchedule,
    setScheduleActive,
    deleteSchedule,
  };
}
