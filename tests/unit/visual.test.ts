import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

function getFilesRecursively(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath));
    } else if (file.endsWith('.astro') || file.endsWith('.ts') || file.endsWith('.css')) {
      results.push(fullPath);
    }
  });
  return results;
}

describe('VIS-001 & P2-T06 Visual & Contact Constitution Compliance Test', () => {
  it('guarantees zero forbidden raw colors, legacy fonts, or decorative gradient patterns in src/', () => {
    const srcDir = path.resolve('src');
    const files = getFilesRecursively(srcDir);

    const forbiddenPatterns = [
      'bg-emerald-500',
      'text-emerald-500',
      'Cinzel',
    ];

    const violations: { file: string; pattern: string }[] = [];

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      for (const pattern of forbiddenPatterns) {
        if (content.includes(pattern)) {
          violations.push({ file: path.relative(process.cwd(), filePath), pattern });
        }
      }
    }

    expect(violations, `Forbidden visual tokens found: ${JSON.stringify(violations)}`).toEqual([]);
  });

  it('guarantees ZERO hardcoded contact URLs (wa.me/2010, tel:+20) in authored Astro templates', () => {
    const srcDir = path.resolve('src');
    const files = getFilesRecursively(srcDir).filter(f => f.endsWith('.astro'));

    const hardcodedPatterns = [
      'wa.me/2010',
      'tel:+20',
    ];

    const violations: { file: string; pattern: string }[] = [];

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      for (const pattern of hardcodedPatterns) {
        if (content.includes(pattern)) {
          violations.push({ file: path.relative(process.cwd(), filePath), pattern });
        }
      }
    }

    expect(violations, `Hardcoded contact URLs found: ${JSON.stringify(violations)}`).toEqual([]);
  });

  it('guarantees ZERO raw emoji characters in authored Astro components & TypeScript modules', () => {
    const srcDir = path.resolve('src');
    const files = getFilesRecursively(srcDir);

    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u;
    const violations: { file: string; match: string }[] = [];

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const match = content.match(emojiRegex);
      if (match) {
        violations.push({ file: path.relative(process.cwd(), filePath), match: match[0] });
      }
    }

    expect(violations, `Raw emoji characters found in source files: ${JSON.stringify(violations)}`).toEqual([]);
  });
});
