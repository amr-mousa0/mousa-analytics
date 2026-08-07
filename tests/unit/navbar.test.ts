import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('TASK-UI-003: Shared Navbar Header Component', () => {
  it('verifies src/components/layout/Navbar.astro exists and consumes BrandMark and useTranslations', () => {
    const navbarPath = path.resolve('src/components/layout/Navbar.astro');
    expect(fs.existsSync(navbarPath)).toBe(true);
    const content = fs.readFileSync(navbarPath, 'utf-8');

    expect(content).toContain("import BrandMark from '../brand/BrandMark.astro'");
    expect(content).toContain("import { useTranslations } from '../../lib/locales/index'");
    expect(content).toContain('navItems.map');
  });
});
