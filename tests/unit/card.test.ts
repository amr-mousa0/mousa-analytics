import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('TASK-UI-002: Shared Card Primitive Component', () => {
  it('verifies src/components/ui/Card.astro exists and defines variant, hoverable, and padding props', () => {
    const cardPath = path.resolve('src/components/ui/Card.astro');
    expect(fs.existsSync(cardPath)).toBe(true);
    const content = fs.readFileSync(cardPath, 'utf-8');

    expect(content).toContain("variant?: 'default' | 'glass' | 'bordered' | 'flat'");
    expect(content).toContain("padding?: 'none' | 'sm' | 'md' | 'lg'");
    expect(content).toContain('hoverable = true');
    const stylesContent = fs.readFileSync(path.resolve('src/components/ui/card.styles.ts'), 'utf-8');
    expect(content + stylesContent).toContain('glass-card');
  });
});
