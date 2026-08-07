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
      service: 'content-hub',
      version: '1.0.0',
      commit: process.env.VERCEL_GIT_COMMIT_SHA || 'latest'
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    }
  );
};
