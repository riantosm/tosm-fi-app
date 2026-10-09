import {
  StyleSheet,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { ColorScheme } from '@/theme/colors';
import type { Theme } from '@/theme/theme';

/** Pengganti `StyleSheet.NamedStyles` (tidak diekspor lagi di RN 0.87). */
type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Buat hook style yang ikut tema. Hasil di-cache per skema (dibuat sekali untuk light,
 * sekali untuk dark), jadi aman dipanggil di setiap render.
 *
 *   const useStyles = makeStyles(({ colors, shadows }) => ({ card: { … } }));
 *   const styles = useStyles();
 */
export function makeStyles<T extends NamedStyles<T>>(
  factory: (theme: Theme) => T,
): () => T {
  const cache: Partial<Record<ColorScheme, T>> = {};
  return function useStyles() {
    const theme = useTheme();
    let styles = cache[theme.scheme];
    if (!styles) {
      styles = StyleSheet.create(factory(theme));
      cache[theme.scheme] = styles;
    }
    return styles;
  };
}

/** Seperti makeStyles, untuk nilai non-StyleSheet (peta varian warna, dll.). */
export function makeThemed<T>(factory: (theme: Theme) => T): () => T {
  const cache: Partial<Record<ColorScheme, T>> = {};
  return function useThemed() {
    const theme = useTheme();
    let value = cache[theme.scheme];
    if (value === undefined) {
      value = factory(theme);
      cache[theme.scheme] = value;
    }
    return value;
  };
}
