import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('TASK-TYP-002: Dynamic Fluid Typography & Type Scale Engine', () => {
  it('verifies src/styles/typography.css exists and declares fluid font scales using clamp()', () => {
    const topoCssPath = path.resolve('src/styles/typography.css');
    expect(fs.existsSync(topoCssPath)).toBe(true);
    const content = fs.readFileSync(topoCssPath, 'utf-8');

    expect(content).toContain('--text-xs: clamp(');
    expect(content).toContain('--text-base: clamp(');
    expect(content).toContain('--text-5xl: clamp(');
    expect(content).toContain('--leading-arabic-normal: 1.65;');
    expect(content).toContain('--leading-latin-normal: 1.5;');
  });

  it('verifies global.css imports typography.css', () => {
    const globalCssPath = path.resolve('src/styles/global.css');
    const globalContent = fs.readFileSync(globalCssPath, 'utf-8');
    expect(globalContent).toContain('@import "./typography.css";');
  });
});
