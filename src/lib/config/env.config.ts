/**
 * Environment Variable & Security Endpoint Provider
 * Governed by AD-03, 002-configuration-and-identity.md, and TASK-FND-002
 */
import { z } from 'zod';

export const envConfigSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  publicSiteUrl: z.string().default('https://mousa-analytics.vercel.app'),
  corsAllowedOrigins: z.array(z.string()).default([
    'http://localhost:4321',
    'http://localhost:3000',
    'http://127.0.0.1:4321',
    'https://mousa-analytics.vercel.app',
  ]),
});

export type EnvConfig = z.infer<typeof envConfigSchema>;

export function parseOriginsFromEnv(rawOrigins?: string): string[] {
  const defaultOrigins = [
    'http://localhost:4321',
    'http://localhost:3000',
    'http://127.0.0.1:4321',
    'https://mousa-analytics.vercel.app',
  ];

  if (!rawOrigins || typeof rawOrigins !== 'string') {
    return defaultOrigins;
  }

  const parsed = rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return Array.from(new Set([...defaultOrigins, ...parsed]));
}

const rawEnvConfig = {
  nodeEnv: (process.env.NODE_ENV as any) || 'development',
  publicSiteUrl: process.env.PUBLIC_SITE_URL || 'https://mousa-analytics.vercel.app',
  corsAllowedOrigins: parseOriginsFromEnv(process.env.CORS_ALLOWED_ORIGINS),
};

export const envConfig: Readonly<EnvConfig> = Object.freeze(envConfigSchema.parse(rawEnvConfig));
