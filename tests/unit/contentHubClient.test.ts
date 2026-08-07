import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('astro:content', () => ({
  getCollection: vi.fn(async () => []),
  getEntry: vi.fn(async () => null)
}));

import { ContentHubClient } from '../../src/lib/sdk/contentHubClient.js';

describe('ContentHubClient SDK Unit & Integration Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('fetches projects from Content Hub v1 API successfully', async () => {
    const mockProjects = [
      { id: 'en/test-project.md', slug: 'en/test-project', title: 'Test Project', draft: false }
    ];

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/projects?lang=en') || urlStr.includes('/api/v1/projects?lang=en')) {
        return new Response(JSON.stringify(mockProjects), { status: 200 });
      }
      return new Response('Not Found', { status: 404 });
    });

    const result = await ContentHubClient.getProjects('en');
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('falls back to local projects when API returns HTTP 500 error', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response('Internal Server Error', { status: 500 });
    });

    const result = await ContentHubClient.getProjects('en');
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('falls back gracefully on network timeout/fetch failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      throw new TypeError('Failed to fetch');
    });

    const result = await ContentHubClient.getProjects('en');
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('fetches specific project by slug', async () => {
    const mockProjects = [
      { id: 'en/coffee-shop.md', slug: 'en/coffee-shop', title: 'Coffee Shop Analytics', draft: false }
    ];

    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(JSON.stringify(mockProjects), { status: 200 });
    });

    const project = await ContentHubClient.getProject('coffee-shop', 'en');
    expect(project).not.toBeNull();
    expect(project?.slug).toContain('coffee-shop');
  });

  it('fetches global config metadata from /api/v1/config', async () => {
    const mockConfig = { version: '1', languages: ['en', 'ar'], destinations: ['portfolio'] };

    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(JSON.stringify(mockConfig), { status: 200 });
    });

    const config = await ContentHubClient.getConfig();
    expect(config).toEqual(mockConfig);
  });

  it('fetches health status from /api/v1/health', async () => {
    const mockHealth = { status: 'ok', service: 'Content Hub' };

    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(JSON.stringify(mockHealth), { status: 200 });
    });

    const health = await ContentHubClient.health();
    expect(health).toEqual(mockHealth);
  });

  it('fetches version info from /api/v1/version', async () => {
    const mockVersion = { service: 'Content Hub', version: '5.0.0' };

    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(JSON.stringify(mockVersion), { status: 200 });
    });

    const version = await ContentHubClient.version();
    expect(version).toEqual(mockVersion);
  });

  it('returns null on config fetch failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response('Error', { status: 500 });
    });

    const config = await ContentHubClient.getConfig();
    expect(config).toBeNull();
  });

  it('returns null on health check failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response('Error', { status: 500 });
    });

    const health = await ContentHubClient.health();
    expect(health).toBeNull();
  });
});
