import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('TASK-QA-001: Automated Vitest Unit & Integration Suite Verification', () => {
  it('verifies that unit test files exist for all architectural layers and epics', () => {
    const unitDir = path.resolve('tests/unit');
    expect(fs.existsSync(unitDir)).toBe(true);
    const files = fs.readdirSync(unitDir).filter(f => f.endsWith('.test.ts'));

    expect(files.length).toBeGreaterThanOrEqual(20);
    expect(files).toContain('site.config.test.ts');
    expect(files).toContain('env.config.test.ts');
    expect(files).toContain('brand.constants.test.ts');
    expect(files).toContain('tokens.test.ts');
    expect(files).toContain('fonts.test.ts');
    expect(files).toContain('typography.test.ts');
    expect(files).toContain('locale.test.ts');
    expect(files).toContain('direction.test.ts');
    expect(files).toContain('schemas.test.ts');
    expect(files).toContain('facade.test.ts');
    expect(files).toContain('layout.test.ts');
    expect(files).toContain('cms.test.ts');
    expect(files).toContain('security.test.ts');
    expect(files).toContain('api.test.ts');
    expect(files).toContain('icon.test.ts');
    expect(files).toContain('button.test.ts');
    expect(files).toContain('card.test.ts');
    expect(files).toContain('navbar.test.ts');
    expect(files).toContain('footer.test.ts');
    expect(files).toContain('homepage.test.ts');
  });
});
