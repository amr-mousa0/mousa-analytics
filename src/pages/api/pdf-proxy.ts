import type { APIRoute } from 'astro';
import { getCorsHeaders } from '../../lib/security/policy.js';

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing target PDF URL parameter' }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    const pdfResponse = await fetch(targetUrl);
    if (!pdfResponse.ok) {
      return new Response(JSON.stringify({ error: 'Remote PDF fetch failed', status: pdfResponse.status }), {
        status: pdfResponse.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400, immutable'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'PDF delivery proxy exception' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
