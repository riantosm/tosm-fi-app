import { useEffect } from 'react';
import i18n from '@/i18n';
import { useAppSelector } from '@/store/hooks';

/** Terapkan bahasa pilihan user (persisted) ke i18n. `null` = biarkan bahasa perangkat. */
export function useLanguageSync() {
  const language = useAppSelector(state => state.settings.language);

  useEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);
}
