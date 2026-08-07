import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('TASK-PAG-001: Master Application Shell Layout Component', () => {
  it('verifies src/layouts/Layout.astro imports directionality context and brand constants', () => {
    const layoutPath = path.resolve('src/layouts/Layout.astro');
    expect(fs.existsSync(layoutPath)).toBe(true);
    const content = fs.readFileSync(layoutPath, 'utf-8');

    expect(content).toContain("import { getLocaleDirectionContext } from '../lib/i18n/direction'");
    expect(content).toContain("import { BRAND_CONSTANTS } from '../lib/constants/brand.constants'");
    expect(content).toContain("lang={dirContext.htmlLang}");
    expect(content).toContain("dir={dirContext.htmlDir}");
    expect(content).toContain("import '../styles/global.css'");
  });
});
