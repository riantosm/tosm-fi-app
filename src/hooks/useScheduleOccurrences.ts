import { useCallback, useEffect } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import {
  cancelOccurrenceApi,
  getPendingOccurrencesApi,
  payOccurrenceApi,
} from '@/services/api/scheduleOccurrence.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setOccurrences,
  setOccurrencesFailed,
  setOccurrencesLoading,
} from '@/store/slices/scheduleOccurrenceSlice';
import type { PayOccurrenceInput } from '@/types';

/** Tagihan jadwal yang menunggu dibayar + aksi bayar/batal. */
export function useScheduleOccurrences({
  autoLoad = true,
}: { autoLoad?: boolean } = {}) {
  const dispatch = useAppDispatch();
  const occurrences = useAppSelector(
    state => state.scheduleOccurrence.occurrences,
  );
  const status = useAppSelector(state => state.scheduleOccurrence.status);
  const { resync } = useTransactions();

  const loadPendingOccurrences = useCallback(async () => {
    dispatch(setOccurrencesLoading());
    try {
      dispatch(setOccurrences(await getPendingOccurrencesApi()));
    } catch {
      dispatch(setOccurrencesFailed());
    }
  }, [dispatch]);

  useEffect(() => {
    if (autoLoad && status === 'idle') {
      loadPendingOccurrences();
    }
  }, [autoLoad, status, loadPendingOccurrences]);

  /** Bayar → transaksi tercatat; daftar tagihan & saldo dimuat ulang. */
  const payOccurrence = useCallback(
    async (idOccurrence: string, input: PayOccurrenceInput) => {
      const result = await payOccurrenceApi(idOccurrence, input);
      dispatch(
        setOccurrences(
          occurrences.filter(o => o.idOccurrence !== idOccurrence),
        ),
      );
      await resync();
      return result;
    },
    [dispatch, occurrences, resync],
  );

  const cancelOccurrence = useCallback(
    async (idOccurrence: string) => {
      await cancelOccurrenceApi(idOccurrence);
      dispatch(
        setOccurrences(
          occurrences.filter(o => o.idOccurrence !== idOccurrence),
        ),
      );
    },
    [dispatch, occurrences],
  );

  return {
    occurrences,
    status,
    loadPendingOccurrences,
    payOccurrence,
    cancelOccurrence,
  };
}
