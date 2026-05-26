import { getPageContext } from './pageContext';

export interface EnrichedParams {
  language: 'en' | 'ar';
  page_path: string;
  analytics_env: 'development' | 'staging' | 'production';
  timestamp: string;
}

export type TrackedEventPayload =
  | { event: 'project_view'; slug: string; title: string; category: string }
  | { event: 'service_view'; slug: string; title: string; category: string }
  | { event: 'language_switch'; source_lang: 'en' | 'ar'; target_lang: 'en' | 'ar' }
  | { event: 'cta_click'; cta_text: string; cta_type: 'whatsapp' | 'email' | 'call' | 'form'; context_slug?: string }
  | { event: 'contact_form_submit'; form_id: string }
  | { event: 'contact_submit_whatsapp'; service_type: string; timeline: string };

export type AnalyticsEvent = TrackedEventPayload & EnrichedParams;

export const trackEvent = (payload: TrackedEventPayload) => {
  if (typeof window === 'undefined') return;

  const context = getPageContext();

  // Traffic Isolation: Disable analytics tracking on development unless explicit debug query is active
  if (context.environment === 'development' && !window.location.search.includes('gtm_debug=true')) {
    return;
  }

  // Initialize dataLayer safely
  window.dataLayer = window.dataLayer || [];

  // Enrich payload with default page-level variables
  const fullPayload: AnalyticsEvent = {
    ...payload,
    language: context.locale,
    page_path: context.pathname,
    analytics_env: context.environment,
    timestamp: new Date().toISOString()
  };

  window.dataLayer.push(fullPayload);
};
