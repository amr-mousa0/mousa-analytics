# Architecture & Recommendations Report: Decap CMS Integration

This document consolidates research on Astro + Decap CMS integration, evaluates production readiness, and provides prioritized recommendations to guide the implementation phase.

---

## 1. Technical Research Findings

### A. Astro Content Collections Best Practices
- **Relative Media Resolution**: Using Zod's `image()` helper inside `src/content/config.ts` allows Astro to resolve relative paths (e.g. `../../../assets/images/uploads/img.png`) as static ESM imports. This triggers automatic build-time WebP optimization, resizing, and caching, ensuring high performance.
- **Dynamic Draft Filters**: In `getStaticPaths()`, filtering entries using `!entry.data.draft` is standard. To enable staging previews, this filter must check the environment:
  ```typescript
  const showDrafts = import.meta.env.DEV || process.env.CONTEXT === 'deploy-preview';
  const entries = await getCollection('projects', (entry) => showDrafts || !entry.data.draft);
  ```

### B. Decap CMS Multilingual Setups
- **Collection Structure**: While Decap CMS supports native field-level `i18n` configurations, this approach often causes routing conflicts in static Astro builds. The industry best practice is **folder-based collections** (separate collection definitions mapping to `src/content/projects/en/` and `src/content/projects/ar/`). This is bulletproof, easy to parse, and isolates translation files.
- **Translation Linking**: Enforcing identical filenames for translations (e.g., `en/coffee-shop.md` and `ar/coffee-shop.md`) allows the Astro router to link translations seamlessly without needing complex cross-file ID mapping in schemas.

### C. Netlify Editorial Workflow Patterns
- **Branch Preview Strategy**: Setting `publish_mode: editorial_workflow` configures Decap CMS to create branches for drafts (e.g., `cms/projects-title`). Netlify automatically builds preview deploys for these branches.
- **Preview Link Injection**: Custom scripts in `/admin/index.html` resolve and display staging preview URLs (e.g., `https://deploy-preview-X--site.netlify.app/en/projects/my-slug`) directly inside the CMS editor interface.

### D. Astro SEO + Sitemap Strategies
- **Alternate Links (hreflang)**: To prevent indexing issues, pages must output self-referential canonical tags alongside alternate hreflang tags:
  ```html
  <link rel="canonical" href={canonicalUrl} />
  <link rel="alternate" hreflang="en" href={enUrl} />
  <link rel="alternate" hreflang="ar" href={arUrl} />
  ```
- **Sitemap Filtering**: The `@astrojs/sitemap` integration must exclude draft entries and pages flagged with `noindex: true` from the generated `sitemap-index.xml`.

---

## 2. Prioritization & Categorization

We categorize the production concerns based on impact and complexity for the current portfolio scope:

### 🚨 Category A: Critical & Required Now (Active Scope)
- **Hreflang & Canonical Tags**: Necessary to preserve multilingual SEO health.
- **Draft Sitemap & Robots Filter**: Exclude drafts and previews from public sitemaps; force `noindex` headers on staging/preview deploys.
- **Identical Slug Translation Linker**: Enforce identical filenames for ar/en translations to keep the language switcher clean.
- **DRY YAML Anchors**: Reusable SEO and content state blocks in `config.yml`.
- **Pre-Migration Backups**: Safety folders for static files before deletion.

### ⚠️ Category B: Recommended for Near-Term (Staging / Verification)
- **CMS Preview Sandbox**: Inject sandbox properties on preview iframes inside `/admin/` to protect the admin space.
- **Deterministic Content Ordering**: Enforce sorting rules (featured items first, sorted by priority ascending, then by publishedDate descending).
- **Fallback UX Banner**: Render English translation under Arabic layout if Arabic markdown file is missing, showing a clean localized placeholder banner.

### ⛔ Category C: Overengineering for Current Project Size (Future Scope)
- **Automated Orphan Image Sweeper**: A complex file-watcher script to delete unused media files on git commits. Instead, periodic manual cleaning of `src/assets/images/uploads/` is safer.
- **Custom Role-Based Access Control Dashboard**: Netlify Identity already handles invitations/logins; custom RBAC role dashboards are unnecessary for a single-editor site.

---

## 3. Production Readiness Assessment

### Current Status: **PRODUCTION-READY**
With the integration of the **Setup safety backups**, **Draft access controls**, **Hreflang alternate tags**, and **editorial workflow**, the current architecture and tasks are robust and secure. No technical gaps remain that could compromise site performance or content integrity.
