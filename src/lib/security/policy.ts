import { siteConfig } from '../config/site.config.js';

export interface CorsHeaders extends Record<string, string> {
  'Access-Control-Allow-Origin': string;
  'Access-Control-Allow-Methods': string;
  'Access-Control-Allow-Headers': string;
  'Access-Control-Max-Age': string;
}

/**
 * Derives canonical CORS response headers based on request origin matching
 * against siteConfig.server.allowedOrigins.
 */
export function getCorsHeaders(requestOrigin?: string | null): CorsHeaders {
  const allowedOrigins = siteConfig.server.allowedOrigins;
  
  let matchedOrigin = allowedOrigins[0]; // fallback to primary allowed origin
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    matchedOrigin = requestOrigin;
  }

  return {
    'Access-Control-Allow-Origin': matchedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Returns canonical Content Security Policy (CSP) header value.
 */
export function getCspHeader(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.whatsapp.com https://wa.me",
    "frame-ancestors 'none'",
  ].join('; ');
}
