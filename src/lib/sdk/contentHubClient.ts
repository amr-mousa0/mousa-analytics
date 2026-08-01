import { getSafeProjects } from '../../scripts/projectsHelper.js';

export interface ContentHubProjectData {
  title: string;
  projectBadge: string;
  problemText: string;
  solutionText: string;
  impactText: string;
  coverImage: any;
  galleryImages: any[];
  githubUrl?: string;
  dashboardUrl?: string;
  whatsappStartProjectMsg: string;
  whatsappOpenDashboardMsg: string;
  priority: number;
  category: string;
  tags: string[];
  draft: boolean;
  featured: boolean;
  publishedDate: Date | string;
}

export interface ContentHubProject extends ContentHubProjectData {
  id: string;
  slug: string;
  isFallback?: boolean;
  data: ContentHubProjectData;
}



export interface ContentHubConfig {
  version: string;
  languages: string[];
  destinations: string[];
}

export interface ContentHubHealth {
  status: string;
  service: string;
  timestamp?: number;
}

export interface ContentHubVersion {
  service: string;
  version: string;
  commit?: string;
}

function mapToContentHubProject(list: any[]): ContentHubProject[] {
  return list.map(p => ({
    id: p.id || p.slug,
    slug: p.slug || p.id,
    ...p.data,
    data: p.data,
    isFallback: p.isFallback || false
  }));
}

export class ContentHubClient {
  private static getBaseUrl(): string {
    const envUrl = process.env.CONTENT_HUB_API_URL || (import.meta as any).env?.CONTENT_HUB_API_URL;
    const isProd = (import.meta as any).env?.PROD || process.env.NODE_ENV === 'production';

    if (envUrl) {
      return envUrl.replace(/\/+$/, '');
    }

    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }

