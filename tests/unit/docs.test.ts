import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('GOV-001 Documentation & ADR Sync Audit', () => {
  const docsDir = path.resolve('docs/architecture');

  const adrFiles = [
    '000-architecture-overview.md',
    '001-content-boundary.md',
    '002-configuration-and-identity.md',
    '003-api-versioning.md',
    '004-contact-ux.md',
    'baseline.md'
  ];

  it('verifies all required ADR documents exist in docs/architecture', () => {
    for (const adrFile of adrFiles) {
      const fullPath = path.join(docsDir, adrFile);
      expect(fs.existsSync(fullPath), `Missing ADR file: ${adrFile}`).toBe(true);
    }
  });

  it('verifies baseline.md contains baseline diagnostics and audit cross-references', () => {
    const baselinePath = path.join(docsDir, 'baseline.md');
    const content = fs.readFileSync(baselinePath, 'utf-8');
    expect(content).toContain('0 blocking diagnostics');
    expect(content).toContain('CC-01');
    expect(content).toContain('CC-15');
  });
});
