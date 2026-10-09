import { toIntlLocale } from '@/utils/locale';
import { dateTimeFormat } from '@/utils/intl';

/** "08.42" style time for a transaction ISO date, in the current UI language. */
export function formatTxTime(date: string, language: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return dateTimeFormat(toIntlLocale(language), {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * "Hari ini · 08.42" / "Kemarin · 08.42" / "5 Okt 2026 · 08.42" for date fields.
 * Without `labels` the day part is always absolute (e.g. "Dicatat 5 Okt 2026 · 08.42").
 */
export function formatDateTimeLabel(
  date: Date,
  language: string,
  labels?: { today: string; yesterday: string },
): string {
  const locale = toIntlLocale(language);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  let day: string;
  if (labels && date.toDateString() === new Date().toDateString())
    day = labels.today;
  else if (labels && date.toDateString() === yesterday.toDateString())
    day = labels.yesterday;
  else
    day = dateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  const time = dateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
  return `${day} · ${time}`;
}
