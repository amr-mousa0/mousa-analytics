import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * Safely fetches and sorts social links for a given language.
 * Falls back to an empty array to prevent page layout crashes.
 */
export async function getSafeSocials(lang: string): Promise<CollectionEntry<'socials'>[]> {
  try {
    const allSocials = await getCollection('socials');
    if (allSocials) {
      return allSocials
        .filter((item: CollectionEntry<'socials'>) => item.slug.startsWith(`${lang}/`))
        .sort((a: CollectionEntry<'socials'>, b: CollectionEntry<'socials'>) => (a.data.priority || 0) - (b.data.priority || 0));
    }
  } catch (error) {
    console.warn(`[Defensive Rendering] Error fetching socials for ${lang}:`, error);
  }
  return [];
}
