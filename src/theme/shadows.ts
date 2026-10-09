import type { ViewStyle } from 'react-native';
import type { ColorTokens } from '@/theme/colors';

/**
 * Preset bayangan (DESIGN_SYSTEM.md §4), di-spread ke style: `{ ...shadows.card }`.
 * shadowRadius ≈ blur pen / 2; elevation Android hanya pendekatan. Di dark mode
 * warna bayangan = hitam (token `shadow`), opasitas sama.
 */
export function createShadows(colors: ColorTokens) {
  return {
    /** Kartu di atas bg — pen: 8%, y 8, blur 28. */
    card: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
      elevation: 3,
    },
    /** Bottom nav mengambang — pen: 16%, y 10, blur 30. */
    nav: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.16,
      shadowRadius: 15,
      elevation: 8,
    },
    /** Sheet / dialog — pen: hitam 20%, y 24, blur 60. */
    pop: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 0.2,
      shadowRadius: 30,
      elevation: 12,
    },
    /** Thumb segmented control — pen: 8%, y 2, blur 8. */
    thumb: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 1,
    },
  } satisfies Record<string, ViewStyle>;
}

export type Shadows = ReturnType<typeof createShadows>;
