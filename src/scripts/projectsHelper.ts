import { ContentFacade } from '../lib/content/facade.js';
import { PublishWorker } from '../lib/workers/publishWorker.js';
import { formatCardDescription } from '../lib/utils/descriptionFormatter.js';

export interface ExtendedProjectData {
  title: string;
  projectBadge: string;
  problemText: string;
  solutionText: string;
  impactText: string;
  coverImage: any;
  galleryImages: any[];
  githubUrl?: string;
  dashboardUrl?: string;
  pdfUrl?: string;
  whatsappStartProjectMsg: string;
  whatsappOpenDashboardMsg: string;
  priority: number;
  category: string;
  tags: string[];
  draft: boolean;
  featured: boolean;
  publishedDate: Date;
  galleryTab?: string;
  dashboardTab?: string;
  dashboardPrompt?: string;
  dashboardBtn?: string;
  inquireTitle?: string;
  inquireDesc?: string;
  inquireBtn?: string;
  translationKey?: string;
}

export interface ExtendedProject {
  id: string;
  slug: string;
  body: string;
  collection: 'projects';
  data: ExtendedProjectData;
  render?: () => Promise<any>;
  isFallback?: boolean;
}

/**
 * Safely fetches and sorts projects for a given language, supporting
 * translation fallbacks, draft filtering, and deterministic featured sorting.
 * Merges published store items from PublishWorker to ensure dynamic webhooks update instantly.
 */
export async function getSafeProjects(lang: string): Promise<ExtendedProject[]> {
  try {
    let allProjects: ExtendedProject[] = [];
    try {
      const fileCollection = await ContentFacade.getProjects({ includeDrafts: true });
      if (fileCollection) {
        allProjects = fileCollection.map((p: any) => ({
          ...p,
          data: {
            ...p.data,
            problemText: formatCardDescription(p.data?.problemText || '')
          }
        } as ExtendedProject));
      }
    } catch (e) {
      console.warn('[Defensive Rendering] Warning fetching static project collection:', e);
    }

    // Merge in-memory published projects from webhook pipeline runs
    const publishedModels = PublishWorker.getPublishedProjects();
    publishedModels.forEach(model => {
      if (model.isFallback || model.publish?.portfolio?.enabled === false) {
        return;
      }
      const slug = `${lang}/${model.projectId}`;
      const exists = allProjects.some(p => p.slug === slug || p.slug.endsWith(`/${model.projectId}`));
      if (!exists) {
        const title = lang === 'ar' ? (model.titleAr || model.title) : model.title;
        const rawProblem = lang === 'ar' ? (model.problemAr || model.problem || model.description) : (model.problem || model.description);
        const problemText = formatCardDescription(rawProblem);
        const solutionText = lang === 'ar' ? (model.solutionAr || model.solution || model.description) : (model.solution || model.description);
        const impactText = lang === 'ar' ? (model.businessValueAr || model.businessValue || model.description) : (model.businessValue || model.description);

        allProjects.push({
          id: `${lang}/${model.projectId}.md`,
          slug: `${lang}/${model.projectId}`,
          body: `Case Study: ${title}`,
          collection: 'projects',
          data: {
            title,
            projectBadge: (model.tags?.[0] || 'Data Analytics').toUpperCase(),
            problemText,
            solutionText,
            impactText,
            coverImage: (model.cover || '../../../assets/images/uploads/marketing-roi.webp') as any,
            galleryImages: (model.gallery?.map(g => g.url) || []) as any,
            githubUrl: `https://github.com/amr-mousa0/${model.sourceRepo || model.projectId}`,
            dashboardUrl: model.demo || '',
            pdfUrl: model.pdfUrl || model.gallery?.find(g => g.type === 'pdf')?.url || undefined,
            whatsappStartProjectMsg: `Hi Amr, I'd like to inquire about ${title}`,
            whatsappOpenDashboardMsg: `Hi Amr, I'd like to request access to dashboard for ${title}`,
            priority: 1,
            category: 'Data Analytics',
            tags: model.tags || ['Data Analytics'],
            draft: false,
            featured: model.publish?.portfolio?.featured ?? true,
            publishedDate: new Date(model.updatedAt || Date.now())
          }
        });
      }
    });

    const isProd = import.meta.env.PROD;
    const showDrafts = !isProd;

    // Filter by draft status
    const activeProjects = allProjects.filter(item => showDrafts || !item.data.draft);

    // Group by target language
    const currentLocaleProjects: ExtendedProject[] = activeProjects
      .filter(item => item.slug.startsWith(`${lang}/`))
      .map(item => ({ ...item, isFallback: false }));

    // Find fallbacks from the alternate language
    const otherLocale = lang === 'en' ? 'ar' : 'en';
    const otherLocaleProjects = activeProjects.filter(item => item.slug.startsWith(`${otherLocale}/`));

    otherLocaleProjects.forEach(otherProject => {
      const otherBase = otherProject.slug.split('/').slice(1).join('/');
      const existsInCurrent = currentLocaleProjects.some(curr => {
        const currBase = curr.slug.split('/').slice(1).join('/');
        return currBase === otherBase;
      });
      if (!existsInCurrent) {
        currentLocaleProjects.push({
          ...otherProject,
          isFallback: true,
        });
      }
    });

    // Deterministic sorting: Featured first, then by priority, then by date descending
    return currentLocaleProjects.sort((a, b) => {
      const featA = a.data.featured ? 1 : 0;
      const featB = b.data.featured ? 1 : 0;
      if (featA !== featB) return featB - featA;

      if (a.data.priority !== b.data.priority) {
        return a.data.priority - b.data.priority;
      }

      const dateA = new Date(a.data.publishedDate).getTime();
      const dateB = new Date(b.data.publishedDate).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.warn(`[Defensive Rendering] Error fetching projects for ${lang}:`, error);
  }
  return [];
}
