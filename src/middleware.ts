import type { APIContext } from 'astro';

export const onRequest = async (_context: APIContext, next: () => Promise<Response>): Promise<Response> => {
  const response = await next();

  // Set standard security headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CSP Header Configuration
  // Restricts execution context to self, Cloudflare CDN for styles/fonts, and Getform for form submissions
  // Permits localhost:8400 for Impeccable live variant mode in development
  const requestUrl = _context.url || new URL(_context.request.url);
  const isDev = import.meta.env.DEV ||
    requestUrl.hostname === 'localhost' ||
    requestUrl.hostname === '127.0.0.1';

  const csp = isDev
    ? "default-src 'self'; frame-src 'self' https://app.powerbi.com; script-src 'self' 'unsafe-inline' http://localhost:8400 https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; img-src 'self' data: http://localhost:8400 https://www.googletagmanager.com https://*.google-analytics.com; connect-src 'self' http://localhost:8400 https://www.googletagmanager.com https://*.google-analytics.com; form-action 'self' https://getform.io;"
    : "default-src 'self'; frame-src 'self' https://app.powerbi.com; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com; connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com; form-action 'self' https://getform.io;";
  response.headers.set('Content-Security-Policy', csp);

  return response;
};
