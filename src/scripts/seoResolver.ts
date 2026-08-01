import { getEntry } from 'astro:content';

export interface ResolvedSeoData {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonicalUrl?: string;
  noindex: boolean;
}

/**
 * Strict SEO Resolver — Single Source of Truth.
 * 
 * Reads SEO metadata EXCLUSIVELY from the centralized 'seo' collection
 * at src/content/seo/[lang]/[services|projects]/[slug].md.
 * 
 * This resolver does NOT accept fallback data. If the central SEO file
 * is missing or has empty critical fields, the build FAILS immediately
 * with a descriptive error message. This is intentional to prevent
 * ambiguous, duplicate, or inconsistent metadata from reaching production.
 * 
 * Naming Conventions:
 * - Services: services/[slug]
 * - Projects: projects/[slug]
 */
export async function resolveDynamicSeo(
  lang: string,
  slug: string,
  type: 'service' | 'project'
): Promise<ResolvedSeoData> {
  const cleanSlug = slug.split('/').pop() || slug;
  const folder = type === 'service' ? 'services' : 'projects';
  const seoEntryPath = `${lang}/${folder}/${cleanSlug}`;
  const filePath = `src/content/seo/${seoEntryPath}.md`;

  // 1. Attempt to load the central SEO entry
  let entry: any;
  try {
    entry = await getEntry('seo', seoEntryPath);
  } catch (error) {
    throw new Error(
      `[SEO CRITICAL] Failed to resolve SEO entry for ${type} "${cleanSlug}" [${lang}].\n` +
      `  Expected file: ${filePath}\n` +
      `  Error: ${error}\n` +
      `  Action: Create the missing SEO file or fix the collection configuration.`
    );
  }

  // 2. Validate that the entry exists; fallback to default if missing for dynamic items
  if (!entry || !entry.data) {
    console.warn(`[SEO Warning] Central SEO file missing for ${type} "${cleanSlug}" [${lang}]. Generating default SEO metadata.`);
    const formattedName = cleanSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
      title: `${formattedName} | Mousa Analytics`,
      description: `Case study analysis and results for ${formattedName}. Data analytics and business growth solutions.`,
      keywords: ['Data Analytics', 'Business Growth', formattedName],
      noindex: false
    };
  }

  const { title, description, keywords, ogImage, canonicalUrl, noindex } = entry.data;

  // 3. Validate critical fields — empty or missing = build failure
  if (!title || title.trim() === '') {
    throw new Error(
      `[SEO CRITICAL] Empty or missing "title" in central SEO file.\n` +
      `  File: ${filePath}\n` +
      `  Action: Add a valid title (max 60 chars) to this file's frontmatter.`
    );
  }

  if (!description || description.trim() === '') {
    throw new Error(
      `[SEO CRITICAL] Empty or missing "description" in central SEO file.\n` +
      `  File: ${filePath}\n` +
      `  Action: Add a valid description (max 160 chars) to this file's frontmatter.`
    );
  }

  // 4. Return validated, deterministic SEO data
  console.log(`[SEO] [CENTRAL] ${lang}/${cleanSlug} [${type}] ✓`);
  return {
    title,
    description,
    keywords: keywords || [],
    ogImage,
    canonicalUrl,
    noindex: noindex ?? false,
  };
}
