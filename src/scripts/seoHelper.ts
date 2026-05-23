import { getEntry } from 'astro:content';

export interface SeoData {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
}

const DEFAULT_SEO: SeoData = {
  title: "Amr Mousa | Data Analyst & Marketer",
  description: "Portfolio of Amr Mousa, Data Analyst and Digital Marketing Strategist.",
  keywords: ["data analyst", "digital marketing", "portfolio"],
  ogImage: "",
};

/**
 * Safely fetches SEO metadata for a given page and language.
 * Enforces defensive rendering fallback to prevent application crashes.
 */
export async function getSafeSeo(lang: string, pageId: string): Promise<SeoData> {
  try {
    const entry = await getEntry('seo', `${lang}/${pageId}`);
    if (entry && entry.data) {
      return {
        title: entry.data.title,
        description: entry.data.description,
        keywords: entry.data.keywords,
        ogImage: entry.data.ogImage,
      };
    }
    console.warn(`[Defensive Rendering] SEO entry not found for: ${lang}/${pageId}. Using defaults.`);
  } catch (error) {
    console.warn(`[Defensive Rendering] Error fetching SEO for ${lang}/${pageId}:`, error);
  }
  return DEFAULT_SEO;
}
