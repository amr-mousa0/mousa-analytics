import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  const v1Url = new URL('/api/v1/projects' + url.search, url.origin);
  return Response.redirect(v1Url.toString(), 301);
};
