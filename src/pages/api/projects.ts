import type { APIRoute } from 'astro';
import { ContentFacade } from '../../lib/content/facade.js';
import { getSecurityHeaders, handleCorsPreflight } from '../../lib/security/corsPolicy.js';
import { formatCardDescription } from '../../lib/utils/descriptionFormatter.js';
import crypto from 'crypto';

export const prerender = false;

export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin');
  return handleCorsPreflight(origin);
};

export const GET: APIRoute = async ({ request, url }) => {
  const origin = request.headers.get('origin');
  const securityHeaders = getSecurityHeaders(origin);

  const lang = (url.searchParams.get('lang') === 'ar' ? 'ar' : 'en') as 'en' | 'ar';
  const rawProjects = await ContentFacade.getProjects({ lang });

  const projects = rawProjects.map(p => {
    const formattedProblem = formatCardDescription(p.data.problemText);
    return {
      id: p.id,
      slug: p.slug,
      data: {
        ...p.data,
        problemText: formattedProblem,
      },
      title: p.data.title,
      projectBadge: p.data.projectBadge,
      problemText: formattedProblem,
      solutionText: p.data.solutionText,
      impactText: p.data.impactText,
      coverImage: p.data.coverImage,
      galleryImages: p.data.galleryImages || [],
      githubUrl: p.data.githubUrl || '',
      whatsappStartProjectMsg: p.data.whatsappStartProjectMsg,
      whatsappOpenDashboardMsg: p.data.whatsappOpenDashboardMsg,
      priority: p.data.priority,
      category: p.data.category,
      tags: p.data.tags || [],
      draft: p.data.draft,
      featured: p.data.featured,
      publishedDate: p.data.publishedDate,
    };
  });

  const jsonBody = JSON.stringify(projects);
  const etag = `W/"${crypto.createHash('md5').update(jsonBody).digest('hex')}"`;

  const responseHeaders: Record<string, string> = {
    ...securityHeaders,
    'Content-Type': 'application/json',
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    'ETag': etag,
  };

  const clientEtag = request.headers.get('if-none-match');
  if (clientEtag === etag) {
    return new Response(null, {
      status: 304,
      headers: responseHeaders,
    });
  }

  return new Response(jsonBody, {
    status: 200,
    headers: responseHeaders,
  });
};
