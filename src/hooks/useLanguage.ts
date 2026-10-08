import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGE_OPTIONS } from '@/i18n';
import { useAppDispatch } from '@/store/hooks';
import { setSettings } from '@/store/slices/settingsSlice';
import type { LanguageCode } from '@/types';

/** Bahasa aktif + pengganti (disimpan di settings, diterapkan oleh useLanguageSync). */
export function useLanguage() {
  const dispatch = useAppDispatch();
  const { i18n } = useTranslation();
  const language = (LANGUAGE_OPTIONS.find(o => o.code === i18n.language)
    ?.code ?? 'id') as LanguageCode;

  const setLanguage = useCallback(
    (code: LanguageCode) => dispatch(setSettings({ language: code })),
    [dispatch],
  );

  return { language, setLanguage, options: LANGUAGE_OPTIONS };
}
