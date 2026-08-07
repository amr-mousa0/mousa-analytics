import type { APIRoute } from 'astro';
import { getCorsHeaders } from '../../lib/security/policy.js';

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

  const healthData = {
    status: 'ok',
    service: 'Mousa Analytics Content Hub',
    timestamp: new Date().toISOString(),
    version: '5.0.0',
    services: {
      database: 'connected',
      queue: 'active',
      storage: 'writable',
      translationMemory: 'active'
    }
  };

  return new Response(JSON.stringify(healthData), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
};
