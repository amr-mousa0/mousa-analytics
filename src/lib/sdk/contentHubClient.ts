export interface ContentHubProject {
  id: string;
  slug: string;
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
  isFallback?: boolean;
  data?: Omit<ContentHubProject, 'data'>;
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

export class ContentHubClient {
  private static getBaseUrl(): string {
    const envUrl = process.env.CONTENT_HUB_API_URL || (import.meta as any).env?.CONTENT_HUB_API_URL;
    const isProd = (import.meta as any).env?.PROD || process.env.NODE_ENV === 'production';

    if (envUrl) {
      return envUrl.replace(/\/+$/, '');
    }

    if (isProd) {
      throw new Error(
        '[ContentHubClient Security Failure] CONTENT_HUB_API_URL environment variable is strictly required in production environment.'
      );
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
      const endpoint = `${baseUrl}/api/v1/projects?lang=${encodeURIComponent(lang)}`;
      const res = await this.fetchWithSelectiveRetry(endpoint);

      if (!res.ok) {
        console.error(`[ContentHubClient] API returned HTTP ${res.status} for getProjects(${lang})`);
        return [];
      }

      const data = await res.json();
      return Array.isArray(data.projects) ? data.projects : [];
    } catch (err: any) {
      console.error(`[ContentHubClient] Graceful degradation on getProjects(${lang}):`, err?.message || err);
      return [];
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
