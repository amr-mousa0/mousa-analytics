import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('TASK-TYP-001: Self-Hosted Web Font Loading Pipeline', () => {
  it('verifies src/styles/fonts.css exists and declares Cairo and Inter font-face rules', () => {
    const fontsCssPath = path.resolve('src/styles/fonts.css');
    expect(fs.existsSync(fontsCssPath)).toBe(true);
    const content = fs.readFileSync(fontsCssPath, 'utf-8');

    expect(content).toContain('Cairo');
    expect(content).toContain('Inter');
    expect(content).toContain('display=swap');
  });

  it('verifies global.css imports fonts.css', () => {
    const globalCssPath = path.resolve('src/styles/global.css');
    const globalContent = fs.readFileSync(globalCssPath, 'utf-8');
    expect(globalContent).toContain('@import "./fonts.css";');
  });
});
