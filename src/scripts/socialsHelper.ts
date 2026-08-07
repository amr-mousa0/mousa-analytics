import { ContentFacade } from '../lib/content/facade.js';
import type { CollectionEntry } from 'astro:content';

/**
 * Safely fetches and sorts social links for a given language.
 * Falls back to an empty array to prevent page layout crashes.
 */
export async function getSafeSocials(lang: string): Promise<CollectionEntry<'socials'>[]> {
  try {
    const socials = await ContentFacade.getSocials(lang as 'en' | 'ar');
    return socials as CollectionEntry<'socials'>[];
  } catch (error) {
    console.warn(`[Defensive Rendering] Error fetching socials for ${lang}:`, error);
  }
  return [];
}
