import type { APIRoute } from 'astro';
import { ContentFacade } from '../../lib/content/facade.js';
import { getSecurityHeaders, handleCorsPreflight } from '../../lib/security/corsPolicy.js';
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
  const rawServices = await ContentFacade.getServices({ lang });

  const services = rawServices.map(s => ({
    id: s.id,
    slug: s.slug,
    data: s.data,
    title: s.data.title,
    description: s.data.description,
    icon: s.data.icon,
    priority: s.data.priority,
    category: s.data.category,
    tags: s.data.tags || [],
    execSummaryText: s.data.execSummaryText,
    scopeTitle: s.data.scopeTitle,
    scopeItems: s.data.scopeItems || [],
    deliverablesTitle: s.data.deliverablesTitle,
    deliverablesItems: s.data.deliverablesItems || [],
    ctaTitle: s.data.ctaTitle,
    ctaDesc: s.data.ctaDesc,
    ctaBtn: s.data.ctaBtn,
    whatsappMessage: s.data.whatsappMessage,
    faqTitle: s.data.faqTitle,
    faqItems: s.data.faqItems || [],
    draft: s.data.draft,
    featured: s.data.featured,
    publishedDate: s.data.publishedDate,
  }));

  const jsonBody = JSON.stringify(services);
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
