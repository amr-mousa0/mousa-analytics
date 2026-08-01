import type { APIRoute } from 'astro';
import { getSafeProjects } from '../../scripts/projectsHelper.js';
import { PublishWorker } from '../../lib/workers/publishWorker.js';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const lang = url.searchParams.get('lang') || 'en';
  
  console.log(`[Pipeline] [14/15] /api/projects source reload triggered for lang="${lang}"`);

  const fileProjects = await getSafeProjects(lang);
  const inMemoryProjects = PublishWorker.getPublishedProjects();

  console.log(`[Pipeline] /api/projects reload complete - Total projects exposed: ${fileProjects.length}`);

  return new Response(
    JSON.stringify({
      status: 'success',
      count: fileProjects.length,
      publishedStoreCount: inMemoryProjects.length,
      projects: fileProjects
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    }
  );
};
