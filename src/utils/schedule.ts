import type { TFunction } from 'i18next';
import type { Schedule, ScheduleFrequency } from '@/types';
import { dateTimeFormat } from '@/utils/intl';

/** Urutan tampilan hari mulai Senin (0 = Minggu … 6 = Sabtu). */
export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

const MS_PER_DAY = 86400000;
// Rata-rata minggu/hari per bulan — hanya untuk estimasi "rutin per bulan".
const WEEKS_PER_MONTH = 52 / 12;
const DAYS_PER_MONTH = 365 / 12;

export interface RecurrenceRule {
  frequency: ScheduleFrequency;
  weekdays: number[];
  /** Null → pakai tanggal dari tanggal mulai (sama dengan backend). */
  dayOfMonth: number | null;
  /** 1-based; null → bulan dari tanggal mulai. */
  month: number | null;
  startDate: Date;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

/** Mis. tanggal 31 dipotong ke hari terakhir bulan yang lebih pendek, seperti backend. */
function dateForMonth(year: number, month0: number, day: number): Date {
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  return new Date(year, month0, Math.min(day, daysInMonth));
}

/** Tanggal jadwal disimpan sebagai ISO tengah malam UTC — dibaca sebagai tanggal lokal. */
export function parseScheduleDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    return startOfDay(new Date(value));
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function ruleFromSchedule(schedule: Schedule): RecurrenceRule {
  return {
    frequency: schedule.frequency,
    weekdays: schedule.weekdays,
    dayOfMonth: schedule.dayOfMonth,
    month: schedule.month,
    startDate: parseScheduleDate(schedule.startDate),
  };
}

/**
 * Jatuh tempo pertama pada/setelah `from` (default hari ini) dan tanggal mulai — sama dengan
 * aturan backend. Null kalau tidak pernah jatuh tempo (mingguan tanpa hari).
 */
export function getNextDueDate(
  rule: RecurrenceRule,
  from: Date = new Date(),
): Date | null {
  const today = startOfDay(from);
  const start = startOfDay(rule.startDate);
  const base = start.getTime() > today.getTime() ? start : today;
  const day = rule.dayOfMonth ?? start.getDate();

  switch (rule.frequency) {
    case 'daily':
      return base;
    case 'weekly': {
      for (let offset = 0; offset < 7; offset++) {
        const candidate = addDays(base, offset);
        if (rule.weekdays.includes(candidate.getDay())) {
          return candidate;
        }
      }
      return null;
    }
    case 'monthly': {
      const candidate = dateForMonth(base.getFullYear(), base.getMonth(), day);
      return candidate.getTime() >= base.getTime()
        ? candidate
        : dateForMonth(base.getFullYear(), base.getMonth() + 1, day);
    }
    case 'yearly': {
      const month0 = (rule.month ?? start.getMonth() + 1) - 1;
      const candidate = dateForMonth(base.getFullYear(), month0, day);
      return candidate.getTime() >= base.getTime()
        ? candidate
        : dateForMonth(base.getFullYear() + 1, month0, day);
    }
    default:
      return null;
  }
}

/** Biaya per bulan; jadwal tahunan tidak dihitung (null). */
export function monthlyEquivalent(schedule: Schedule): number | null {
  switch (schedule.frequency) {
    case 'daily':
      return Math.round(schedule.amount * DAYS_PER_MONTH);
    case 'weekly':
      return Math.round(
        schedule.amount * schedule.weekdays.length * WEEKS_PER_MONTH,
      );
    case 'monthly':
      return schedule.amount;
    default:
      return null;
  }
}

export function weekdayLabel(
  day: number,
  locale: string,
  style: 'short' | 'long' = 'short',
): string {
  try {
    // 1 Jan 2023 hari Minggu, jadi offset hari = nilai getDay().
    return dateTimeFormat(locale, { weekday: style })
      .format(new Date(2023, 0, 1 + day))
      .replace('.', '');
  } catch {
    return (
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day] ?? String(day)
    );
  }
}

function orderedWeekdays(weekdays: number[]): number[] {
  return WEEKDAY_ORDER.filter(day => weekdays.includes(day));
}

