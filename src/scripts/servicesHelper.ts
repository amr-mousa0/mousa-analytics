import { ContentFacade } from '../lib/content/facade.js';
import type { CollectionEntry } from 'astro:content';

export interface ExtendedService extends CollectionEntry<'services'> {
  isFallback?: boolean;
}

/**
 * Safely fetches and sorts services for a given language, supporting
 * translation fallbacks, draft filtering, and deterministic featured sorting.
 */
export async function getSafeServices(lang: string): Promise<ExtendedService[]> {
  try {
    const allServices = await ContentFacade.getServices({ includeDrafts: !import.meta.env.PROD }) as ExtendedService[];
    if (!allServices) return [];

    const isProd = import.meta.env.PROD;
    const showDrafts = !isProd;

    // Filter by draft status
    const activeServices = allServices.filter(item => showDrafts || !item.data.draft);

    // Group by target language
    const currentLocaleServices: ExtendedService[] = activeServices
      .filter(item => item.slug.startsWith(`${lang}/`))
      .map(item => ({ ...item, isFallback: false }));

    // Find fallbacks from the alternate language
    const otherLocale = lang === 'en' ? 'ar' : 'en';
    const otherLocaleServices = activeServices.filter(item => item.slug.startsWith(`${otherLocale}/`));

    otherLocaleServices.forEach(otherService => {
      const otherBase = otherService.slug.split('/').slice(1).join('/');
      const existsInCurrent = currentLocaleServices.some(curr => {
        const currBase = curr.slug.split('/').slice(1).join('/');
        return currBase === otherBase;
      });
      if (!existsInCurrent) {
        currentLocaleServices.push({
          ...otherService,
          isFallback: true,
        });
      }
    });

    // Deterministic sorting: Featured first, then by priority, then by date descending
    return currentLocaleServices.sort((a, b) => {
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
    console.warn(`[Defensive Rendering] Error fetching services for ${lang}:`, error);
  }
  return [];
}

