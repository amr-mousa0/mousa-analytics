# Tasks: Master Rebuild Blueprint

**Input**: Design documents from `/specs/002-rebuild-blueprint/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create `package.json` manifest with Astro, Tailwind, and TypeScript configurations at the repository root
- [x] T002 Create `tsconfig.json` with strict mode enabled at the repository root
- [x] T003 [P] Create `tailwind.config.mjs` and `astro.config.mjs` configuration files at the repository root
- [x] T004 Install core dependencies (`astro`, `tailwindcss`, `sharp`, `typescript`, `@types/node`) using npm

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core security middleware, layout direction mechanics, content configuration, and dynamic guards

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create `src/middleware.ts` to implement security headers (CSP, X-Frame-Options, Referrer-Policy, X-Content-Type-Options)
- [x] T006 [P] Setup Astro Content Collections schema and validation types in `src/content/config.ts`
- [x] T007 [P] Create base localized markdown documents for SEO, services, and socials under `src/content/seo/`, `src/content/services/`, and `src/content/socials/`
- [x] T008 Implement global HTML document structure and RTL/LTR direction switching in `src/layouts/Layout.astro`
- [x] T009 Implement history-safe root redirection in `src/pages/index.astro` using `window.location.replace('/en/')` and a fallback `<meta>` refresh redirect

---

## Phase 3: User Story 1 - Multilingual Route Navigation with Guards (Priority: P1) 🎯 MVP

**Goal**: Establish LTR/RTL dynamic dynamic route structure, guarding parameters and redirecting unsupported locales to English.

**Independent Test**: Running the Astro dev server and requesting `/en/` (loads English), `/ar/` (loads Arabic with RTL direction), and `/fr/` (redirects to `/en/`).

### Implementation for User Story 1

- [x] T010 [P] [US1] Create dynamic dynamic route landing page template `src/pages/[lang]/index.astro`
- [x] T011 [US1] Implement dynamic routing parameter guard in `src/pages/[lang]/index.astro` to redirect invalid locales to `/en/`
- [x] T012 [P] [US1] Create dynamic dynamic route methodology page template `src/pages/[lang]/methodology.astro`
- [x] T013 [US1] Implement dynamic routing parameter guard in `src/pages/[lang]/methodology.astro` to redirect invalid locales to `/en/`

**Checkpoint**: Locale dynamic routing validation guard is fully operational.

---

## Phase 4: User Story 2 - Resilient Content Rendering (Priority: P2)

**Goal**: Implement safe content data-fetching layers with placeholder default values and parameter mismatch warnings to prevent page crashes.

**Independent Test**: Simulating an empty or missing content document collection does not break the HTML build.

### Implementation for User Story 2

- [x] T014 [P] [US2] Implement safe dynamic content fetching utility for SEO collection in `src/scripts/seoHelper.ts`
- [x] T015 [P] [US2] Implement safe dynamic content fetching utility for services collection in `src/scripts/servicesHelper.ts`
- [x] T016 [P] [US2] Implement safe dynamic content fetching utility for socials collection in `src/scripts/socialsHelper.ts`

**Checkpoint**: Defensive content boundaries are complete.

---

## Phase 5: User Story 3 - Isolated Hydration and Lightweight Performance (Priority: P3)

**Goal**: Build localized, accessible layout blocks (Hero, About card layout, Services grid, Contact form with honeypot) using pure Tailwind logical properties and zero global javascript.

**Independent Test**: Audit HTML structure and CSS variables to confirm logical properties work and page loads with 0ms client execution time.

### Implementation for User Story 3

- [x] T017 [P] [US3] Create global stylesheet with Tailwind directives in `src/styles/global.css`
- [x] T018 [P] [US3] Build Header, Footer, and mobile Side Drawer navigation UI in `src/components/ui/Navigation.astro` using Tailwind logical properties
- [x] T019 [P] [US3] Create Hero, About card layout, and Services grid components inside `src/components/sections/` utilizing optimized `sharp` image outputs
- [x] T020 [P] [US3] Create Contact Form component inside `src/components/sections/Contact.astro` including the hidden anti-spam `_gotcha` input field
- [x] T021 [US3] Integrate components into pages layouts inside `src/pages/[lang]/index.astro`
- [x] T022 [US3] Implement dynamic lifecycle listener and observer cleanups in `src/scripts/lifecycle.ts` using `astro:before-swap` and duplicate listener guards

**Checkpoint**: Portfolio pages render perfectly with styling, responsive layout, and zero script dependencies.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Implement unit and E2E automated tests and perform Lighthouse performance validation.

- [x] T023 [P] Create schema validation tests using Vitest in `tests/unit/schemas.test.ts`
- [x] T024 [P] Create navigation and route guard E2E tests using Playwright in `tests/e2e/navigation.spec.ts`
- [x] T025 [P] Create contact form submission honeypot verification E2E tests in `tests/e2e/contact.spec.ts`
- [x] T026 Audit Tailwind logical properties usage in `src/` to verify zero physical directions (`ml-`, `mr-`, `left-`, `right-`, `text-left`, `text-right`) exist
- [x] T027 Run `npm run build` and verify CSP headers compatibility and zero hydration warnings
- [ ] T028 Run Lighthouse CI audits and verify that performance budgets and SEO goals are fully satisfied

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion. Blocks all user stories.
- **User Stories (Phases 3+)**: All depend on Foundational phase completion. Proceed sequentially: US1 (Priority: P1) → US2 (Priority: P2) → US3 (Priority: P3).
- **Polish (Final Phase)**: Depends on all user stories being complete.

### Parallel Opportunities

- Configuration setups (T001, T002, T003) can be worked on in parallel.
- Content schema definitions and mock content setups (T006, T007) are parallelizable.
- Landing and Methodology page files (T010, T012) can be scaffolded in parallel.
- Safe content collections helpers (T014, T015, T016) are parallelizable.
- Layout sections styling components (T017, T018, T019, T020) are parallelizable.
- Unit and E2E tests files creation (T023, T024, T025) can be done in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup and Foundational layouts/configurations.
2. Complete Dynamic Routing dynamic routes (US1).
3. Validate routing redirection from browser URL checks.

### Incremental Delivery

1. Setup codebase foundation.
2. Deliver multilingual routing shell (US1).
3. Add robust schema validations and fallbacks (US2).
4. Add content sections styled with logical properties (US3).
5. Build and run the complete test suite.
