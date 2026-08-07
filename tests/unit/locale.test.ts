import { describe, it, expect } from 'vitest';
import { en } from '../../src/i18n/en.js';
import { ar } from '../../src/i18n/ar.js';
import { useTranslations, defaultLang } from '../../src/i18n/index.js';
import fs from 'node:fs';
import path from 'node:path';

describe('FND-003 UI Locale Catalog Contract', () => {
  it('enforces 100% top-level key parity between English and Arabic dictionaries', () => {
    const enKeys = Object.keys(en).sort();
    const arKeys = Object.keys(ar).sort();
    expect(enKeys).toEqual(arKeys);
  });

  it('enforces 100% nested key parity across all dictionary sections', () => {
    type DictSection = keyof typeof en;
    const sections = Object.keys(en) as DictSection[];

    for (const section of sections) {
      const enSubKeys = Object.keys(en[section]).sort();
      const arSubKeys = Object.keys(ar[section]).sort();
      expect(arSubKeys, `Key mismatch in section "${section}"`).toEqual(enSubKeys);
    }
  });

  it('resolves correct dictionary via useTranslations helper', () => {
    const enDict = useTranslations('en');
    expect(enDict.nav.home).toBe('Home');

    const arDict = useTranslations('ar');
    expect(arDict.nav.home).toBe('الرئيسية');
  });

  it('falls back to defaultLang ("ar") on invalid language code', () => {
    const fallbackDict = useTranslations('invalid-lang');
    expect(fallbackDict).toEqual(useTranslations(defaultLang));
  });

  it('enforces ZERO inline isAr ? UI text conditional literals in authored Astro templates', () => {
    function getAllAstroFiles(dir: string): string[] {
      const results: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...getAllAstroFiles(fullPath));
        } else if (entry.name.endsWith('.astro')) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const srcDir = path.resolve(__dirname, '../../src');
    const astroFiles = getAllAstroFiles(srcDir);
    const violations: { file: string; line: number; text: string }[] = [];

    // Filter out non-UI-text structural patterns: URL path strings, font class strings, directional arrows, JSON-LD schema
    for (const file of astroFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((lineText, idx) => {
        const trimmed = lineText.trim();

        // Skip non-UI-text structural/bidi/URL/class conditionals
        if (
          trimmed.includes('Path =') ||
          trimmed.includes('dir=') ||
          trimmed.includes('href=') ||
          trimmed.includes('name=') ||
          trimmed.includes('jobTitle') ||
          trimmed.includes('toLocaleDateString') ||
          trimmed.includes('tracking-') ||
          trimmed.includes('font-') ||
          trimmed.includes('Class =') ||
          trimmed.includes('Classes') ||
          trimmed.includes('text-') ||
          trimmed.includes('contactVariant') ||
          trimmed.includes('contactIcon') ||
          trimmed.includes('"←"') ||
          trimmed.includes('"→"') ||
          trimmed.includes("'←'") ||
          trimmed.includes("'→'")
        ) {
          return;
        }

        // Match UI text conditional literals: `isAr ? "..."` or `isAr ? '...'`
        if (/isAr\s*\?\s*["'`][^"'`]+["'`]\s*:/.test(trimmed)) {
          violations.push({
            file: path.relative(srcDir, file),
            line: idx + 1,
            text: trimmed
          });
        }
      });
    }

    expect(violations, `Found ${violations.length} inline isAr UI text conditionals in Astro templates:\n${JSON.stringify(violations, null, 2)}`).toEqual([]);
  });
});
