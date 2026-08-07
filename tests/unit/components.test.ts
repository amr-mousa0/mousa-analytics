import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

function getComponentFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getComponentFiles(fullPath));
    } else if (file.endsWith('.astro')) {
      results.push(fullPath);
    }
  });
  return results;
}

describe('APP-002 UI Component Primitive Audit & Regression Suite', () => {
  const componentsDir = path.resolve('src/components');
  const componentFiles = getComponentFiles(componentsDir);

  it('verifies existence of core shared UI components (ActionButton, ContentCard, WhatsAppCTA)', () => {
    const actionButtonPath = path.resolve('src/components/ui/ActionButton.astro');
    const contentCardPath = path.resolve('src/components/ui/ContentCard.astro');
    const whatsAppCtaPath = path.resolve('src/components/ui/WhatsAppCTA.astro');

    expect(fs.existsSync(actionButtonPath), 'ActionButton.astro must exist').toBe(true);
    expect(fs.existsSync(contentCardPath), 'ContentCard.astro must exist').toBe(true);
    expect(fs.existsSync(whatsAppCtaPath), 'WhatsAppCTA.astro must exist').toBe(true);
  });

  it('verifies zero inline SVG logo duplications across UI components', () => {
    const violations: string[] = [];
    for (const filePath of componentFiles) {
      if (filePath.endsWith('BrandMark.astro')) continue;
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for inline SVG brand monogram
      if (content.includes('viewBox="0 0 100 100"') && content.includes('<polygon') && content.includes('<path')) {
        violations.push(path.relative(process.cwd(), filePath));
      }
    }
    expect(violations, `Inline logo SVG duplication found in components: ${violations.join(', ')}`).toEqual([]);
  });

  it('verifies zero raw font icon tags <i class="fa- in UI components', () => {
    const violations: string[] = [];
    for (const filePath of componentFiles) {
      if (filePath.endsWith('Icon.astro')) continue;
      const content = fs.readFileSync(filePath, 'utf-8');
      if (/<i\s+class=["'`][^"'`]*fa-/g.test(content)) {
        violations.push(path.relative(process.cwd(), filePath));
      }
    }
    expect(violations, `Raw FontAwesome <i> tags found in components: ${violations.join(', ')}`).toEqual([]);
  });

  it('verifies zero raw emerald hardcoded color overrides in UI components', () => {
    const violations: string[] = [];
    for (const filePath of componentFiles) {
      if (filePath.endsWith('ActionButton.astro')) continue; // Skip ActionButton semantic variant map
      const content = fs.readFileSync(filePath, 'utf-8');
      if (/bg-emerald-\d+|text-emerald-\d+/g.test(content)) {
        violations.push(path.relative(process.cwd(), filePath));
      }
    }
    expect(violations, `Raw emerald hardcoded colors found in components: ${violations.join(', ')}`).toEqual([]);
  });
});
