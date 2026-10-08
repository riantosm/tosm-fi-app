import i18n from '@/i18n';
import {
  axiosInstance,
  getApiErrorMessage,
} from '@/services/api/axiosInstance';
import type {
  ApiResponse,
  InvestmentTimelinesResult,
  InvestmentTransaction,
  InvestmentTransactionListParams,
  InvestmentTransactionListResult,
  MoneyInInput,
  MoneyOutInput,
  NetWorthTimelineParams,
  NetWorthTimelinePoint,
  ProfitLossInput,
  TransferInput,
  UpdateInvestmentTransactionInput,
} from '@/types';

export async function queryInvestmentTransactionsApi(
  params: InvestmentTransactionListParams,
): Promise<InvestmentTransactionListResult> {
  try {
    const { data } = await axiosInstance.get<
      ApiResponse<InvestmentTransactionListResult>
    >('/investment-transactions', { params });
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('investment.genericError')),
      { cause: error },
    );
  }
}

export async function getNetWorthTimelineApi(
  params: NetWorthTimelineParams,
): Promise<NetWorthTimelinePoint[]> {
  try {
    const { data } = await axiosInstance.get<
      ApiResponse<NetWorthTimelinePoint[]>
    >('/investment-transactions/net-worth-timeline', {
      params: {
        granularity: params.granularity,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        locale: params.locale,
        idInstrument: params.idInstrument?.length
          ? params.idInstrument.join(',')
          : undefined,
      },
    });
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('investment.genericError')),
      { cause: error },
    );
  }
}

/** Seri ringkas {date, invested, current} per akun/instrumen untuk sparkline & grafik riwayat. */
export async function getInvestmentTimelinesApi(): Promise<InvestmentTimelinesResult> {
  try {
    const { data } = await axiosInstance.get<
      ApiResponse<InvestmentTimelinesResult>
    >('/investment-transactions/timelines');
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('investment.genericError')),
      { cause: error },
    );
  }
}

export async function createMoneyInApi(
  input: MoneyInInput,
): Promise<InvestmentTransaction> {
  try {
    const { data } = await axiosInstance.post<
      ApiResponse<InvestmentTransaction>
    >('/investment-transactions/in', input);
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('investment.genericError')),
      { cause: error },
    );
  }
}

export async function createMoneyOutApi(
  input: MoneyOutInput,
): Promise<InvestmentTransaction> {
  try {
    const { data } = await axiosInstance.post<
      ApiResponse<InvestmentTransaction>
    >('/investment-transactions/out', input);
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('investment.genericError')),
      { cause: error },
    );
  }
}

export async function createInvestmentTransferApi(
  input: TransferInput,
): Promise<InvestmentTransaction> {
  try {
    const { data } = await axiosInstance.post<
      ApiResponse<InvestmentTransaction>
    >('/investment-transactions/transfer', input);
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('investment.genericError')),
      { cause: error },
    );
  }
}

export async function createProfitLossApi(
  input: ProfitLossInput,
): Promise<InvestmentTransaction> {
  try {
    const { data } = await axiosInstance.post<
      ApiResponse<InvestmentTransaction>
    >('/investment-transactions/pl', input);
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('investment.genericError')),
      { cause: error },
    );
  }
}

export async function updateInvestmentTransactionApi(
  idInvestmentTransaction: string,
  input: UpdateInvestmentTransactionInput,
): Promise<InvestmentTransaction> {
  try {
    const { data } = await axiosInstance.patch<
      ApiResponse<InvestmentTransaction>
    >(`/investment-transactions/${idInvestmentTransaction}`, input);
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('investment.genericError')),
      { cause: error },
    );
  }
}

export async function deleteInvestmentTransactionApi(
  idInvestmentTransaction: string,
): Promise<void> {
  try {
    await axiosInstance.delete(
      `/investment-transactions/${idInvestmentTransaction}`,
    );
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('investment.genericError')),
      { cause: error },
    );
  }
}
