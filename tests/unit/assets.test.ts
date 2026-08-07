import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AST-001 CMS Configuration & Image Asset Pipeline Audit', () => {
  it('verifies public/admin/config.yml exists and defines Decap CMS collections', () => {
    const configPath = path.resolve('public/admin/config.yml');
    expect(fs.existsSync(configPath)).toBe(true);

    const content = fs.readFileSync(configPath, 'utf-8');
    expect(content).toContain('backend:');
    expect(content).toContain('collections:');
    expect(content).toContain('services_en');
    expect(content).toContain('services_ar');
    expect(content).toContain('projects_en');
    expect(content).toContain('projects_ar');
    expect(content).toContain('blog_en');
    expect(content).toContain('blog_ar');
  });

  it('verifies favicon assets exist in public/', () => {
    const svgFavicon = path.resolve('public/favicon.svg');
    const icoFavicon = path.resolve('public/favicon.ico');
    expect(fs.existsSync(svgFavicon)).toBe(true);
    expect(fs.existsSync(icoFavicon)).toBe(true);
  });

  it('verifies WebP formatted images exist in src/assets/images/', () => {
    const imagesDir = path.resolve('src/assets/images');
    expect(fs.existsSync(imagesDir)).toBe(true);

    const files = fs.readdirSync(imagesDir);
    const webpFiles = files.filter(f => f.endsWith('.webp'));
    expect(webpFiles.length).toBeGreaterThan(0);
  });
});
