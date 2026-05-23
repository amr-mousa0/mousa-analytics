# Feature Specification: Master Rebuild Blueprint

**Feature Branch**: `002-rebuild-blueprint`

**Created**: 2026-05-23

**Status**: Draft

**Input**: User description: "Rebuild the portfolio website for Amr (Data Analyst & Social Media Marketer) from scratch. This plan structures the rebuild into six sequential phases (Phases 0 through 5) plus developer workflow, runtime safety rules, and verification details."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Multilingual Route Navigation with Guards (Priority: P1)

Users should be able to view the portfolio in their preferred language (English or Arabic), with invalid language routes safely handled.

**Why this priority**: Core architecture requirement to support localization (LTR/RTL) safely.

**Independent Test**: Requesting different language parameters via URL shows correct language layout, and invalid parameters redirect to English.

**Acceptance Scenarios**:

1. **Given** a user navigates to `/ar/[page]`, **When** the page loads, **Then** the HTML direction is RTL, language is Arabic, and Arabic translations are displayed.
2. **Given** a user navigates to an invalid language route like `/fr/`, **When** the server handles the request, **Then** the user is immediately redirected to `/en/` instead of seeing a crash or 404.

---

### User Story 2 - Resilient Content Rendering (Priority: P2)

Users should see page elements load reliably even if underlying content items (SEO data, services, socials) are missing or fail to load.

**Why this priority**: Avoids site-wide crashes and ensures high availability.

**Independent Test**: Running the site with incomplete content collections doesn't crash the server and falls back to safe default templates.

**Acceptance Scenarios**:

1. **Given** a content query returns null or undefined, **When** rendering the page, **Then** a placeholder fallback layout is rendered without page-crashing errors.

---

### User Story 3 - Isolated Hydration and Lightweight Performance (Priority: P3)

Users should experience extremely fast page loads with no blocking JS or unnecessary client runtimes.

**Why this priority**: Maximizes performance and lighthouse score matching the "restrained" aesthetic.

**Independent Test**: The site loads with zero global client-side runtimes or GSAP, and all hydration is isolated.

**Acceptance Scenarios**:

1. **Given** a production build, **When** checking output assets, **Then** there is no global runtime script injected, and Lighthouse performance budget is maintained.

### Edge Cases

- **Missing localizations**: When content is defined in English but not Arabic, the system should gracefully fall back to English content or place a localized placeholder, rather than failing the build.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Dynamic route templates MUST validate `lang` parameters in their frontmatter and redirect to `/en/` if invalid.
- **FR-002**: Content fetching (`getEntry`, `getCollection`) MUST be wrapped in defensive blocks with fallback values or redirect behaviors to prevent application crashes.
- **FR-003**: The HTML document direction (`dir`) MUST dynamically switch to `rtl` for Arabic (`ar`) and `ltr` for English (`en`).
- **FR-004**: Styles MUST be styled using Tailwind logical properties.
- **FR-005**: Foundational routing, layout, and content architecture MUST be frozen after Phase 2 stabilization.
- **FR-006**: The site MUST NOT use GSAP animation library, global state managers (Redux, Zustand), or SPA architecture.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100/100 SEO score and >=90 Performance score in Lighthouse CI.
- **SC-002**: Zero runtime crashes due to content retrieval errors or route parameter mismatch.
- **SC-003**: Production build compiles with zero TypeScript errors or hydration warnings.

## Assumptions

- Content collections schema defines localized fields for SEO, services, and socials under `en/` and `ar/` directories.
- Playwright E2E tests are configured to validate multi-locale routes.
