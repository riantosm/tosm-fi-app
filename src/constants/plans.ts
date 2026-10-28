import type { PlanFeature, PlanLimits, UserPlan } from '@/types';

/**
 * Salinan PLAN_LIMITS tosm-fi-be (dan web `constants/plans.ts`), dipakai sebelum
 * `/user/me/plan` termuat. Backend tetap yang menentukan; jaga ketiganya sama.
 */
export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free: {
    wallets: 3,
    categories: 10,
    budgets: 1,
    schedules: 3,
    instruments: 1,
    aiMessagesPerMonth: 20,
    subCategories: false,
    receiptScan: false,
    monthlyTrend: false,
    customReportRange: false,
    exportPdfExcel: false,
    reportMonthsBack: 1,
  },
  pro: {
    wallets: null,
    categories: null,
    budgets: null,
    schedules: null,
    instruments: null,
    aiMessagesPerMonth: 100,
    subCategories: true,
    receiptScan: true,
    monthlyTrend: true,
    customReportRange: true,
    exportPdfExcel: true,
    reportMonthsBack: null,
  },
};

export const PRO_LIFETIME_PRICE = 149000;
/** Harga coret di samping harga peluncuran. */
export const PRO_LIFETIME_LIST_PRICE = 199000;

/** `data.code` dari 403 backend saat batas paket Free menahan request. */
export const PLAN_LIMIT_CODE = 'PLAN_LIMIT';
/** Event DeviceEventEmitter dari axiosInstance untuk 403 PLAN_LIMIT (lihat UpgradeContext). */
export const PLAN_LIMIT_EVENT = 'tosmfi:plan-limit';

export interface PlanLimitEventDetail {
  feature?: PlanFeature;
  message?: string;
}

/** Harga paket selalu IDR, apa pun mata uang tampilan: "Rp149.000". */
export const formatRupiah = (amount: number): string =>
  `Rp${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(
    amount,
  )}`;
