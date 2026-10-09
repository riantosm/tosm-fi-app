import { palettes, type ColorScheme, type ColorTokens } from '@/theme/colors';
import { createShadows, type Shadows } from '@/theme/shadows';
import { createTones, type Tone } from '@/theme/tones';

export interface Theme {
  scheme: ColorScheme;
  isDark: boolean;
  colors: ColorTokens;
  shadows: Shadows;
  tones: Record<Tone, { soft: string; text: string }>;
}

function buildTheme(scheme: ColorScheme): Theme {
  const colors = palettes[scheme];
  return {
    scheme,
    isDark: scheme === 'dark',
    colors,
    shadows: createShadows(colors),
    tones: createTones(colors),
  };
}

/** Dua tema dibangun sekali; komponen memilih lewat ThemeContext. */
export const themes: Record<ColorScheme, Theme> = {
  light: buildTheme('light'),
  dark: buildTheme('dark'),
};
