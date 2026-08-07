import { describe, it, expect } from 'vitest';
import {
  getDirection,
  getFontStack,
  getLocaleDirectionContext,
} from '../../src/lib/i18n/direction.js';

describe('TASK-TYP-004: RTL/LTR Directionality & Context Provider', () => {
  it('returns "rtl" for Arabic locale "ar" and default undefined input', () => {
    expect(getDirection('ar')).toBe('rtl');
    expect(getDirection(undefined)).toBe('rtl');
  });

  it('returns "ltr" for English locale "en"', () => {
    expect(getDirection('en')).toBe('ltr');
    expect(getDirection('en-US')).toBe('ltr');
  });

  it('resolves correct font stack custom property according to locale', () => {
    expect(getFontStack('ar')).toBe('var(--font-arabic)');
    expect(getFontStack('en')).toBe('var(--font-latin)');
  });

  it('returns full locale direction context for layout template attributes', () => {
    const arContext = getLocaleDirectionContext('ar');
    expect(arContext.direction).toBe('rtl');
    expect(arContext.isRtl).toBe(true);
    expect(arContext.htmlDir).toBe('rtl');
    expect(arContext.htmlLang).toBe('ar');

    const enContext = getLocaleDirectionContext('en');
    expect(enContext.direction).toBe('ltr');
    expect(enContext.isRtl).toBe(false);
    expect(enContext.htmlDir).toBe('ltr');
    expect(enContext.htmlLang).toBe('en');
  });
});
