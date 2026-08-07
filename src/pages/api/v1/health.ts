import type { APIRoute } from 'astro';
import { getCorsHeaders } from '../../../lib/security/policy.js';

export const prerender = false;

export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin');
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
};

export const GET: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  return new Response(
    JSON.stringify({
      status: 'ok',
      service: 'content-hub',
      timestamp: Date.now()
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    }
  );
};
