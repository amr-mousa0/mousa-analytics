import { describe, it, expect } from 'vitest';
import {
  BRAND_CONSTANTS,
  UNAPPROVED_BRAND_ALIASES,
  isValidBrandName,
  assertValidBrandName,
} from '../../src/lib/constants/brand.constants.js';

describe('TASK-FND-003: Brand Governance Naming Constants & Guards', () => {
  it('exports canonical primary brand and legal entity names matching SPEC-BRAND-001', () => {
    expect(BRAND_CONSTANTS.PRIMARY_BRAND_EN).toBe('Mousa Analytics');
    expect(BRAND_CONSTANTS.PRIMARY_BRAND_AR).toBe('موسى لتحليل البيانات');
    expect(BRAND_CONSTANTS.LEGAL_ENTITY_EN).toBe('Mousa Systems');
    expect(BRAND_CONSTANTS.LEGAL_ENTITY_AR).toBe('أنظمة موسى');
  });

  it('validates canonical brand names successfully', () => {
    expect(isValidBrandName('Mousa Analytics')).toBe(true);
    expect(isValidBrandName('Mousa Systems')).toBe(true);
    expect(isValidBrandName('موسى لتحليل البيانات')).toBe(true);
  });

  it('detects and rejects legacy unapproved brand aliases', () => {
    for (const alias of UNAPPROVED_BRAND_ALIASES) {
      expect(isValidBrandName(alias)).toBe(false);
      expect(isValidBrandName(`Welcome to ${alias}`)).toBe(false);
    }
  });

  it('throws an explicit error when assertValidBrandName encounters an unapproved alias', () => {
    expect(() => assertValidBrandName('Amr Systems Portfolio')).toThrowError(/Brand Governance Violation/);
  });

  it('ensures BRAND_CONSTANTS is frozen and immutable', () => {
    expect(Object.isFrozen(BRAND_CONSTANTS)).toBe(true);
  });
});
