# Data Model: Content Collections Schema

This document defines the schema interfaces and validation rules for the Astro Content Collections.

## Schemas

### 1. SEO Schema (`seo`)
Represents the localized metadata and open-graph properties for each page route.
Stored at: `src/content/seo/[lang]/[page].md`

```typescript
import { z } from 'astro:content';

export const seoSchema = z.object({
  title: z.string().max(60, "Title should be under 60 characters for optimal SEO display"),
  description: z.string().max(160, "Description should be under 160 characters for search snippets"),
  keywords: z.array(z.string()).optional(),
  ogImage: z.string().url().optional(),
});
```

### 2. Services Schema (`services`)
Defines cards for data analytics and social media marketing service offerings.
Stored at: `src/content/services/[lang]/[service-id].md`

```typescript
import { z } from 'astro:content';

export const servicesSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string().describe("Lucide icon identifier name"),
  features: z.array(z.string()).describe("Bullet list of service details"),
  priority: z.number().int().default(0).describe("Order weight of service display"),
});
```

### 3. Socials Schema (`socials`)
Contains standard configuration for social channels (LinkedIn, GitHub, Twitter, WhatsApp).
Stored at: `src/content/socials/[lang]/[social-id].md`

```typescript
import { z } from 'astro:content';

export const socialsSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  icon: z.string().describe("FontAwesome or custom icon class"),
  priority: z.number().int().default(0),
});
```

## Relationships

All collections are mapped per-locale:
- A page query retrieves dynamic contents by matching the `lang` route parameter: `${lang}/homepage.md`
- Layout components query the respective language folder to construct header/footer menus.
