import { useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSettings } from '@/store/slices/settingsSlice';
import type { ThemePreference } from '@/types';

/** Preferensi tema (persisted) + skema aktif + pengganti. */
export function useThemePreference() {
  const dispatch = useAppDispatch();
  const preference = useAppSelector(state => state.settings.theme ?? 'system');
  const { scheme, isDark } = useTheme();

  const setPreference = useCallback(
    (value: ThemePreference) => dispatch(setSettings({ theme: value })),
    [dispatch],
  );

  /** Tombol ☀/☾: paksa kebalikan dari skema yang sedang tampil. */
  const toggle = useCallback(
    () => setPreference(isDark ? 'light' : 'dark'),
    [isDark, setPreference],
  );

  return { preference, scheme, isDark, setPreference, toggle };
}
