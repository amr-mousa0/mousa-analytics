# Engineering Tasks: Analytics, Tracking, and SEO Growth Roadmap

**Input**: Design documents from `/specs/007-analytics-seo-roadmap/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, governance.md, contracts/

**Organization**: Tasks are grouped by implementation phase to ensure clear sequencing, dependency resolution, and milestone verification.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish type-safety interfaces, global definitions, and shared utility structures.

- [x] T001 Create GTM global type declarations in `src/types/analytics.d.ts` (safely extending the global `Window` interface to support the heterogeneous `dataLayer` array without type-casting leaks)
- [x] T002 Create page context helper in `src/scripts/pageContext.ts` (parsing the `#page-metadata` script tag element, handling fallback parser states, and returning the structured `PageContext` object)
- [x] T003 Create strictly-typed tracking wrapper in `src/scripts/analytics.ts` (enforcing the `TrackedEventPayload` discriminated union, appending enriched parameters, and adding validation checks)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Layout-level instrumentation to support metadata injection, script loading, and crawler control.

**⚠️ CRITICAL**: No user story task execution can begin until this phase is complete and verified.

- [x] T004 Update `src/layouts/Layout.astro` frontmatter to accept context parameters (`contentType`, `slug`, `pageCategory`, `isFallback`) as Props with strict types
- [x] T005 Update `src/layouts/Layout.astro` to render the XSS-safe JSON metadata `<script id="page-metadata" type="application/json" is:inline>` block, sanitizing `<` characters via `.replace(/</g, '\\u003c')` to prevent HTML parser layout breakage
- [x] T006 Update `src/layouts/Layout.astro` to server-render `<meta name="robots" content="noindex, follow" />` directly in `<head>` when the `isFallback` or `noindex` prop evaluates to true
- [x] T007 Inject the standard Google Tag Manager asynchronous loader script inside `<head>` and the noscript `<iframe>` at the top of `<body>` inside `src/layouts/Layout.astro` (using GA4's default automatic `page_view` tracking; no virtual pageviews)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Analytics Event Architecture & Tracking (Priority: P1) 🎯 MVP

**Goal**: Capture contact form submissions, WhatsApp CTAs, and language toggles across English and Arabic layouts.

**Independent Test**: Navigate layout, submit forms, click CTAs, and verify custom events (`project_view`, `service_view`, `language_switch`, `cta_click`, `contact_form_submit`) with correct parameters in GTM Preview console.

### Implementation for User Story 1

- [x] T008 [US1] Update the contact form handler inside `src/components/sections/Contact.astro` to track successful submissions by pushing a `contact_form_submit` event (parameter: `form_id: "contact_form"`)
- [x] T009 [P] [US1] Add click listener on the WhatsApp button in `src/components/sections/Services.astro` to track conversion intent (event: `cta_click`, parameters: `cta_text: "WhatsApp"`, `cta_type: "whatsapp"`)
- [x] T010 [P] [US1] Add `id="language-toggle"` to the language switcher anchor inside `src/components/ui/Navigation.astro`, and bind a click listener to track language switches (event: `language_switch`, parameters: `source_lang`, `target_lang`)
- [x] T011 [P] [US1] Add click listeners on the project detail WhatsApp CTAs (`#open-dashboard-btn` and `#start-project-btn`) inside `src/pages/[lang]/projects/[slug].astro` to track project-specific conversion intent (event: `cta_click`, parameters: `cta_text`, `cta_type: "whatsapp"`, `context_slug`)
- [x] T012 [US1] Perform an audit of home sections and layout navigation links to confirm that general anchor scrolls, internal navigation clicks, carousel arrows, and tab toggle actions are explicitly excluded from custom tracking (maintaining telemetry cleanliness)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Multilingual Blog & Content Clusters (Priority: P2)

**Goal**: Structured blog schema that supports translations, canonical tags, and search engine crawling optimization.

**Independent Test**: Build static site, inspect blog HTML headers for canonical and alternates (`hreflang`), and verify that draft/noindex posts are filtered out of the sitemap.

### Implementation for User Story 2

- [x] T013 [P] [US2] Define the `blog` collection schema in `src/content/config.ts` enforcing meta title ($\le 60$ chars) and description ($\le 160$ chars) limits, Author, translation keys, and drafts flag
- [x] T014 [US2] Construct structural JSON-LD schemas in the blog detail layout (or layout meta header) supporting indexability metrics
- [x] T015 [US2] Update static sitemap generator configuration in `astro.config.mjs` to dynamically exclude draft posts or pages marked with `noindex: true`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Testing, CI/CD, and Validation (Priority: P3)

**Goal**: Prevent local development data from contaminating production reports.

**Independent Test**: Load `http://localhost:4321/` and inspect dataLayer. Confirm GA4 production tags do not load unless `gtm_debug=true` is present in query parameters.

### Implementation for User Story 3

- [x] T016 [US3] Enhance `src/scripts/analytics.ts` to block GTM tag execution in local development environment unless `gtm_debug=true` query parameter is present
- [x] T017 [US3] Configure GTM Environment isolation (mapping Production GA4 property for `analytics_env: "production"`, Sandbox GA4 property for `analytics_env: "staging"`, and ignoring tracking on `analytics_env: "development"`) using GTM Lookup Table variable

**Checkpoint**: All user stories should now be independently functional.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Validation gates, type checks, and performance benchmarks.

- [x] T018 [P] Run `npm run build` to verify error-free static compilation across all routes
- [x] T019 [P] Run `npm run check` to enforce full TypeScript safety and check for type leaks or cast warning regressions
- [x] T020 Perform Lighthouse mobile and desktop audits on Home (`/[lang]/`), Service Detail (`/[lang]/services/[slug]/`), and Project Detail (`/[lang]/projects/[slug]/`) routes, ensuring scores are $\ge 90$ mobile, $\ge 95$ desktop, and TBT is $\le 100\text{ms}$ (measuring GTM script execution impact)
- [x] T021 [P] Update project telemetry registry documentation in `specs/007-analytics-seo-roadmap/governance.md` with final parameters and triggers

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

---

## Parallel Opportunities

### Phase 1 (Setup)
- T001, T002, and T003 can be developed in parallel as they cover non-overlapping files.

### Phase 3 (User Story 1)
- T009, T010, and T011 can be developed in parallel since they touch separate UI component files.

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Ad-Blockers Block GTM** | Medium (Telemetry loss) | High | Guard all client-side calls to check if `window.dataLayer` exists and initialize safely (`window.dataLayer = window.dataLayer \|\| []`) to prevent JS crashes. |
| **Script Tag XSS Injection** | High (Arbitrary JS code execution) | Low | Escape `<` characters as `\u003c` during layout JSON stringification. This prevents browsers from seeing `</script>` closing tags while parsing cleanly back to JSON objects. |
| **Search Index Pollution** | High (Duplicate content penalty) | Medium | Strict build-time robots verification mapping staging deploys and fallback translations to server-rendered `<meta name="robots" content="noindex, follow" />`. |
| **Dynamic GTM Mismatches** | Medium (Broken analytics) | Low | Restrict telemetry access entirely to the strictly typed `trackEvent()` utility to eliminate inline scripting discrepancies. |

---

## Deployment Strategy

*   **Staging Preview Deployment**:
    *   Triggered on pull requests / staging branches.
    *   Build flags map to `process.env.CONTEXT = 'deploy-preview'`.
    *   Injects `analytics_env: 'staging'` into the JSON metadata and outputs `<meta name="robots" content="noindex, follow" />` on all templates.
    *   GTM environment variable lookup table automatically routes tracking events to the **GA4 Sandbox Property**.
*   **Production Deployment**:
    *   Triggered on main branch merges.
    *   Build flags map to `process.env.CONTEXT = 'production'`.
    *   Injects `analytics_env: 'production'` and outputs standard robots indexing headers.
    *   GTM routes tracking events to the **GA4 Production Property**.

---

## Validation Gates

1.  **Gate 1: Build & Type Safety (Pre-Commit / CI)**:
    *   Command `npm run check` must output zero warning/error type leaks.
    *   Command `npm run build` must compile static outputs with zero routing exceptions.
2.  **Gate 2: Environment Traffic Isolation (Staging)**:
    *   Inspect staging preview source code to verify `<meta name="robots" content="noindex, follow" />` is rendered.
    *   Open devtools on staging preview, ensure dataLayer events output `analytics_env: 'staging'`.
3.  **Gate 3: Telemetry Contract Check (Manual / GTM Preview)**:
    *   Initiate form submit and WhatsApp clicks in GTM Debug Mode.
    *   Verify events (`cta_click`, `contact_form_submit`, etc.) trigger exactly once with correct parameters.
4.  **Gate 4: Performance Budget**:
    *   Run Lighthouse audit on built pages with the GTM script container loaded.
    *   Verify Mobile performance score is $\ge 90$, Desktop $\ge 95$, and TBT $\le 100\text{ms}$.

---

## Future Extensibility

*   **Astro View Transitions**:
    *   If transitions are enabled, bind client listeners to `astro:page-load` instead of `window.onload`.
    *   Enable GTM History Change triggers to capture SPA page navigation events cleanly.
*   **GDPR/CCPA Cookie Consent**:
    *   The `trackEvent()` wrapper is structured to integrate a consent validator. Pushing events to dataLayer can be gated behind a cookie check (e.g. `isConsentGranted()`) without refactoring components.
*   **Alternative Telemetry Endpoints**:
    *   If migrating away from GTM to a server-side proxy (e.g., Cloudflare Workers), the `trackEvent` wrapper can be modified to fire standard `fetch` POST requests directly to the endpoint without editing the Astro views.
