import { useCallback, useEffect } from 'react';
import {
  createInstrumentApi,
  createInvestmentAccountApi,
  deleteInstrumentApi,
  deleteInvestmentAccountApi,
  getInstrumentsApi,
  updateInstrumentApi,
  updateInvestmentAccountApi,
} from '@/services/api/instrument.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addInstrument,
  removeInstrument,
  setInstruments,
  setInstrumentsFailed,
  setInstrumentsLoading,
  updateInstrument,
  upsertInvestmentAccount,
} from '@/store/slices/instrumentSlice';
import type { InstrumentInput, InvestmentAccountInput } from '@/types';

/** Instrumen investasi + akunnya dari store, beserta mutasinya. */
export function useInstruments({
  autoLoad = true,
}: { autoLoad?: boolean } = {}) {
  const dispatch = useAppDispatch();
  const instruments = useAppSelector(state => state.instrument.instruments);
  const status = useAppSelector(state => state.instrument.status);

  const loadInstruments = useCallback(async () => {
    dispatch(setInstrumentsLoading());
    try {
      dispatch(setInstruments(await getInstrumentsApi()));
    } catch {
      dispatch(setInstrumentsFailed());
    }
  }, [dispatch]);

  useEffect(() => {
    if (autoLoad && status === 'idle') {
      loadInstruments();
    }
  }, [autoLoad, status, loadInstruments]);

  const createInstrument = useCallback(
    async (input: InstrumentInput) => {
      const created = await createInstrumentApi(input);
      dispatch(addInstrument(created));
      return created;
    },
    [dispatch],
  );

  const editInstrument = useCallback(
    async (idInstrument: string, input: InstrumentInput) => {
      dispatch(
        updateInstrument(await updateInstrumentApi(idInstrument, input)),
      );
    },
    [dispatch],
  );

  const deleteInstrument = useCallback(
    async (idInstrument: string) => {
      await deleteInstrumentApi(idInstrument);
      dispatch(removeInstrument(idInstrument));
    },
    [dispatch],
  );

  const createInvestmentAccount = useCallback(
    async (idInstrument: string, input: InvestmentAccountInput) => {
      const created = await createInvestmentAccountApi(idInstrument, input);
      dispatch(upsertInvestmentAccount(created));
      return created;
    },
    [dispatch],
  );

  const editInvestmentAccount = useCallback(
    async (
      idInstrument: string,
      idInvestmentAccount: string,
      input: InvestmentAccountInput,
    ) => {
      const updated = await updateInvestmentAccountApi(
        idInstrument,
        idInvestmentAccount,
        input,
      );
      dispatch(upsertInvestmentAccount(updated));
    },
    [dispatch],
  );

  /** Akun di-soft-delete di backend (label riwayat tetap ada) → muat ulang daftarnya. */
  const deleteInvestmentAccount = useCallback(
    async (idInstrument: string, idInvestmentAccount: string) => {
      await deleteInvestmentAccountApi(idInstrument, idInvestmentAccount);
      dispatch(setInstruments(await getInstrumentsApi()));
    },
    [dispatch],
  );

  return {
    instruments,
    status,
    loadInstruments,
    createInstrument,
    editInstrument,
    deleteInstrument,
    createInvestmentAccount,
    editInvestmentAccount,
    deleteInvestmentAccount,
  };
}
