export type CurrencyCode = 'IDR' | 'USD' | 'JPY';

export type DecimalPlaces = 0 | 1 | 2;

export type LanguageCode = 'id' | 'en' | 'jp';

export interface UserSettings {
  currency: CurrencyCode;
  decimalPlaces: DecimalPlaces;
  language: LanguageCode;
}
