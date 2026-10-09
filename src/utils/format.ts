// Huruf/angka Latin (+ diakritik), kana, dan kanji; tanda baca lain diabaikan.
const NON_WORD = /[^0-9A-Za-zÀ-ɏ぀-ヿ一-鿿\s]/g;

/**
 * Inisial 2 huruf, sama dengan web: "Andini Nirmala" → "AN", "Emas" → "EM",
 * "Obligasi (SBN)" → "OS" (tanda baca diabaikan).
 */
export function getInitials(name?: string): string {
  const parts = (name ?? '')
    .replace(NON_WORD, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  const first = parts[0];
  const second = parts.length > 1 ? parts[parts.length - 1][0] : first[1] ?? '';
  return (first[0] + second).toUpperCase();
}
