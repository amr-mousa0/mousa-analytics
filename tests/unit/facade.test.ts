import { describe, it, expect, vi } from 'vitest';

vi.mock('astro:content', () => ({
  getCollection: vi.fn(async () => []),
  getEntry: vi.fn(async () => null)
}));

import { ContentFacade } from '../../src/lib/content/facade.js';

describe('CNT-001 Content Façade Architecture Contract', () => {
  it('exposes typed ContentFacade methods for projects, services, and blog posts', () => {
    expect(typeof ContentFacade.getProjects).toBe('function');
    expect(typeof ContentFacade.getProjectBySlug).toBe('function');
    expect(typeof ContentFacade.getServices).toBe('function');
    expect(typeof ContentFacade.getServiceBySlug).toBe('function');
    expect(typeof ContentFacade.getBlogPosts).toBe('function');
    expect(typeof ContentFacade.getBlogPostBySlug).toBe('function');
    expect(typeof ContentFacade.getHeroEntry).toBe('function');
    expect(typeof ContentFacade.getSocials).toBe('function');
  });
});
