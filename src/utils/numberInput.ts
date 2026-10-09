/**
 * Input angka berformat id ("2.000.000,50"), sama dengan number-input web:
 * titik = pemisah ribuan, koma = desimal (maks 2 digit).
 */
export function formatNumberInput(raw: string): string {
  const cleaned = raw.replace(/[^\d,]/g, '');
  const firstCommaIndex = cleaned.indexOf(',');
  const hasDecimal = firstCommaIndex !== -1;

  let integerPart = hasDecimal ? cleaned.slice(0, firstCommaIndex) : cleaned;
  integerPart = integerPart.replace(/^0+(?=\d)/, '');

  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (!hasDecimal) {
    return groupedInteger;
  }

  const decimalPart = cleaned
    .slice(firstCommaIndex + 1)
    .replace(/,/g, '')
    .slice(0, 2);
  return `${groupedInteger || '0'},${decimalPart}`;
}

export function parseFormattedNumber(formatted: string): number {
  const normalized = formatted.replace(/\./g, '').replace(',', '.');
  const value = Number.parseFloat(normalized);
  return Number.isNaN(value) ? 0 : value;
}
