import i18n from '@/i18n';
import {
  axiosInstance,
  getApiErrorMessage,
} from '@/services/api/axiosInstance';
import type {
  ApiResponse,
  PaymentOrderStatus,
  PlanInfo,
  ProCheckout,
} from '@/types';

export async function getPlanInfoApi(): Promise<PlanInfo> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<PlanInfo>>(
      '/user/me/plan',
    );
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('plan.genericError')), {
      cause: error,
    });
  }
}

/** Pro Lifetime (sekali bayar) lewat Midtrans Snap; order pending < 23 jam dipakai ulang. */
export async function checkoutProApi(): Promise<ProCheckout> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<ProCheckout>>(
      '/payments/pro/checkout',
    );
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('plan.checkoutError')), {
      cause: error,
    });
  }
}

/** Backend juga menarik status dari Midtrans, jadi ini cukup untuk tahu sudah dibayar. */
export async function getPaymentOrderStatusApi(
  orderId: string,
): Promise<PaymentOrderStatus> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<PaymentOrderStatus>>(
      `/payments/orders/${encodeURIComponent(orderId)}`,
    );
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, i18n.t('plan.genericError')), {
      cause: error,
    });
  }
}
