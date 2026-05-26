# Feature Specification: Analytics, GTM, GA4, and SEO Content Growth

**Feature Branch**: `007-analytics-seo-roadmap`

**Created**: 2026-05-25
**Status**: Draft

---

## User Scenarios & Testing

### User Story 1 - Analytics Event Architecture & Tracking (Priority: P1)

As a portfolio owner, I want a lightweight tracking system using Google Tag Manager and GA4 that captures core user interactions (page views, language selection, CTA clicks, and form submissions) across English and Arabic interfaces, so that I can evaluate B2B conversion leads.

**Why this priority**: Measuring B2B leads generated via the Contact Form and WhatsApp is critical for evaluating portfolio ROI.

**Independent Test**: Can be tested by navigating between routes, clicking CTAs, and submitting the form, and confirming in the GTM Preview console that custom events are fired correctly.

**Acceptance Scenarios**:
1. **Given** a user navigates between pages, **When** they load a project or service detail page, **Then** a corresponding view event (`project_view`, `service_view`) is fired containing locale, title, category, and slug parameters.
2. **Given** a user clicks any WhatsApp CTA or dashboard request, **When** clicked, **Then** a `cta_click` event is fired tracking the action channel type and slug.
3. **Given** a user submits the contact form, **When** submitted, **Then** a `contact_form_submit` event fires.
4. **Given** a user interacts with the language switcher, **When** clicked, **Then** GTM captures `language_switch` tracking `source_lang` and `target_lang`.

---

### User Story 2 - Multilingual Blog & Content Clusters (Priority: P2)

As a content publisher, I want a structured blog collection schema that supports translations and standard SEO headers, so that articles can rank in search results in both languages.

**Independent Test**: Can be verified by compiling the site, inspecting HTML headers for canonical URLs and alternate alternates, and ensuring sitemaps are generated correctly.

**Acceptance Scenarios**:
1. **Given** a published article, **When** accessed by crawlers, **Then** it presents standard metadata, canonical URLs with consistent trailing slashes, and reciprocal `hreflang` alternates.
2. **Given** a fallback article page (where Arabic is missing, displaying English content), **When** accessed by crawlers, **Then** it outputs server-rendered `noindex` headers to avoid duplicate indexing penalties.

---

### User Story 3 - Testing, CI/CD, and Validation (Priority: P3)

As a developer, I want dev-environment traffic isolation to prevent staging or local tests from contaminating production reports.

**Acceptance Scenarios**:
1. **Given** a localhost session, **When** pages are navigated or clicked, **Then** GTM blocks the fire of production analytics tags and only executes debugging events if `gtm_debug=true` is present in the query string.

---

## Edge Cases

- **Fallback Content duplicate penalties:** Pages rendering English fallback content inside an Arabic route must be marked with `noindex` *at server-render/build-time* (not via client JS) to prevent duplicate indexing.
- **Accidental double initialization:** Ensure dataLayer is initialized defensively: `window.dataLayer = window.dataLayer || [];`.

---

## Requirements

### Functional Requirements

- **FR-001**: The system MUST implement a centralized, strictly typed tracking utility to push events to `dataLayer`.
- **FR-002**: The GTM script MUST load asynchronously using standard `<script async src="..."></script>` to maintain layout simplicity.
- **FR-003**: The tracking setup MUST differentiate between `development`, `staging`, and `production` environments to isolate analytical data.
- **FR-004**: Custom events MUST cover the following taxonomy:
  - `project_view` & `service_view` (capturing slug, category, language)
  - `language_switch` (capturing source and target locales)
  - `cta_click` (capturing channel type and context)
  - `contact_form_submit` (capturing form conversion)
- **FR-005**: Fallback pages with missing translations MUST be server-rendered with `<meta name="robots" content="noindex, follow" />`.
- **FR-006**: The static site sitemap generator MUST filter out all backup directories, drafts, and pages configured with `noindex: true`.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Page loads and custom events have a 0% duplication rate in GA4 reports.
- **SC-002**: Lighthouse Mobile Performance score remains at 90 or above.
- **SC-003**: Staging and preview deployments generate 0 hits in the production GA4 property.
