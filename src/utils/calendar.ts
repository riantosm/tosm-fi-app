import { dateTimeFormat } from '@/utils/intl';
/**
 * Calendar helpers shared by every month grid (transaction calendar, date
 * pickers, range picker). Weeks start on Monday, matching the Mist design.
 */

export interface CalendarDay {
  date: Date;
  /** "YYYY-MM-DD" in local time. */
  iso: string;
  /** false for the leading/trailing days borrowed from the adjacent months. */
  inMonth: boolean;
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(value: string): Date {
  if (!value) return new Date();
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Monday-first index (0 = Monday … 6 = Sunday). */
function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** Full weeks (Monday-first) covering the month, padded with adjacent-month days. */
export function buildMonthWeeks(
  year: number,
  monthIndex: number,
): CalendarDay[][] {
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leading = mondayIndex(first);
  const total = Math.ceil((leading + daysInMonth) / 7) * 7;

  const weeks: CalendarDay[][] = [];
  for (let index = 0; index < total; index++) {
    const date = new Date(year, monthIndex, index - leading + 1);
    if (index % 7 === 0) weeks.push([]);
    weeks[weeks.length - 1].push({
      date,
      iso: toIsoDate(date),
      inMonth: date.getMonth() === monthIndex,
    });
  }
  return weeks;
}

const REFERENCE_MONDAY = new Date(2023, 0, 2);

export function getWeekdayLabels(
  locale: string,
  style: 'short' | 'narrow' = 'short',
): string[] {
  try {
    const formatter = dateTimeFormat(locale, { weekday: style });
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(REFERENCE_MONDAY);
      date.setDate(REFERENCE_MONDAY.getDate() + index);
      return formatter.format(date);
    });
  } catch {
    return style === 'narrow'
      ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }
}

export function formatMonthYear(date: Date, locale: string): string {
  try {
    return dateTimeFormat(locale, {
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

export function formatShortDate(date: Date, locale: string): string {
  try {
    return dateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

/** "5 Okt" — day + short month, no year. */
export function formatDayMonth(date: Date, locale: string): string {
  try {
    return dateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

/** "Oktober" — the month name on its own. */
export function formatMonthName(date: Date, locale: string): string {
  try {
    return dateTimeFormat(locale, { month: 'long' }).format(date);
  } catch {
    return date.toDateString();
  }
}
