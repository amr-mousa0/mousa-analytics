import type { APIRoute } from 'astro';
import { ContentFacade } from '../../lib/content/facade.js';
import { getSecurityHeaders, handleCorsPreflight } from '../../lib/security/corsPolicy.js';
import { formatCardDescription } from '../../lib/utils/descriptionFormatter.js';
import { getDbClient } from '../../lib/db.js';
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
  
  // 1. Fetch file-based projects from Content Collection
  const rawProjects = await ContentFacade.getProjects({ lang });
  const projectMap = new Map<string, any>();

  rawProjects.forEach(p => {
    const formattedProblem = formatCardDescription(p.data.problemText);
    const cleanSlug = p.slug.replace(/^(ar|en)\//, '').split('/').pop() || p.slug;
    projectMap.set(cleanSlug, {
      id: p.id,
      slug: cleanSlug,
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
      pdfUrl: p.data.pdfUrl || undefined,
      githubUrl: p.data.githubUrl || '',
      whatsappStartProjectMsg: p.data.whatsappStartProjectMsg,
      whatsappOpenDashboardMsg: p.data.whatsappOpenDashboardMsg,
      priority: p.data.priority,
      category: p.data.category,
      tags: p.data.tags || [],
      draft: p.data.draft,
      featured: p.data.featured,
      publishedDate: p.data.publishedDate,
    });
  });

  // 2. Fetch live published projects from Database (Prisma)
  try {
    const db = getDbClient();
    const dbProjects = await db.project.findMany({
      where: { draft: false }
    });

    dbProjects.forEach((p: any) => {
      const cleanSlug = p.slug;
      const title = lang === 'ar' ? (p.titleAr || p.titleEn) : p.titleEn;
      const rawProblem = lang === 'ar' ? (p.summaryAr || p.summaryEn) : p.summaryEn;
      const formattedProblem = formatCardDescription(rawProblem);
      const solution = lang === 'ar' ? (p.contentAr || p.contentEn) : p.contentEn;
      const impact = lang === 'ar' ? (p.contentAr || p.contentEn) : p.contentEn;

      projectMap.set(cleanSlug, {
        id: `${lang}/${cleanSlug}`,
        slug: cleanSlug,
        data: {
          title,
          projectBadge: p.category || 'TECH & WEB SOLUTIONS',
          problemText: formattedProblem,
          solutionText: solution,
          impactText: impact,
          coverImage: p.cover || 'https://raw.githubusercontent.com/amr-mousa0/' + cleanSlug + '/main/assets/cover.webp',
          galleryImages: Array.isArray(p.gallery) ? p.gallery : [],
          pdfUrl: p.pdfUrl || undefined,
          githubUrl: `https://github.com/amr-mousa0/${cleanSlug}`,
          whatsappStartProjectMsg: lang === 'ar' ? 'مرحباً عمرو، أود الاستفسار عن هذا المشروع' : 'Hi Amr, I\'d like to inquire about this project',
          whatsappOpenDashboardMsg: lang === 'ar' ? 'مرحباً عمرو، أود الاطلاع على التفاصيل' : 'Hi Amr, I\'d like to request the interactive dashboard',
          priority: p.priority ?? 50,
          category: p.category || 'Data Analytics',
          tags: p.tags || [],
          draft: false,
          featured: p.featured || false,
          publishedDate: p.updatedAt?.toISOString() || new Date().toISOString(),
        },
        title,
        projectBadge: p.category || 'TECH & WEB SOLUTIONS',
        problemText: formattedProblem,
        solutionText: solution,
        impactText: impact,
        coverImage: p.cover || 'https://raw.githubusercontent.com/amr-mousa0/' + cleanSlug + '/main/assets/cover.webp',
        galleryImages: Array.isArray(p.gallery) ? p.gallery : [],
        pdfUrl: p.pdfUrl || undefined,
        githubUrl: `https://github.com/amr-mousa0/${cleanSlug}`,
        whatsappStartProjectMsg: lang === 'ar' ? 'مرحباً عمرو، أود الاستفسار عن هذا المشروع' : 'Hi Amr, I\'d like to inquire about this project',
        whatsappOpenDashboardMsg: lang === 'ar' ? 'مرحباً عمرو، أود الاطلاع على التفاصيل' : 'Hi Amr, I\'d like to request the interactive dashboard',
        priority: p.priority ?? 50,
        category: p.category || 'Data Analytics',
        tags: p.tags || [],
        draft: false,
        featured: p.featured || false,
        publishedDate: p.updatedAt?.toISOString() || new Date().toISOString(),
      });
    });
  } catch (dbErr: any) {
    // Graceful fallback to file projects if DB is unreachable
  }

  const projects = Array.from(projectMap.values()).sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  const jsonBody = JSON.stringify(projects);
  const etag = `W/"${crypto.createHash('md5').update(jsonBody).digest('hex')}"`;

  const responseHeaders: Record<string, string> = {
    ...securityHeaders,
    'Content-Type': 'application/json',
    'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60',
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
