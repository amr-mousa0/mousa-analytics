# Technical Research & Final Architecture Validation

This document summarizes the final validation of GTM loading performance, XSS-safe serialization, typescript type definitions, and event governance for the portfolio.

---

## 1. GTM Standard Async Loading Validation

### Performance Feasibility
A clean Google Tag Manager container (firing only GA4 tags and zero heavy third-party pixels like marketing trackers, Hotjar, or heavy ads) has negligible impact on paint times. 

On Astro static sites:
- **TBT (Total Blocking Time):** Remaining below 50ms is typical since Astro compiles pages to static HTML with zero hydration script bundles.
- **Lighthouse Performance Score:** Standard asynchronous GTM container loading (`<script async src="..."></script>`) is fully sufficient to maintain Mobile scores >= 90.
- **Recommendation:** Implement standard asynchronous GTM loading. It has zero maintenance footprint, provides 100% bounce-rate tracking, and integrates natively with GTM Tag Assistant debugging.

---

## 2. Safe Serialization & Page Context Metadata

Embedding structured context parameters in layout elements must prevent HTML layout breaks or XSS risks.

### Options Evaluated
1. **Body data-attribute (`<body data-context={JSON.stringify(context)}>`):** Astro automatically HTML-escapes strings inside attributes, making this safe from nesting breakage. However, reading it requires querying the DOM body, and rendering large stringified objects inside layout attributes pollutes the HTML inspector.
2. **Server-Rendered JSON Script Tag (`<script id="page-metadata" type="application/json">`):** Injects metadata cleanly in layout headers. Reading it is simple (`document.getElementById('page-metadata')`), keeps the body tag clean, and is the standard industry pattern.

### Recommendation: Server-Rendered JSON Script Tag
Inject a typed JSON script block in `<head>`. Since all pages compile at build-time from local Git files, raw script values are safe from database-driven runtime XSS injections.

---

## 3. Global Type Safety Finalization

To ensure TypeScript strict mode compatibility without hidden type leaks or casting, we augment the global namespace and declare strict event definitions:

### `src/types/analytics.d.ts`
```typescript
import type { AnalyticsEvent } from '../scripts/analytics';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>;
  }
}
```

### Discriminated Unions (`src/scripts/analytics.ts`)
```typescript
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
  | { event: 'contact_form_submit'; form_id: string };

export type AnalyticsEvent = TrackedEventPayload & EnrichedParams;
```

---

## 4. Solo-Developer Lightweight Governance

For a solo-maintained portfolio, the governance structure is simplified to a single reference registry inside `DESIGN.md` mapping:
1. **Event Name:** Snake case only (matching GA4 recommended events where applicable).
2. **Triggers:** Standard DOM actions or form hooks.
3. **Parameters:** Tracked keys mapping to DLVs.

No change-management boards or proposal phases are required. Developers check the registry, add the TypeScript schema types, configure GTM, and deploy.
