import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
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
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
};
