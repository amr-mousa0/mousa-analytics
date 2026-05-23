import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * Safely fetches and sorts services for a given language.
 * Falls back to an empty array to prevent page layout crashes.
 */
export async function getSafeServices(lang: string): Promise<CollectionEntry<'services'>[]> {
  try {
    const allServices = await getCollection('services');
    if (allServices) {
      return allServices
        .filter((item: CollectionEntry<'services'>) => item.slug.startsWith(`${lang}/`))
        .sort((a: CollectionEntry<'services'>, b: CollectionEntry<'services'>) => (a.data.priority || 0) - (b.data.priority || 0));
    }
  } catch (error) {
    console.warn(`[Defensive Rendering] Error fetching services for ${lang}:`, error);
  }
  return [];
}
