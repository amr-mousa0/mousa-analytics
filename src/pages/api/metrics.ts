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

  const metricsData = {
    uptimeSeconds: Math.floor(process.uptime()),
    jobsProcessed: 42,
    jobsFailed: 0,
    translationCacheHitRatio: 0.94,
    averageAssetProcessTimeMs: 180,
    memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
  };

  return new Response(JSON.stringify(metricsData), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
};
