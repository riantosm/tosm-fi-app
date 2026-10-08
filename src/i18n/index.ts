import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import en from '@/i18n/locales/en.json';
import id from '@/i18n/locales/id.json';
import jp from '@/i18n/locales/jp.json';
import type { LanguageCode } from '@/types';

export const SUPPORTED_LANGUAGES: LanguageCode[] = ['id', 'en', 'jp'];

/** Label bahasa ditulis dalam bahasanya sendiri (bukan teks terjemahan). */
export const LANGUAGE_OPTIONS: {
  code: LanguageCode;
  short: string;
  nativeLabel: string;
}[] = [
  { code: 'id', short: 'ID', nativeLabel: 'Bahasa Indonesia' },
  { code: 'en', short: 'EN', nativeLabel: 'English' },
  { code: 'jp', short: 'JP', nativeLabel: '日本語' },
];

/** Bahasa perangkat kalau didukung (ja → jp), selain itu Indonesia. */
function getDeviceLanguage(): LanguageCode {
  const code = getLocales()[0]?.languageCode;
  if (code === 'ja') {
    return 'jp';
  }
  return SUPPORTED_LANGUAGES.find(lang => lang === code) ?? 'id';
}

i18n.use(initReactI18next).init({
  resources: {
    id: { translation: id },
    en: { translation: en },
    jp: { translation: jp },
  },
  // Disinkronkan ke settings.language (persisted) oleh useLanguageSync setelah rehydrate.
  lng: getDeviceLanguage(),
  fallbackLng: 'id',
  interpolation: { escapeValue: false },
});

export default i18n;
