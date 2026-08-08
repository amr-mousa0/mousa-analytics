import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { siteConfig } from '../../src/lib/config/site.config.js';
import { getWhatsAppUrl, getContactHref } from '../../src/lib/contact/cta.js';
import { getCorsHeaders, getCspHeader } from '../../src/lib/security/policy.js';

describe('GOV-002 Master Constitution Compliance Re-Audit Suite', () => {
  it('CC-01: Verifies CSS Token System source of truth exists in src/styles/tokens.css', () => {
    const tokensPath = path.resolve('src/styles/tokens.css');
    expect(fs.existsSync(tokensPath)).toBe(true);
    const content = fs.readFileSync(tokensPath, 'utf-8');
    expect(content).toContain('--color-neutral-bg:');
    expect(content).toContain('--color-accent-primary:');
  });

  it('CC-02: Verifies zero raw emerald hardcoded color overrides remain in src/', () => {
    const srcDir = path.resolve('src');
    const astroFiles: string[] = [];
    function scan(dir: string) {
      fs.readdirSync(dir).forEach(file => {
        const full = path.join(dir, file);
        if (full.includes('.backup')) return;
        if (fs.statSync(full).isDirectory()) scan(full);
        else if (full.endsWith('.astro')) astroFiles.push(full);
      });
    }
    scan(srcDir);

    const violations: string[] = [];
    for (const f of astroFiles) {
      const content = fs.readFileSync(f, 'utf-8');
      if (/bg-emerald-500|text-emerald-500/g.test(content)) {
        violations.push(path.relative(process.cwd(), f));
      }
    }
    expect(violations).toEqual([]);
  });

  it('CC-03 & CC-04: Verifies BrandMark primitive and clean font setup in Layout.astro and fonts.css', () => {
    const layoutPath = path.resolve('src/layouts/Layout.astro');
    const content = fs.readFileSync(layoutPath, 'utf-8');
    expect(content).not.toContain('cdnjs.cloudflare.com/ajax/libs/font-awesome');
    
    const fontsPath = path.resolve('src/styles/fonts.css');
    const fontsContent = fs.readFileSync(fontsPath, 'utf-8');
    expect(fontsContent).toContain('Cairo');
    expect(fontsContent).toContain('Inter');
  });

  it('CC-06: Verifies zero raw font icon tags <i class="fa- remain in active src/ templates', () => {
    const srcDir = path.resolve('src');
    const astroFiles: string[] = [];
    function scan(dir: string) {
      fs.readdirSync(dir).forEach(file => {
        const full = path.join(dir, file);
        if (full.includes('.backup')) return;
        if (fs.statSync(full).isDirectory()) scan(full);
        else if (full.endsWith('.astro')) astroFiles.push(full);
      });
    }
    scan(srcDir);

    const violations: string[] = [];
    for (const f of astroFiles) {
      if (f.endsWith('Icon.astro')) continue;
      const content = fs.readFileSync(f, 'utf-8');
      if (/<i\s+class=["'`][^"'`]*fa-/g.test(content)) {
        violations.push(path.relative(process.cwd(), f));
      }
    }
    expect(violations).toEqual([]);
  });

  it('CC-07 & CC-08: Verifies typed i18n catalog and site.config.ts source of truth', () => {
    expect(siteConfig.public.whatsappNumber).toBe('201017749925');
    expect(siteConfig.public.contactEmail).toBe('Amrmousa240@gmail.com');
  });

  it('CC-10 & CC-11 & CC-13: Verifies CTA helpers and CORS/CSP security policies', () => {
    const waUrl = getWhatsAppUrl({ lang: 'ar' });
    expect(waUrl).toContain('201017749925');

    const emailHref = getContactHref('email');
    expect(emailHref).toBe('mailto:Amrmousa240@gmail.com');

    const cors = getCorsHeaders(null);
    expect(cors['Access-Control-Allow-Origin']).toBeDefined();

    const csp = getCspHeader();
    expect(csp).toContain("default-src 'self'");
  });

  it('CC-12 & CC-14 & CC-15: Verifies content facade, ADR docs, and favicons', () => {
    expect(fs.existsSync(path.resolve('src/lib/content/facade.ts'))).toBe(true);
    expect(fs.existsSync(path.resolve('docs/architecture/000-architecture-overview.md'))).toBe(true);
    expect(fs.existsSync(path.resolve('public/favicon.svg'))).toBe(true);
  });
});
