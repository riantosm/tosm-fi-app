export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function isSameMonthAs(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function generateMonthRange(
  center: Date,
  before: number,
  after: number,
): Date[] {
  const start = startOfMonth(center);
  const months: Date[] = [];
  for (let i = -before; i <= after; i++) {
    months.push(addMonths(start, i));
  }
  return months;
}

/** "YYYY-MM" */
export function formatMonthParam(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}`;
}

/** "YYYY-MM-DD" dalam waktu lokal (bukan UTC). */
export function toIsoDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
