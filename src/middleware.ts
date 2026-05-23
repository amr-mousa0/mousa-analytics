import type { APIContext } from 'astro';

export const onRequest = async (_context: APIContext, next: () => Promise<Response>): Promise<Response> => {
  const response = await next();

  // Set standard security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CSP Header Configuration
  // Restricts execution context to self and inline style/script definitions
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';"
  );

  return response;
};
