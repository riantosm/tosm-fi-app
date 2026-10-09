import type { ScheduleOccurrence, Transaction } from '@/types';
import { dateTimeFormat } from '@/utils/intl';

export type ListEntry =
  | {
      kind: 'transaction';
      date: string;
      amount: number;
      transaction: Transaction;
    }
  | {
      kind: 'occurrence';
      date: string;
      amount: number;
      occurrence: ScheduleOccurrence;
    };

export interface DateGroup {
  dateKey: string;
  date: Date;
  entries: ListEntry[];
  /** Total bersih hari itu (transfer = 0, tagihan belum dibayar tidak dihitung). */
  net: number;
}

function toDateKey(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function netContribution(transaction: Transaction): number {
  switch (transaction.type) {
    case 'income':
    case 'correction':
      return transaction.amount;
    case 'expense':
      return -transaction.amount;
    default:
      return 0;
  }
}

/** Gabungkan transaksi + tagihan, urutkan, kelompokkan per hari (port dari web TransactionList). */
export type SortWithinDay = 'chronological' | 'amountDesc' | 'amountAsc';

export function groupEntriesByDate(
  transactions: Transaction[],
  occurrences: ScheduleOccurrence[],
  order: 'desc' | 'asc' = 'desc',
  sortWithinDay: SortWithinDay = 'chronological',
): DateGroup[] {
  const entries: ListEntry[] = [
    ...transactions.map(transaction => ({
      kind: 'transaction' as const,
      date: transaction.date,
      amount: transaction.amount,
      transaction,
    })),
    ...occurrences.map(occurrence => ({
      kind: 'occurrence' as const,
      date: occurrence.dueDate,
      amount: occurrence.amount,
      occurrence,
    })),
  ].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    return order === 'desc' ? -diff : diff;
  });

  const groups = new Map<string, DateGroup>();
  for (const entry of entries) {
    const key = toDateKey(entry.date);
    let group = groups.get(key);
    if (!group) {
      group = { dateKey: key, date: new Date(entry.date), entries: [], net: 0 };
      groups.set(key, group);
    }
    group.entries.push(entry);
    if (entry.kind === 'transaction') {
      group.net += netContribution(entry.transaction);
    }
  }
  if (sortWithinDay !== 'chronological') {
    for (const group of groups.values()) {
      group.entries.sort((a, b) => {
        const diff = Math.abs(a.amount) - Math.abs(b.amount);
        return sortWithinDay === 'amountDesc' ? -diff : diff;
      });
    }
  }
  return Array.from(groups.values());
}

/** Format lengkap halaman Transaksi: "HARI INI · SENIN 5 OKT" / "SABTU 3 OKT". */
export function formatDayHeaderFull(
  date: Date,
  locale: string,
  labels: { today: string; yesterday: string },
): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const relative =
    date.toDateString() === new Date().toDateString()
      ? labels.today
      : date.toDateString() === yesterday.toDateString()
      ? labels.yesterday
      : null;
  const absolute = dateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })
    .format(date)
    .replace(',', '')
    .replace('.', '');
  return relative ? `${relative} · ${absolute}` : absolute;
}

/** "HARI INI" / "KEMARIN" / "Sabtu, 3 Oktober". */
export function formatDayHeader(
  date: Date,
  locale: string,
  labels: { today: string; yesterday: string },
): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === new Date().toDateString()) {
    return labels.today;
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return labels.yesterday;
  }
  return dateTimeFormat(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
