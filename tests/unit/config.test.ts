import { describe, it, expect } from 'vitest';
import { siteConfig } from '../../src/lib/config/site.config.js';
import { getCorsHeaders, getCspHeader } from '../../src/lib/security/policy.js';

describe('FND-004 Site Config & Security Policy Contract', () => {
  it('exports canonical public contact phone number matching ADR 002', () => {
    expect(siteConfig.public.contactPhone).toBe('201017749925');
    expect(siteConfig.public.whatsappBaseUrl).toContain('201017749925');
  });

  it('exports canonical social media links', () => {
    expect(siteConfig.public.socials.github).toBe('https://github.com/amr-mousa0');
    expect(siteConfig.public.socials.linkedin).toContain('linkedin.com/in/amr-mousa');
  });

  it('configures server security parameters and timeouts', () => {
    expect(siteConfig.server.allowedOrigins.length).toBeGreaterThan(0);
    expect(siteConfig.server.timeouts.defaultApiMs).toBe(5000);
  });

  it('generates valid CORS headers for allowed origins', () => {
    const allowedOrigin = 'http://localhost:4321';
    const headers = getCorsHeaders(allowedOrigin);
    expect(headers['Access-Control-Allow-Origin']).toBe(allowedOrigin);
    expect(headers['Access-Control-Allow-Methods']).toContain('GET');
  });

  it('falls back to default origin when unknown origin is passed to getCorsHeaders', () => {
    const headers = getCorsHeaders('http://malicious-site.com');
    expect(headers['Access-Control-Allow-Origin']).not.toBe('http://malicious-site.com');
    expect(headers['Access-Control-Allow-Origin']).toBe(siteConfig.server.allowedOrigins[0]);
  });

  it('returns valid CSP header string', () => {
    const csp = getCspHeader();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
  });
});
