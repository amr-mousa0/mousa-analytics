import { en, type UiDictionary } from './en.js';
import { ar } from './ar.js';

export const languages = {
  en: 'English',
  ar: 'العربية',
} as const;

export type SupportedLanguage = keyof typeof languages;

export const defaultLang: SupportedLanguage = 'ar';

export const dictionaries: Record<SupportedLanguage, UiDictionary> = {
  en,
  ar,
};

/**
 * Returns typed UI locale dictionary for given language code.
 * Falls back to defaultLang ('ar') if an invalid or unsupported lang code is passed.
 */
export function useTranslations(lang?: string): UiDictionary {
  if (lang && lang in dictionaries) {
    return dictionaries[lang as SupportedLanguage];
  }
  return dictionaries[defaultLang];
}

/**
 * Extracts language code from URL pathname or returns defaultLang ('ar')
 */
export function getLangFromUrl(url: URL): SupportedLanguage {
  const [, lang] = url.pathname.split('/');
  if (lang && lang in dictionaries) {
    return lang as SupportedLanguage;
  }
  return defaultLang;
}
