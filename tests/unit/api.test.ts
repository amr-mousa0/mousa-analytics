import { describe, it, expect, vi } from 'vitest';
import { GET as getProjects, OPTIONS as optionsProjects } from '../../src/pages/api/projects.js';
import { GET as getServices, OPTIONS as optionsServices } from '../../src/pages/api/services.js';
import { GET as getV1Projects, OPTIONS as optionsV1Projects } from '../../src/pages/api/v1/projects.js';
import { GET as getV1Services, OPTIONS as optionsV1Services } from '../../src/pages/api/v1/services.js';

vi.mock('astro:content', () => ({
  getCollection: vi.fn(async () => []),
  getEntry: vi.fn(async () => null),
}));

describe('TASK-API-002, TASK-API-003, & TASK-API-004: API Endpoint Controllers', () => {
  it('handles OPTIONS preflight for /api/projects with status 204', async () => {
    const request = new Request('http://localhost:4321/api/projects', {
      method: 'OPTIONS',
      headers: { origin: 'https://mousa-analytics.vercel.app' },
    });
    const response = await optionsProjects({ request } as any);
    expect(response.status).toBe(204);
  });

  it('handles GET /api/projects with 200 OK and application/json Content-Type', async () => {
    const request = new Request('http://localhost:4321/api/projects?lang=en', {
      method: 'GET',
    });
    const url = new URL('http://localhost:4321/api/projects?lang=en');
    const response = await getProjects({ request, url } as any);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');
  });

  it('handles OPTIONS preflight for /api/services with status 204', async () => {
    const request = new Request('http://localhost:4321/api/services', {
      method: 'OPTIONS',
      headers: { origin: 'https://mousa-analytics.vercel.app' },
    });
    const response = await optionsServices({ request } as any);
    expect(response.status).toBe(204);
  });

  it('handles GET /api/services with 200 OK and application/json Content-Type', async () => {
    const request = new Request('http://localhost:4321/api/services?lang=en', {
      method: 'GET',
    });
    const url = new URL('http://localhost:4321/api/services?lang=en');
    const response = await getServices({ request, url } as any);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');
  });

  it('verifies thin routing adapters /api/v1/projects and /api/v1/services re-export controllers', () => {
    expect(getV1Projects).toBe(getProjects);
    expect(optionsV1Projects).toBe(optionsProjects);
    expect(getV1Services).toBe(getServices);
    expect(optionsV1Services).toBe(optionsServices);
  });
});
