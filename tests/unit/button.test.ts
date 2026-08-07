import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('TASK-UI-001: Shared Button Primitive Component', () => {
  it('verifies src/components/ui/Button.astro exists and defines variant, size, and href props', () => {
    const buttonPath = path.resolve('src/components/ui/Button.astro');
    expect(fs.existsSync(buttonPath)).toBe(true);
    const content = fs.readFileSync(buttonPath, 'utf-8');

    expect(content).toContain("variant?: 'primary' | 'secondary' | 'outline' | 'ghost'");
    expect(content).toContain("size?: 'sm' | 'md' | 'lg'");
    expect(content).toContain('href ?');
    expect(content).toContain('<button');
  });
});
