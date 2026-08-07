import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { tokens } from '../../tailwind.config.mjs';

describe('FND-001 Semantic Design Tokens Contract', () => {
  it('exports canonical token palette matching DESIGN.md', () => {
    expect(tokens.colors.primary).toBe('#2563EB');
    expect(tokens.colors['neutral-bg']).toBe('#F8F9FA');
    expect(tokens.colors['text-main']).toBe('#0A192F');
    expect(tokens.colors['card-bg']).toBe('#FFFFFF');
  });

  it('exports canonical typography references matching DESIGN.md', () => {
    expect(tokens.typography.serif).toContain('Cormorant Garamond');
    expect(tokens.typography.sans).toContain('Outfit');
  });

  it('exports canonical radii matching DESIGN.md', () => {
    expect(tokens.rounded.sm).toBe('4px');
    expect(tokens.rounded.md).toBe('8px');
    expect(tokens.rounded.lg).toBe('16px');
    expect(tokens.rounded.full).toBe('9999px');
  });

  it('exports canonical spacing matching DESIGN.md', () => {
    expect(tokens.spacing.sm).toBe('8px');
    expect(tokens.spacing.md).toBe('16px');
    expect(tokens.spacing.lg).toBe('32px');
  });

  it('exports canonical ambient shadow matching DESIGN.md', () => {
    expect(tokens.shadows.ambient).toBe('0 4px 20px rgba(10, 25, 47, 0.05)');
  });

  it('declares canonical tokens in tokens.css and imports it in global.css', () => {
    const tokensCssPath = path.resolve('src/styles/tokens.css');
    expect(fs.existsSync(tokensCssPath)).toBe(true);
    const tokensContent = fs.readFileSync(tokensCssPath, 'utf-8');

    expect(tokensContent).toContain('--color-primary: #2563EB;');
    expect(tokensContent).toContain('--color-neutral-bg: #F8F9FA;');
    expect(tokensContent).toContain('--color-text-main: #0A192F;');
    expect(tokensContent).toContain('--color-card-bg: #FFFFFF;');
    expect(tokensContent).toContain("--font-serif: 'Cormorant Garamond'");
    expect(tokensContent).toContain("--font-sans: 'Outfit'");
    expect(tokensContent).toContain('--radius-sm: 4px;');
    expect(tokensContent).toContain('--radius-md: 8px;');
    expect(tokensContent).toContain('--radius-lg: 16px;');
    expect(tokensContent).toContain('--radius-full: 9999px;');
    expect(tokensContent).toContain('--spacing-sm: 8px;');
    expect(tokensContent).toContain('--spacing-md: 16px;');
    expect(tokensContent).toContain('--spacing-lg: 32px;');
    expect(tokensContent).toContain('--shadow-ambient: 0 4px 20px rgba(10, 25, 47, 0.05);');

    const globalCssPath = path.resolve('src/styles/global.css');
    const globalContent = fs.readFileSync(globalCssPath, 'utf-8');
    expect(globalContent).toContain('@import "./tokens.css";');
  });
});
