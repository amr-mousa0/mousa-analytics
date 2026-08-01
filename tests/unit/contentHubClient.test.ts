import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'success', projects: mockProjects })
    } as Response);

    const projects = await ContentHubClient.getProjects('en');
    expect(projects).toHaveLength(1);
    expect(projects[0].title).toBe('Test Project');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('fetches single project by slug', async () => {
    const mockProjects = [
      { id: 'en/sql-practice.md', slug: 'en/sql-practice', title: 'SQL Practice', draft: false }
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'success', projects: mockProjects })
    } as Response);

    const project = await ContentHubClient.getProject('sql-practice', 'en');
    expect(project).not.toBeNull();
    expect(project?.title).toBe('SQL Practice');
  });

  it('fetches global configuration metadata from /api/v1/config', async () => {
    const mockConfig = { version: '1', languages: ['en', 'ar'], destinations: ['portfolio'] };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockConfig
    } as Response);

    const config = await ContentHubClient.getConfig();
    expect(config).toEqual(mockConfig);
  });

  it('checks service health status from /api/v1/health', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'ok', service: 'content-hub' })
    } as Response);

    const health = await ContentHubClient.health();
    expect(health?.status).toBe('ok');
  });

  it('checks service version from /api/v1/version', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ service: 'content-hub', version: '1.0.0' })
    } as Response);

    const ver = await ContentHubClient.version();
    expect(ver?.version).toBe('1.0.0');
  });

  it('selective retry: fails fast without retrying on HTTP 500 error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    } as Response);

    const projects = await ContentHubClient.getProjects('en');
    expect(projects).toEqual([]);
    // Should NOT retry on 500
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('selective retry: retries on transport network failure (TypeError/timeout)', async () => {
    // Attempt 0 fails with network TypeError, attempt 1 succeeds
    globalThis.fetch = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success', projects: [{ id: '1', title: 'Recovered' }] })
      } as Response);

    const projects = await ContentHubClient.getProjects('en');
    expect(projects).toHaveLength(1);
    expect(projects[0].title).toBe('Recovered');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('enforces strict CONTENT_HUB_API_URL check in production mode', async () => {
    delete process.env.CONTENT_HUB_API_URL;
    process.env.NODE_ENV = 'production';

    expect(() => (ContentHubClient as any).getBaseUrl()).toThrowError(
      /CONTENT_HUB_API_URL environment variable is strictly required/
    );
  });


  it('defaults to http://localhost:4321 in local development mode when CONTENT_HUB_API_URL is unset', () => {
    delete process.env.CONTENT_HUB_API_URL;
    (import.meta as any).env = { PROD: false };

    const url = (ContentHubClient as any).getBaseUrl();
    expect(url).toBe('http://localhost:4321');
  });
});
