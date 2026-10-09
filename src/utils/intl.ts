/**
 * Formatter Intl yang di-cache per (locale, opsi). Membuat `Intl.NumberFormat`/`DateTimeFormat`
 * baru mahal di Hermes (terlihat di profil CPU saat merender daftar), jadi semua format angka &
 * tanggal lewat sini, termasuk pengganti `toLocaleDateString`/`toLocaleTimeString`.
 */
const numberFormats = new Map<string, Intl.NumberFormat>();
const dateTimeFormats = new Map<string, Intl.DateTimeFormat>();

export function numberFormat(
  locale: string,
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const key = `${locale}|${options ? JSON.stringify(options) : ''}`;
  let format = numberFormats.get(key);
  if (!format) {
    format = new Intl.NumberFormat(locale, options);
    numberFormats.set(key, format);
  }
  return format;
}

export function dateTimeFormat(
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale}|${options ? JSON.stringify(options) : ''}`;
  let format = dateTimeFormats.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat(locale, options);
    dateTimeFormats.set(key, format);
  }
  return format;
}
