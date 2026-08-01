import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      version: '1',
      languages: ['en', 'ar'],
      destinations: ['portfolio', 'company', 'mousa-analytics']
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400'
      }
    }
  );
};
