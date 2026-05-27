import { getCollection, type CollectionEntry } from 'astro:content';

export interface ExtendedProject extends CollectionEntry<'projects'> {
  isFallback?: boolean;
}

/**
 * Safely fetches and sorts projects for a given language, supporting
 * translation fallbacks, draft filtering, and deterministic featured sorting.
 */
export async function getSafeProjects(lang: string): Promise<ExtendedProject[]> {
  try {
    const allProjects = await getCollection('projects');
    if (!allProjects) return [];

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
      // 1. Featured first
      const featA = a.data.featured ? 1 : 0;
      const featB = b.data.featured ? 1 : 0;
      if (featA !== featB) return featB - featA;

      // 2. Priority ascending
      if (a.data.priority !== b.data.priority) {
        return a.data.priority - b.data.priority;
      }

      // 3. Date descending
      const dateA = new Date(a.data.publishedDate).getTime();
      const dateB = new Date(b.data.publishedDate).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.warn(`[Defensive Rendering] Error fetching projects for ${lang}:`, error);
  }
  return [];
}
