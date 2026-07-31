import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
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
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
};