/** "Sen, Rab, dan Jum" (Hermes tidak punya Intl.ListFormat, jadi dirangkai manual). */
export function formatWeekdayList(
  weekdays: number[],
  locale: string,
  andWord: string,
): string {
  const labels = orderedWeekdays(weekdays).map(day =>
    weekdayLabel(day, locale),
  );
  if (labels.length <= 1) {
    return labels.join('');
  }
  if (locale.startsWith('ja')) {
    return labels.join('、');
  }
  const head = labels.slice(0, -1).join(', ');
  const last = labels[labels.length - 1];
  return `${head}${labels.length > 2 ? ',' : ''} ${andWord} ${last}`;
}

function formatDayMonth(day: number, month: number, locale: string): string {
  try {
    return dateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
    }).format(new Date(2024, month - 1, day));
  } catch {
    return `${day}/${month}`;
  }
}

/** "Bulanan · tgl 5", "Mingguan · Sen, Rab, Jum", "Tahunan · 5 Maret". */
export function describeFrequency(
  rule: RecurrenceRule,
  t: TFunction,
  locale: string,
): string {
  const day = rule.dayOfMonth ?? rule.startDate.getDate();
  switch (rule.frequency) {
    case 'daily':
      return t('schedule.frequencyDaily');
    case 'weekly': {
      const days = orderedWeekdays(rule.weekdays)
        .map(weekday => weekdayLabel(weekday, locale))
        .join(', ');
      return days
        ? `${t('schedule.frequencyWeekly')} · ${days}`
        : t('schedule.frequencyWeekly');
    }
    case 'monthly':
      return `${t('schedule.frequencyMonthly')} · ${t(
        'schedule.dayOfMonthShort',
        { day },
      )}`;
    case 'yearly': {
      const month = rule.month ?? rule.startDate.getMonth() + 1;
      return `${t('schedule.frequencyYearly')} · ${formatDayMonth(
        day,
        month,
        locale,
      )}`;
    }
    default:
      return rule.frequency;
  }
}

/** Kalimat di bawah form jadwal: kapan tagihan akan muncul. */
export function describeRecurrencePreview(
  rule: RecurrenceRule,
  t: TFunction,
  locale: string,
): string {
  const day = rule.dayOfMonth ?? rule.startDate.getDate();
  switch (rule.frequency) {
    case 'daily':
      return t('schedule.previewDaily');
    case 'weekly':
      return rule.weekdays.length > 0
        ? t('schedule.previewWeekly', {
            days: formatWeekdayList(
              rule.weekdays,
              locale,
              t('schedule.listAnd'),
            ),
          })
        : t('schedule.weekdaysRequiredError');
    case 'monthly':
      return t('schedule.previewMonthly', { day });
    case 'yearly':
      return t('schedule.previewYearly', {
        date: formatDayMonth(
          day,
          rule.month ?? rule.startDate.getMonth() + 1,
          locale,
        ),
      });
    default:
      return '';
  }
}

function dayDiff(date: Date, from: Date): number {
  return Math.round(
    (startOfDay(date).getTime() - startOfDay(from).getTime()) / MS_PER_DAY,
  );
}

/** "Hari ini" / "Besok" / "Sel, 20 Okt" (tahun ini) / "5 Mar 2027" (tahun lain). */
export function formatDueDate(
  date: Date,
  locale: string,
  labels: { today: string; tomorrow: string },
  from: Date = new Date(),
): string {
  const diff = dayDiff(date, from);
  if (diff === 0) {
    return labels.today;
  }
  if (diff === 1) {
    return labels.tomorrow;
  }
  try {
    const sameYear = date.getFullYear() === from.getFullYear();
    return dateTimeFormat(
      locale,
      sameYear
        ? { weekday: 'short', day: 'numeric', month: 'short' }
        : { day: 'numeric', month: 'short', year: 'numeric' },
    ).format(date);
  } catch {
    return date.toDateString();
  }
}

/** "Senin, 5 Okt 2026" (huruf pertama kapital). */
export function formatLongDate(
  date: Date,
  locale: string,
  withYear = true,
): string {
  try {
    const text = dateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      ...(withYear ? { year: 'numeric' } : {}),
    }).format(date);
    return text.charAt(0).toUpperCase() + text.slice(1);
  } catch {
    return date.toDateString();
  }
}
