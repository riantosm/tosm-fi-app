import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useAppSelector } from '@/store/hooks';
import { themes, type Theme } from '@/theme/theme';

const ThemeContext = createContext<Theme>(themes.light);

/**
 * Menentukan tema aktif dari preferensi user (`settings.theme`, persisted):
 * `system` mengikuti HP, `light`/`dark` dipaksa. Pasang di dalam Provider redux.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useAppSelector(state => state.settings.theme ?? 'system');
  const system = useColorScheme();
  const scheme =
    preference === 'system'
      ? system === 'dark'
        ? 'dark'
        : 'light'
      : preference;

  return (
    <ThemeContext.Provider value={themes[scheme]}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Tema aktif: `colors`, `shadows`, `tones`, `isDark`. */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}
