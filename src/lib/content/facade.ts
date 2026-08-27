import { getCollection, getEntry } from 'astro:content';

export interface ContentQueryOptions {
  lang?: 'en' | 'ar';
  includeDrafts?: boolean;
}

/**
 * Single Canonical Content Access Façade (Task CNT-001 / ADR 001)
 * Enforces a single typed read boundary backed by src/content/ collections.
 */
export class ContentFacade {
  /**
   * Retrieves filtered and sorted projects collection.
   */
  public static async getProjects(options: ContentQueryOptions = {}) {
    const { lang, includeDrafts = false } = options;
    const all = await getCollection('projects', ({ data, id }) => {
      if (!includeDrafts && data.draft) return false;
      if (lang) return id.startsWith(`${lang}/`);
      return true;
    });

    return all.map((entry: any) => {
      const cleanSlug = entry.slug || entry.id.replace(/\.[^/.]+$/, '');
      return {
        ...entry,
        slug: cleanSlug,
        id: entry.id || cleanSlug,
      };
    }).sort((a, b) => (a.data.priority ?? 0) - (b.data.priority ?? 0));
  }

  /**
   * Retrieves single project entry by slug and lang.
   */
  public static async getProjectBySlug(slug: string, lang: 'en' | 'ar' = 'ar') {
    const entryId = `${lang}/${slug}`;
    const entry = await getEntry('projects', entryId as any);
    if (entry && !entry.data.draft) {
      const cleanSlug = (entry as any).slug || entry.id.replace(/\.[^/.]+$/, '');
      return { ...entry, slug: cleanSlug, id: entry.id || cleanSlug };
    }
    const projects = await this.getProjects({ lang });
    return projects.find((p) => p.slug.endsWith(slug) || p.id.endsWith(`${slug}.md`));
  }

  /**
   * Retrieves filtered and sorted services collection.
   */
  public static async getServices(options: ContentQueryOptions = {}) {
    const { lang, includeDrafts = false } = options;
    const all = await getCollection('services', ({ data, id }) => {
      if (!includeDrafts && data.draft) return false;
      if (lang) return id.startsWith(`${lang}/`);
      return true;
    });

    return all.map((entry: any) => {
      const cleanSlug = entry.slug || entry.id.replace(/\.[^/.]+$/, '');
      return {
        ...entry,
        slug: cleanSlug,
        id: entry.id || cleanSlug,
      };
    }).sort((a, b) => (a.data.priority ?? 0) - (b.data.priority ?? 0));
  }

  /**
   * Retrieves single service entry by slug and lang.
   */
  public static async getServiceBySlug(slug: string, lang: 'en' | 'ar' = 'ar') {
    const entryId = `${lang}/${slug}`;
    const entry = await getEntry('services', entryId as any);
    if (entry && !entry.data.draft) {
      const cleanSlug = (entry as any).slug || entry.id.replace(/\.[^/.]+$/, '');
      return { ...entry, slug: cleanSlug, id: entry.id || cleanSlug };
    }
    const services = await this.getServices({ lang });
    return services.find((s) => s.slug.endsWith(slug) || s.id.endsWith(`${slug}.md`));
  }

  /**
   * Retrieves filtered and sorted blog posts collection.
   */
  public static async getBlogPosts(options: ContentQueryOptions = {}) {
    const { lang, includeDrafts = false } = options;
    const all = await getCollection('blog', ({ data, id }) => {
      if (!includeDrafts && data.draft) return false;
      if (lang) return id.startsWith(`${lang}/`);
      return true;
    });

    return all.map((entry: any) => {
      const cleanSlug = entry.slug || entry.id.replace(/\.[^/.]+$/, '');
      return {
        ...entry,
        slug: cleanSlug,
        id: entry.id || cleanSlug,
      };
    }).sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
  }

  /**
   * Retrieves single blog post entry by slug and lang.
   */
  public static async getBlogPostBySlug(slug: string, lang: 'en' | 'ar' = 'ar') {
    const entryId = `${lang}/${slug}`;
    const entry = await getEntry('blog', entryId as any);
    if (entry && !entry.data.draft) {
      const cleanSlug = (entry as any).slug || entry.id.replace(/\.[^/.]+$/, '');
      return { ...entry, slug: cleanSlug, id: entry.id || cleanSlug };
    }
    const posts = await this.getBlogPosts({ lang });
    return posts.find((p) => p.slug.endsWith(slug) || p.id.endsWith(`${slug}.md`));
  }

  /**
   * Retrieves localized hero entry.
   */
  public static async getHeroEntry(lang: 'en' | 'ar' = 'ar') {
    return await getEntry('hero', lang as any);
  }

  /**
   * Retrieves filtered and sorted socials collection.
   */
  public static async getSocials(lang?: 'en' | 'ar') {
    const all = await getCollection('socials');
    const filtered = (all || []).filter((item: any) => {
      const key = item.slug || item.id || '';
      if (lang) return key.startsWith(`${lang}/`);
      return true;
    });
    return filtered.map((entry: any) => {
      const cleanSlug = entry.slug || entry.id?.replace(/\.[^/.]+$/, '') || '';
      return {
        ...entry,
        slug: cleanSlug,
        id: entry.id || cleanSlug,
      };
    }).sort((a: any, b: any) => (a.data.priority ?? 0) - (b.data.priority ?? 0));
  }

  /**
   * Retrieves filtered and sorted capabilities collection.
   */
  public static async getCapabilities(options: ContentQueryOptions = {}) {
    const { lang, includeDrafts = false } = options;
    const all = await getCollection('capabilities', ({ data, id }) => {
      if (!includeDrafts && data.draft) return false;
      if (lang) return id.startsWith(`${lang}/`);
      return true;
    });

    return all.map((entry: any) => {
      const cleanSlug = entry.slug || entry.id.replace(/\.[^/.]+$/, '');
      return {
        ...entry,
        slug: cleanSlug,
        id: entry.id || cleanSlug,
      };
    }).sort((a, b) => (a.data.priority ?? 0) - (b.data.priority ?? 0));
  }
}
