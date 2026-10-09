import { formatDayMonth, parseIsoDate } from '@/utils/calendar';
import { startOfMonth, toIsoDateString } from '@/utils/month';
import { dateTimeFormat } from '@/utils/intl';

export type ReportPeriodPreset = 'today' | 'week' | 'month' | 'year' | 'custom';

export const REPORT_PERIOD_PRESETS: Exclude<ReportPeriodPreset, 'custom'>[] = [
  'today',
  'week',
  'month',
  'year',
];

export interface ReportPeriodFilter {
  preset: ReportPeriodPreset;
  /** "YYYY-MM-DD" inklusif (hanya untuk custom). */
  dateFrom: string;
  dateTo: string;
}

export interface ResolvedReportPeriod {
  dateFrom: string;
  dateTo: string;
  previousDateFrom: string;
  previousDateTo: string;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date): Date {
  const day = date.getDay();
  return addDays(startOfDay(date), day === 0 ? -6 : 1 - day);
}

function daysBetweenInclusive(a: Date, b: Date): number {
  return (
    Math.round(
      (startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_PER_DAY,
    ) + 1
  );
}

/**
 * Port `resolveReportPeriod` web: rentang periode + periode sebelumnya (pembanding kartu ringkasan).
 * Bulan/tahun memakai bulan/tahun kalender sebelumnya; hari/minggu/custom digeser sepanjang rentangnya.
 */
export function resolveReportPeriod(
  filter: ReportPeriodFilter,
  referenceDate: Date,
): ResolvedReportPeriod {
  let from: Date;
  let to: Date;
  let previousFrom: Date | undefined;
  let previousTo: Date | undefined;
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  switch (filter.preset) {
    case 'today':
      from = startOfDay(referenceDate);
      to = from;
      break;
    case 'week':
      from = startOfWeek(referenceDate);
      to = addDays(from, 6);
      break;
    case 'year':
      from = new Date(year, 0, 1);
      to = new Date(year, 11, 31);
      previousFrom = new Date(year - 1, 0, 1);
      previousTo = new Date(year - 1, 11, 31);
      break;
    case 'custom':
      from = filter.dateFrom
        ? parseIsoDate(filter.dateFrom)
        : startOfMonth(referenceDate);
      to = filter.dateTo ? parseIsoDate(filter.dateTo) : referenceDate;
      break;
    case 'month':
    default:
      from = startOfMonth(referenceDate);
      to = new Date(year, month + 1, 0);
      previousFrom = new Date(year, month - 1, 1);
      previousTo = new Date(year, month, 0);
      break;
  }

  if (to.getTime() < from.getTime()) {
    [from, to] = [to, from];
  }

  if (!previousFrom || !previousTo) {
    const spanDays = daysBetweenInclusive(from, to);
    previousTo = addDays(from, -1);
    previousFrom = addDays(previousTo, -(spanDays - 1));
  }

  return {
    dateFrom: toIsoDateString(from),
    dateTo: toIsoDateString(to),
    previousDateFrom: toIsoDateString(previousFrom),
    previousDateTo: toIsoDateString(previousTo),
  };
}

function formatLong(date: Date, locale: string, withYear: boolean): string {
  try {
    return dateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      ...(withYear ? { year: 'numeric' } : {}),
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

/**
 * Subjudul rentang: "1 – 31 Oktober 2026", "29 September – 5 Oktober 2026", atau satu tanggal.
 * Ditulis manual karena `Intl.DateTimeFormat#formatRange` tidak tersedia di Hermes.
 */
export function formatReportRange(
  dateFrom: string,
  dateTo: string,
  locale: string,
): string {
  const from = parseIsoDate(dateFrom);
  const to = parseIsoDate(dateTo);
  if (dateFrom === dateTo) {
    return formatLong(from, locale, true);
  }
  const sameYear = from.getFullYear() === to.getFullYear();
  if (
    sameYear &&
    from.getMonth() === to.getMonth() &&
    locale.startsWith('id')
  ) {
    return `${from.getDate()} – ${formatLong(to, locale, true)}`;
  }
  if (sameYear) {
    const start = locale.startsWith('id')
      ? formatLong(from, locale, false)
      : formatDayMonth(from, locale);
    return `${start} – ${formatLong(to, locale, true)}`;
  }
  return `${formatLong(from, locale, true)} – ${formatLong(to, locale, true)}`;
}
