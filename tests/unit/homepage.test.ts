import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('TASK-PAG-002: Homepage Section Assemblies & Layout Integration', () => {
  it('verifies src/pages/[...lang]/index.astro exists and integrates Navbar, Layout, and Footer', () => {
    const indexPath = path.resolve('src/pages/[...lang]/index.astro');
    expect(fs.existsSync(indexPath)).toBe(true);
    const content = fs.readFileSync(indexPath, 'utf-8');

    expect(content).toContain("import Navbar from '../../components/layout/Navbar.astro'");
    expect(content).toContain("import Footer from '../../components/layout/Footer.astro'");
    expect(content).toContain("import Layout from '../../layouts/Layout.astro'");
  });
});
