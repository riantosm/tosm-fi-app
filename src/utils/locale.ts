/** UI language code (`id` | `en` | `jp`) → Intl locale for dates and times. */
export function toIntlLocale(language: string): string {
  if (language === 'jp') return 'ja-JP';
  if (language === 'en') return 'en-GB';
  return 'id-ID';
}
