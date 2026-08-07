import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('TASK-TOK-003: Centralized Vector Icon Registry Component', () => {
  it('verifies src/components/ui/Icon.astro exists and supports SVG icons', () => {
    const iconPath = path.resolve('src/components/ui/Icon.astro');
    expect(fs.existsSync(iconPath)).toBe(true);
    const content = fs.readFileSync(iconPath, 'utf-8');

    expect(content).toContain('whatsapp:');
    expect(content).toContain('linkedin:');
    expect(content).toContain('github:');
    expect(content).toContain('fill="currentColor"');
  });
});
