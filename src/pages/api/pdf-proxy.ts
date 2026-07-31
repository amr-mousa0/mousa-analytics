import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing target PDF URL parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const pdfResponse = await fetch(targetUrl);
    if (!pdfResponse.ok) {
      return new Response(JSON.stringify({ error: 'Remote PDF fetch failed', status: pdfResponse.status }), {
        status: pdfResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    // application/octet-stream header bypasses desktop extension capture (IDM)
    // allowing inline canvas rendering via PDF.js worker seamlessly.
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400, immutable',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'PDF delivery proxy exception' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
