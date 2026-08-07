/**
 * RTL/LTR Directionality & Context Provider
 * Governed by AD-02, ADR-005, SPEC-TYPO-001, and TASK-TYP-004
 */

export type TextDirection = 'rtl' | 'ltr';

export interface LocaleDirectionContext {
  locale: string;
  direction: TextDirection;
  isRtl: boolean;
  fontFamily: string;
  htmlDir: string;
  htmlLang: string;
}

/**
 * Returns text direction ('rtl' or 'ltr') for a given locale string.
 * Default is 'rtl' for Arabic 'ar'.
 */
export function getDirection(locale?: string): TextDirection {
  if (locale && locale.toLowerCase().startsWith('en')) {
    return 'ltr';
  }
  return 'rtl'; // Default primary locale is Arabic
}

/**
 * Returns font-family stack custom property variable for active locale.
 */
export function getFontStack(locale?: string): string {
  const dir = getDirection(locale);
  return dir === 'rtl' ? 'var(--font-arabic)' : 'var(--font-latin)';
}

/**
 * Returns complete locale direction context for template layout attributes.
 */
export function getLocaleDirectionContext(locale?: string): LocaleDirectionContext {
  const normLocale = locale?.toLowerCase() || 'ar';
  const direction = getDirection(normLocale);
  const isRtl = direction === 'rtl';

  return {
    locale: normLocale,
    direction,
    isRtl,
    fontFamily: getFontStack(normLocale),
    htmlDir: direction,
    htmlLang: normLocale,
  };
}
