import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('VIS-002 Brand Identity Registry Contract', () => {
  it('verifies BrandMark.astro exists and exports SVG mark component', () => {
    const brandMarkPath = path.resolve('src/components/brand/BrandMark.astro');
    expect(fs.existsSync(brandMarkPath)).toBe(true);
    const content = fs.readFileSync(brandMarkPath, 'utf-8');

    expect(content).toContain('<svg');
    expect(content).toContain('role="img"');
    expect(content).toContain('aria-label="Mousa Analytics Brand Mark"');
  });

  it('verifies generate-favicons.mjs script exists and outputs public/favicon.svg', () => {
    const scriptPath = path.resolve('scripts/generate-favicons.mjs');
    const faviconPath = path.resolve('public/favicon.svg');
    expect(fs.existsSync(scriptPath)).toBe(true);
    expect(fs.existsSync(faviconPath)).toBe(true);
  });

  it('verifies zero duplicated inline logo SVG definitions exist in Navigation, Footer, or Preloader', () => {
    const filesToCheck = [
      'src/components/ui/Navigation.astro',
      'src/components/ui/Footer.astro',
      'src/components/ui/Preloader.astro',
    ];

    for (const relPath of filesToCheck) {
      const fullPath = path.resolve(relPath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      expect(content, `File ${relPath} should import BrandMark`).toContain("import BrandMark");
      expect(content, `File ${relPath} should not contain hardcoded logo linearGradients`).not.toContain("logo-grad-header");
      expect(content, `File ${relPath} should not contain hardcoded logo linearGradients`).not.toContain("logo-grad-footer");
      expect(content, `File ${relPath} should not contain hardcoded logo linearGradients`).not.toContain("logo-grad-drawer");
    }
  });
});
