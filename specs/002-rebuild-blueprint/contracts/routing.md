# Route Interface Contract

## Localized Routing Paths

| Route Path | Language | Component Template | Purpose |
|------------|----------|-------------------|---------|
| `/en/` | English | `src/pages/[lang]/index.astro` | English Portfolio Landing Page |
| `/ar/` | Arabic | `src/pages/[lang]/index.astro` | Arabic Portfolio Landing Page |
| `/en/methodology/` | English | `src/pages/[lang]/methodology.astro` | English Work Methodology Page |
| `/ar/methodology/` | Arabic | `src/pages/[lang]/methodology.astro` | Arabic Work Methodology Page |

## Guards & Redirect Rules

- Direct visits to the root URL `/` MUST redirect automatically to `/en/` or parse browser preferences.
- Any visit to `/[lang]/` where `lang` is not in `['en', 'ar']` MUST redirect immediately to `/en/` with a HTTP 302 status.
- URL hashes (e.g. `/#contact`) used for smooth-scrolling anchors MUST be cleaned from the browser address bar using the HTML5 History API (`history.replaceState`) after navigation completes to keep the URL pristine.
