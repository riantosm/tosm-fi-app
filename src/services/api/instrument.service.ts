import i18n from '@/i18n';
import {
  axiosInstance,
  getApiErrorMessage,
} from '@/services/api/axiosInstance';
import type {
  ApiResponse,
  Instrument,
  InstrumentInput,
  InvestmentAccount,
  InvestmentAccountInput,
} from '@/types';

export async function getInstrumentsApi(): Promise<Instrument[]> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<Instrument[]>>(
      '/instruments',
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('investment.genericError')),
      { cause: error },
    );
  }
}

export async function createInstrumentApi(
  input: InstrumentInput,
): Promise<Instrument> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<Instrument>>(
      '/instruments',
      input,
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('investment.genericError')),
      { cause: error },
    );
  }
}

export async function updateInstrumentApi(
  idInstrument: string,
  input: InstrumentInput,
): Promise<Instrument> {
  try {
    const { data } = await axiosInstance.patch<ApiResponse<Instrument>>(
      `/instruments/${idInstrument}`,
      input,
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('investment.genericError')),
      { cause: error },
    );
  }
}

export async function deleteInstrumentApi(idInstrument: string): Promise<void> {
  try {
    await axiosInstance.delete(`/instruments/${idInstrument}`);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('investment.genericError')),
      { cause: error },
    );
  }
}

export async function createInvestmentAccountApi(
  idInstrument: string,
  input: InvestmentAccountInput,
): Promise<InvestmentAccount> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<InvestmentAccount>>(
      `/instruments/${idInstrument}/accounts`,
      input,
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('investment.genericError')),
      { cause: error },
    );
  }
}

export async function updateInvestmentAccountApi(
  idInstrument: string,
  idInvestmentAccount: string,
  input: InvestmentAccountInput,
): Promise<InvestmentAccount> {
  try {
    const { data } = await axiosInstance.patch<ApiResponse<InvestmentAccount>>(
      `/instruments/${idInstrument}/accounts/${idInvestmentAccount}`,
      input,
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('investment.genericError')),
      { cause: error },
    );
  }
}

export async function deleteInvestmentAccountApi(
  idInstrument: string,
  idInvestmentAccount: string,
): Promise<void> {
  try {
    await axiosInstance.delete(
      `/instruments/${idInstrument}/accounts/${idInvestmentAccount}`,
    );
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('investment.genericError')),
      { cause: error },
    );
  }
}
