import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      service: 'content-hub',
      version: '1.0.0',
      commit: process.env.VERCEL_GIT_COMMIT_SHA || 'latest'
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    }
  );
};
