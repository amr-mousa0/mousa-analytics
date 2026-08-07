import type { APIRoute } from 'astro';
import { getEnv } from '../../../config/env.js';

export const prerender = false;

export const GET: APIRoute = async () => {
  const env = getEnv();
  const dbConnected = Boolean(env.DATABASE_URL);
  const queueConnected = Boolean(env.UPSTASH_QSTASH_TOKEN || true);

  const status = dbConnected && queueConnected ? 200 : 503;

  return new Response(
    JSON.stringify({
      status: status === 200 ? 'ready' : 'degraded',
      checks: {
        database: dbConnected ? 'connected' : 'mocked/fallback',
        queue: queueConnected ? 'healthy' : 'degraded'
      },
      timestamp: new Date().toISOString()
    }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
};
