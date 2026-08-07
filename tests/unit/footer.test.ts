import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('TASK-UI-004: Shared Footer Layout Component', () => {
  it('verifies src/components/layout/Footer.astro exists and consumes BRAND_CONSTANTS', () => {
    const footerPath = path.resolve('src/components/layout/Footer.astro');
    expect(fs.existsSync(footerPath)).toBe(true);
    const content = fs.readFileSync(footerPath, 'utf-8');

    expect(content).toContain("import { BRAND_CONSTANTS } from '../../lib/constants/brand.constants'");
    expect(content).toContain("import BrandMark from '../brand/BrandMark.astro'");
    expect(content).toContain("BRAND_CONSTANTS.CANONICAL_PHONE");
    expect(content).toContain("BRAND_CONSTANTS.PRIMARY_BRAND_AR");
  });
});
