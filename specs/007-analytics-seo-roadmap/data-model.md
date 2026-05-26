# Data Model: Simplified Analytics & Blog Schemas

This document defines the simplified, type-safe structures for event tracking, JSON page context script blocks, and blog content collections.

---

## 1. Type-Safe Core Events

```typescript
export interface BaseEventParams {
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

export type AnalyticsEvent = TrackedEventPayload & BaseEventParams;
```

---

## 2. Global Window DataLayer Types (`src/types/analytics.d.ts`)

```typescript
import type { AnalyticsEvent } from '../scripts/analytics';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>;
  }
}
```

---

## 3. Page Context Interface (JSON Script Block)

```typescript
export interface PageContext {
  locale: 'en' | 'ar';
  slug: string;
  contentType: 'service' | 'project' | 'blog' | 'page';
  pageCategory: string;
}
```

---

## 4. Blog Collection Schema (`src/content/config.ts`)

```typescript
import { defineCollection, z, type SchemaContext } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: ({ image }: SchemaContext) => z.object({
    title: z.string().max(60, "Meta title should be under 60 characters for optimal display"),
    description: z.string().max(160, "Meta description should be under 160 characters for search snippets"),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    coverImage: image().optional(),
    author: z.string().default("Amr Mousa"),
    category: z.enum(["Data Analytics", "Digital Marketing", "Systems Automation", "Web Development"]),
    tags: z.array(z.string()).default([]),
    translationKey: z.string(),
    draft: z.boolean().default(true),
    seo: z.object({
      metaTitle: z.string(),
      metaDescription: z.string(),
      ogImage: z.string().optional(),
      canonicalUrl: z.string().optional(),
      noindex: z.boolean().default(false),
    }),
  }),
});
```
