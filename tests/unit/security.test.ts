import { describe, it, expect } from 'vitest';
import {
  isAllowedOrigin,
  getSecurityHeaders,
  handleCorsPreflight,
} from '../../src/lib/security/corsPolicy.js';

describe('TASK-API-001: Security & CORS Policy Engine Provider', () => {
  it('validates allowed origins against configured whitelist', () => {
    expect(isAllowedOrigin('https://mousa-analytics.vercel.app')).toBe(true);
    expect(isAllowedOrigin('https://unauthorized-domain.com')).toBe(false);
    expect(isAllowedOrigin(null)).toBe(false);
  });

  it('returns standard security headers for all requests', () => {
    const headers = getSecurityHeaders(null);
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Content-Security-Policy']).toBeDefined();
  });

  it('attaches Access-Control-Allow-Origin for allowed request origin', () => {
    const origin = 'https://mousa-analytics.vercel.app';
    const headers = getSecurityHeaders(origin);
    expect(headers['Access-Control-Allow-Origin']).toBe(origin);
    expect(headers['Access-Control-Allow-Methods']).toContain('GET');
  });

  it('handles CORS OPTIONS preflight response with status 204', () => {
    const origin = 'https://mousa-analytics.vercel.app';
    const response = handleCorsPreflight(origin);
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
  });
});
