import { envConfig } from '../config/env.config.js';

export interface CorsSecurityOptions {
  origin?: string | null;
  allowMethods?: string[];
  allowHeaders?: string[];
}

/**
 * Validates request origin against allowed CORS origins configured in envConfig.
 */
export function isAllowedOrigin(origin?: string | null): boolean {
  if (!origin) return false;
  return envConfig.corsAllowedOrigins.includes(origin);
}

/**
 * Builds standard security and CORS response headers object.
 */
export function getSecurityHeaders(origin?: string | null): Record<string, string> {
  const allowed = isAllowedOrigin(origin);

  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:;",
  };

  if (allowed && origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
    headers['Vary'] = 'Origin';
  }

  return headers;
}

/**
 * Handles HTTP OPTIONS preflight request.
 */
export function handleCorsPreflight(origin?: string | null): Response {
  const headers = getSecurityHeaders(origin);
  return new Response(null, {
    status: 204,
    headers,
  });
}