    if (typeof process !== 'undefined' && process.env) {
      if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
      }
      if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
      }
      if (process.env.SITE_URL) {
        return process.env.SITE_URL.replace(/\/+$/, '');
      }
    }

    if (isProd) {
      return 'https://mousa-analytics.vercel.app';
    }

    // Default local dev fallback
    return 'http://localhost:4321';
  }

  /**
   * Selective Network-Only Retry Execution.
   * Retries ONLY on transport/network failures (timeout, ECONNREFUSED, ENOTFOUND, fetch TypeError).
   * Does NOT retry on HTTP status codes (4xx, 5xx).
   */
  private static async fetchWithSelectiveRetry(
    url: string,
    options: RequestInit = {},
    maxRetries = 2
  ): Promise<Response> {
    const timeoutMs = 5000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const res = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        clearTimeout(timer);
        // Successful HTTP connection made (even if 4xx/5xx) -> return response directly (NO RETRY)
        return res;
      } catch (err: any) {
        clearTimeout(timer);

        const isNetworkError =
          err?.name === 'AbortError' || // Timeout
          err?.name === 'TypeError' ||  // Fetch failed (offline/DNS)
          err?.code === 'ECONNREFUSED' ||
          err?.code === 'ENOTFOUND';

        if (isNetworkError && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 200;
          console.warn(
            `[ContentHubClient] Network transport failure on attempt ${attempt + 1}/${maxRetries + 1} (${err?.message}). Retrying in ${delay}ms...`
          );
          await new Promise(r => setTimeout(r, delay));
          continue;
        }

        // Re-throw unrecoverable or non-network error
        throw err;
      }
    }

    throw new Error(`[ContentHubClient] Network request failed after ${maxRetries + 1} attempts for ${url}`);
  }

  /**
   * Fetches all projects for a target language from Content Hub API
   */
  public static async getProjects(lang = 'en'): Promise<ContentHubProject[]> {
    try {
      const baseUrl = this.getBaseUrl();
      let endpoint = `${baseUrl}/api/projects?lang=${encodeURIComponent(lang)}`;
      let res = await this.fetchWithSelectiveRetry(endpoint);

      if (!res.ok && res.status === 404) {
        endpoint = `${baseUrl}/api/v1/projects?lang=${encodeURIComponent(lang)}`;
        res = await this.fetchWithSelectiveRetry(endpoint);
      }

      if (!res.ok) {
        console.warn(`[ContentHubClient] API returned HTTP ${res.status} for getProjects(${lang}). Using local projects fallback.`);
        return mapToContentHubProject(await getSafeProjects(lang));
      }

      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (Array.isArray(data?.projects) ? data.projects : []);
      if (rawList.length === 0) {
        return mapToContentHubProject(await getSafeProjects(lang));
      }
      
      return rawList.map((p: any) => {
        const title = lang === 'ar' ? (p.titleAr || p.title) : (p.titleEn || p.title);
        const problemText = lang === 'ar' 
          ? (p.problemAr || p.problemEn || p.problemText || p.problem || '') 
          : (p.problemEn || p.problemText || p.problem || '');
        const solutionText = lang === 'ar' 
          ? (p.salesDescriptionAr || p.salesDescriptionEn || p.solutionText || p.solution || '') 
          : (p.salesDescriptionEn || p.solutionText || p.solution || '');
        const impactText = lang === 'ar' 
          ? (p.salesFunnelMetricsAr || p.salesFunnelMetricsEn || p.impactText || p.impact || '') 
          : (p.salesFunnelMetricsEn || p.impactText || p.impact || '');

        const dataObj = p.data || {
          title,
          projectBadge: p.projectBadge || p.category || 'DATA ANALYTICS',
          problemText,
          solutionText,
          impactText,
          coverImage: p.coverImage || p.image || p.imagePath,
          galleryImages: p.galleryImages || p.images || [],
          githubUrl: p.githubUrl || '',
          dashboardUrl: p.dashboardUrl || p.powerBiUrl || p.demoUrl || '',
          whatsappStartProjectMsg: p.whatsappStartProjectMsg || `Hi Amr, I'd like to inquire about ${title}`,
          whatsappOpenDashboardMsg: p.whatsappOpenDashboardMsg || `Hi Amr, I'd like to request access to dashboard for ${title}`,
          priority: p.priority || 1,
          category: p.category || 'Data Analytics',
          tags: p.tags || p.tech || [],
          draft: p.draft || false,
          featured: p.featured ?? true,
          publishedDate: p.publishedDate || p.updatedAt || new Date()
        };

        return {
          id: p.id || p.slug,
          slug: p.slug || p.id,
          ...dataObj,
          data: dataObj,
          isFallback: p.isFallback || false
        };
      });
    } catch (err: any) {
      console.warn(`[ContentHubClient] Graceful degradation on getProjects(${lang}):`, err?.message || err);
      return mapToContentHubProject(await getSafeProjects(lang));
    }
  }

  /**
   * Fetches a specific project by slug from Content Hub API
   */
  public static async getProject(slug: string, lang = 'en'): Promise<ContentHubProject | null> {
    try {
      const projects = await this.getProjects(lang);
      const cleanSlug = slug.split('/').pop();
      const match = projects.find(p => p.slug === slug || p.slug.endsWith(`/${cleanSlug}`));
      return match || null;
    } catch (err: any) {
      console.error(`[ContentHubClient] Graceful degradation on getProject(${slug}):`, err?.message || err);
      return null;
    }
  }

  /**
   * Fetches global Content Hub configuration metadata
   */
  public static async getConfig(): Promise<ContentHubConfig | null> {
    try {
      const baseUrl = this.getBaseUrl();
      const res = await this.fetchWithSelectiveRetry(`${baseUrl}/api/v1/config`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err: any) {
      console.error('[ContentHubClient] Graceful degradation on getConfig():', err?.message || err);
      return null;
    }
  }

  /**
   * Checks Content Hub service health status
   */
  public static async health(): Promise<ContentHubHealth | null> {
    try {
      const baseUrl = this.getBaseUrl();
      const res = await this.fetchWithSelectiveRetry(`${baseUrl}/api/v1/health`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err: any) {
      console.error('[ContentHubClient] Graceful degradation on health():', err?.message || err);
      return null;
    }
  }

  /**
   * Checks Content Hub service version
   */
  public static async version(): Promise<ContentHubVersion | null> {
    try {
      const baseUrl = this.getBaseUrl();
      const res = await this.fetchWithSelectiveRetry(`${baseUrl}/api/v1/version`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err: any) {
      console.error('[ContentHubClient] Graceful degradation on version():', err?.message || err);
      return null;
    }
  }
}
