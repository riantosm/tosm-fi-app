import type {
  Instrument,
  InvestmentAccount,
  NetWorthTimelineGranularity,
  TimelinePoint,
} from '@/types';
import { toIntlLocale } from '@/utils/locale';
import { toIsoDateString } from '@/utils/month';
import { dateTimeFormat, numberFormat } from '@/utils/intl';

export interface InvestmentTotals {
  investedAmount: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

/** Total modal/nilai/P-L akun aktif (akun ter-soft-delete tidak dihitung). */
export function sumInvestmentAccounts(
  accounts: InvestmentAccount[],
): InvestmentTotals {
  const active = accounts.filter(account => !account.isDeleted);
  const investedAmount = active.reduce(
    (sum, account) => sum + (account.investedAmount ?? 0),
    0,
  );
  const currentValue = active.reduce(
    (sum, account) => sum + (account.currentValue ?? 0),
    0,
  );
  const profitLoss = currentValue - investedAmount;
  return {
    investedAmount,
    currentValue,
    profitLoss,
    profitLossPercent:
      investedAmount === 0 ? 0 : (profitLoss / investedAmount) * 100,
  };
}

export const getInstrumentTotals = (instrument: Instrument) =>
  sumInvestmentAccounts(instrument.investmentAccounts);

export const getPortfolioTotals = (instruments: Instrument[]) =>
  sumInvestmentAccounts(instruments.flatMap(item => item.investmentAccounts));

export const activeAccounts = (instrument: Instrument) =>
  instrument.investmentAccounts.filter(account => !account.isDeleted);

/** "8,4%" (nilai absolut — tanda ▲/▼ atau +/− ditambahkan pemanggil). */
export function formatPercent(value: number, language: string): string {
  const formatted = numberFormat(toIntlLocale(language), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(value));
  return `${formatted}%`;
}

/**
 * Menjumlahkan beberapa seri running-total (satu per akun) jadi satu seri. Tiap seri berupa
 * fungsi tangga, jadi jumlah di satu titik = jumlah nilai terakhir tiap seri sampai titik itu.
 */
export function sumTimelines(series: TimelinePoint[][]): TimelinePoint[] {
  if (series.length === 0) {
    return [];
  }
  if (series.length === 1) {
    return series[0];
  }
  const events = series
    .flatMap((points, seriesIndex) =>
      points.map((point, order) => ({
        point,
        seriesIndex,
        order,
        time: new Date(point.date).getTime(),
      })),
    )
    .sort(
      (a, b) =>
        a.time - b.time || a.seriesIndex - b.seriesIndex || a.order - b.order,
    );
  const invested = new Array<number>(series.length).fill(0);
  const current = new Array<number>(series.length).fill(0);
  const result: TimelinePoint[] = [];
  for (const event of events) {
    invested[event.seriesIndex] = event.point.invested;
    current[event.seriesIndex] = event.point.current;
    const next: TimelinePoint = {
      date: event.point.date,
      invested: invested.reduce((sum, value) => sum + value, 0),
      current: current.reduce((sum, value) => sum + value, 0),
    };
    const last = result[result.length - 1];
    if (last && last.date === next.date) {
      result[result.length - 1] = next;
    } else {
      result.push(next);
    }
  }
  return result;
}

function bucketKey(
  date: Date,
  granularity: NetWorthTimelineGranularity,
): string {
  if (granularity === 'year') {
    return `${date.getFullYear()}`;
  }
  if (granularity === 'month') {
    return `${date.getFullYear()}-${date.getMonth()}`;
  }
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** Nilai terakhir tiap hari / bulan / tahun (nilai akhir periode). */
export function bucketTimeline(
  points: TimelinePoint[],
  granularity: NetWorthTimelineGranularity,
): TimelinePoint[] {
  const buckets = new Map<string, TimelinePoint>();
  for (const point of points) {
    buckets.set(bucketKey(new Date(point.date), granularity), point);
  }
  return Array.from(buckets.values());
}

/** Label sumbu X untuk tanggal timeline sesuai granularitas. */
export function formatTimelineDate(
  iso: string,
  granularity: NetWorthTimelineGranularity,
  language: string,
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const options: Intl.DateTimeFormatOptions =
    granularity === 'year'
      ? { year: 'numeric' }
      : granularity === 'month'
      ? { month: 'short' }
      : { day: 'numeric', month: 'short' };
  return dateTimeFormat(toIntlLocale(language), options).format(date);
}

/** "Hari ini" / "Kemarin" / "28 Sep" — `withDate`: "Hari ini · 5 Okt". */
export function formatRelativeDay(
  date: Date,
  language: string,
  labels: { today: string; yesterday: string },
  withDate = false,
): string {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const absolute = dateTimeFormat(toIntlLocale(language), {
    day: 'numeric',
    month: 'short',
    ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  }).format(date);
  const relative =
    date.toDateString() === now.toDateString()
      ? labels.today
      : date.toDateString() === yesterday.toDateString()
      ? labels.yesterday
      : null;
  if (!relative) {
    return absolute;
  }
  return withDate ? `${relative} · ${absolute}` : relative;
}

export type NetWorthPeriodPreset = 'month' | 'year' | 'all';

/** Rentang tanggal preset grafik nilai; "all" mulai dari transaksi investasi pertama. */
export function resolveNetWorthPeriod(
  preset: NetWorthPeriodPreset,
  reference: Date,
  firstInvestmentDate: string | null,
): { dateFrom: string; dateTo: string } {
  if (preset === 'month') {
    return {
      dateFrom: toIsoDateString(
        new Date(reference.getFullYear(), reference.getMonth(), 1),
      ),
      dateTo: toIsoDateString(
        new Date(reference.getFullYear(), reference.getMonth() + 1, 0),
      ),
    };
  }
  if (preset === 'year') {
    return {
      dateFrom: toIsoDateString(new Date(reference.getFullYear(), 0, 1)),
      dateTo: toIsoDateString(new Date(reference.getFullYear(), 11, 31)),
    };
  }
  return {
    dateFrom: firstInvestmentDate ?? toIsoDateString(reference),
    dateTo: toIsoDateString(reference),
  };
}

/** Granularitas tiap preset di HP (tidak ada toggle granularitas). */
export const PERIOD_GRANULARITY: Record<
  NetWorthPeriodPreset,
  NetWorthTimelineGranularity
> = { month: 'day', year: 'month', all: 'month' };

/**
 * Nilai seri running-total pada `date` (titik terakhir pada/sebelum tanggal itu), atau 0 sebelum
 * titik pertama. Dipakai Update nilai bertanggal mundur (backend menghitung delta dengan cara sama).
 */
export function timelineValueAt(points: TimelinePoint[], date: Date): number {
  let value = 0;
  for (const point of points) {
    if (new Date(point.date).getTime() > date.getTime()) {
      break;
    }
    value = point.current;
  }
  return value;
}
