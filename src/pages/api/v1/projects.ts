import type { APIRoute } from 'astro';
import { getSafeProjects } from '../../../scripts/projectsHelper.js';
import crypto from 'crypto';

export const prerender = false;

function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(',').map(o => o.trim()).filter(Boolean);
  }
  // Default dev origins
  return [
    'http://localhost:4321',
    'http://localhost:3000',
    'http://127.0.0.1:4321',
    'https://content-sync-service.vercel.app',
    'https://mousaanalytics.com'
  ];
}

export const GET: APIRoute = async ({ request, url }) => {
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();

  // Validate Origin if present (Browser CORS request)
  if (origin && !allowedOrigins.includes(origin)) {
    console.warn(`[ContentHub CORS] Access denied for origin: "${origin}"`);
    return new Response(
      JSON.stringify({ error: 'Forbidden: Origin not whitelisted by Content Hub CORS security policy' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const lang = url.searchParams.get('lang') || 'en';
  console.log(`[ContentHub v1 API] GET /api/v1/projects requested for lang="${lang}"`);

  const rawProjects = await getSafeProjects(lang);

  // Clean data contract (DTO) abstraction
  const projects = rawProjects.map(p => {
    const dataObj = {
      title: p.data.title,
      projectBadge: p.data.projectBadge,
      problemText: p.data.problemText,
      solutionText: p.data.solutionText,
      impactText: p.data.impactText,
      coverImage: p.data.coverImage,
      galleryImages: p.data.galleryImages || [],
      githubUrl: p.data.githubUrl || '',
      dashboardUrl: p.data.dashboardUrl || '',
      whatsappStartProjectMsg: p.data.whatsappStartProjectMsg,
      whatsappOpenDashboardMsg: p.data.whatsappOpenDashboardMsg,
      priority: p.data.priority,
      category: p.data.category,
      tags: p.data.tags || [],
      draft: p.data.draft,
      featured: p.data.featured,
      publishedDate: p.data.publishedDate
    };
    return {
      id: p.id,
      slug: p.slug,
      ...dataObj,
      data: dataObj,
      isFallback: p.isFallback || false
    };
  });


  const jsonBody = JSON.stringify({
    status: 'success',
    version: '1',
    lang,
    count: projects.length,
    projects
  });

  // Calculate ETag
  const etag = `W/"${crypto.createHash('md5').update(jsonBody).digest('hex')}"`;

  const responseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    'ETag': etag
  };

  if (origin && allowedOrigins.includes(origin)) {
    responseHeaders['Access-Control-Allow-Origin'] = origin;
    responseHeaders['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
    responseHeaders['Access-Control-Allow-Headers'] = 'Content-Type';
  }

  // Handle 304 Not Modified
  const clientEtag = request.headers.get('if-none-match');
  if (clientEtag === etag) {
    return new Response(null, {
      status: 304,
      headers: responseHeaders
    });
  }

  return new Response(jsonBody, {
    status: 200,
    headers: responseHeaders
  });
};

export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();

  if (origin && allowedOrigins.includes(origin)) {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  return new Response(null, { status: 403 });
};
