import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('TASK-CNT-002: CMS Content Management Schema Configuration', () => {
  it('verifies public/admin/config.yml exists and declares services, projects, blog, and hero collections', () => {
    const configYmlPath = path.resolve('public/admin/config.yml');
    expect(fs.existsSync(configYmlPath)).toBe(true);
    const content = fs.readFileSync(configYmlPath, 'utf-8');

    expect(content).toContain('name: "services_en"');
    expect(content).toContain('name: "services_ar"');
    expect(content).toContain('name: "projects_en"');
    expect(content).toContain('name: "projects_ar"');
    expect(content).toContain('name: "blog_en"');
    expect(content).toContain('name: "blog_ar"');
    expect(content).toContain('name: "hero"');
  });
});
