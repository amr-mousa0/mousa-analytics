export interface PageContext {
  locale: 'en' | 'ar';
  pathname: string;
  slug: string;
  contentType: 'service' | 'project' | 'blog' | 'page';
  pageCategory: string;
  environment: 'development' | 'staging' | 'production';
  isFallback: boolean;
}

export const getPageContext = (): PageContext => {
  if (typeof window === 'undefined') {
    return {
      locale: 'en',
      pathname: '',
      slug: '',
      contentType: 'page',
      pageCategory: 'general',
      environment: 'production',
      isFallback: false
    };
  }

  const metaEl = document.getElementById('page-metadata');
  if (metaEl && metaEl.textContent) {
    try {
      const parsed = JSON.parse(metaEl.textContent);
      return {
        locale: parsed.locale || 'en',
        pathname: window.location.pathname,
        slug: parsed.slug || 'home',
        contentType: parsed.contentType || 'page',
        pageCategory: parsed.pageCategory || 'general',
        environment: parsed.environment || 'production',
        isFallback: !!parsed.isFallback
      };
    } catch (e) {
      console.error('[PageContext] Error parsing script JSON metadata', e);
    }
  }

  return {
    locale: window.location.pathname.startsWith('/ar') ? 'ar' : 'en',
    pathname: window.location.pathname,
    slug: 'home',
    contentType: 'page',
    pageCategory: 'general',
    environment: 'production',
    isFallback: false
  };
};
