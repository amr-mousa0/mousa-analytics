import { describe, it, expect } from 'vitest';
import { envConfig, envConfigSchema, parseOriginsFromEnv } from '../../src/lib/config/env.config.js';

describe('TASK-FND-002: Environment Variable & Security Endpoint Provider', () => {
  it('exports valid default environment configuration', () => {
    expect(envConfig.nodeEnv).toBeDefined();
    expect(envConfig.publicSiteUrl).toContain('mousa-analytics');
    expect(envConfig.corsAllowedOrigins.length).toBeGreaterThan(0);
  });

  it('validates envConfig instance against envConfigSchema', () => {
    const result = envConfigSchema.safeParse(envConfig);
    expect(result.success).toBe(true);
  });

  it('parses comma-separated CORS_ALLOWED_ORIGINS environment string correctly', () => {
    const rawEnv = 'https://custom-domain.com, https://staging.mousa.com';
    const parsed = parseOriginsFromEnv(rawEnv);
    expect(parsed).toContain('https://custom-domain.com');
    expect(parsed).toContain('https://staging.mousa.com');
    expect(parsed).toContain('http://localhost:4321');
  });

  it('returns default origins array when raw input is undefined or empty', () => {
    const parsedUndefined = parseOriginsFromEnv(undefined);
    expect(parsedUndefined).toContain('http://localhost:4321');
    expect(parsedUndefined).toContain('https://mousa-analytics.vercel.app');
  });

  it('ensures envConfig is frozen and immutable', () => {
    expect(Object.isFrozen(envConfig)).toBe(true);
  });
});
