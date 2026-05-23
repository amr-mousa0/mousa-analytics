# Research & Decision Log: Master Rebuild Blueprint

## 1. Localized Routing & Parameter Guards

### Decision
Implement localization natively using Astro's directory structure `src/pages/[lang]/` and restrict route parameters strictly in the page frontmatter with a validation guard.

### Rationale
Using directory-based parameters `[lang]` is standard in Astro and generates static routes efficiently. A strict validation block in the frontmatter prevents users from navigating to unsupported languages (e.g. `/fr/`) and ensures dynamic server rendering or static site builds do not run with undefined localized parameters.

### Alternatives Considered
- **Astro i18n middleware**: Avoided to keep layout and routing logic isolated and highly explicit, adhering to the "no global client runtime/routing" rule.
- **Client-side routing wrapper**: Rejected because it requires client runtime execution, which violates the hydration isolation policy.

---

## 2. Styling with Tailwind Logical Properties

### Decision
Configure and use Tailwind CSS logical properties (like `mbe-*`, `pis-*`, `start-*`, `end-*`) instead of traditional direction-locked properties (`mb-*`, `pl-*`, `left-*`, `right-*`).

### Rationale
Logical properties automatically adjust spacing and alignment based on the page's writing direction (`dir="rtl"` or `dir="ltr"`). Since the portofolio will support English (LTR) and Arabic (RTL), using logical properties eliminates the need to duplicate CSS styles or write conditional class injections for alignment.

---

## 3. Hydration Isolation & Vanilla Interactivity

### Decision
Use zero-javascript by default. If interactive components are required (e.g., navigation drawer, contact form validation), they must be implemented using native HTML/CSS selectors (e.g., hidden inputs with `:checked` triggers) or isolated `<script>` tags scoped inside Astro components.

### Rationale
Avoids loading state managers (Zustand/Redux) or animation libraries (GSAP). This keeps blocking time at 0ms and ensures maximum Lighthouse performance scores.

---

## 4. Defensive Content Fetching

### Decision
Wrap all content collection fetching in custom helper utilities that enforce schema type safety and fallback default values.

### Rationale
Prevents build-time or runtime page crashes if content markdown files are missing fields or have language discrepancies.
