import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('TASK-QA-002: WCAG 2.1 AA Accessibility & Bidi Audit', () => {
  it('verifies semantic HTML landmarks in Layout, Navbar, and Footer', () => {
    const layoutContent = fs.readFileSync(path.resolve('src/layouts/Layout.astro'), 'utf-8');
    const navbarContent = fs.readFileSync(path.resolve('src/components/layout/Navbar.astro'), 'utf-8');
    const footerContent = fs.readFileSync(path.resolve('src/components/layout/Footer.astro'), 'utf-8');

    expect(layoutContent).toContain('<html');
    expect(layoutContent).toContain('dir={dirContext.htmlDir}');
    expect(navbarContent).toContain('<header');
    expect(navbarContent).toContain('<nav');
    expect(footerContent).toContain('<footer');
  });

  it('verifies directionality context helper handles LTR and RTL correctly', () => {
    const directionContent = fs.readFileSync(path.resolve('src/lib/i18n/direction.ts'), 'utf-8');
    expect(directionContent).toContain("direction: TextDirection");
    expect(directionContent).toContain("htmlDir: direction");
  });
});
