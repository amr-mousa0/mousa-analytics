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

- [ ] T001 Create `package.json` manifest with Astro, Tailwind, and TypeScript strict mode configurations at the repository root
- [ ] T002 Create `tsconfig.json` with strict mode enabled at the repository root
- [ ] T003 [P] Create `tailwind.config.mjs` and `astro.config.mjs` configuration files at the repository root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Foundational routing layout, content configuration, and typing system

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Setup Astro Content Collections schema and types in `src/content/config.ts`
- [ ] T005 Create baseline localized markdown documents for SEO, services, and socials under `src/content/seo/`, `src/content/services/`, and `src/content/socials/`
- [ ] T006 Setup global HTML document structure and direction handling in `src/layouts/Layout.astro`

---

## Phase 3: User Story 1 - Multilingual Route Navigation with Guards (Priority: P1) 🎯 MVP

**Goal**: Establish LTR/RTL dynamic dynamic route structure, guarding parameters and redirecting unsupported locales to English.

**Independent Test**: Running the Astro dev server and requesting `/en/` (loads English), `/ar/` (loads Arabic with RTL direction), and `/fr/` (redirects to `/en/`).

### Implementation for User Story 1

- [ ] T007 [P] [US1] Create dynamic dynamic route landing page template `src/pages/[lang]/index.astro`
- [ ] T008 [US1] Implement dynamic routing parameter guard in `src/pages/[lang]/index.astro` redirecting invalid locales to `/en/`
- [ ] T009 [P] [US1] Create dynamic dynamic route methodology page template `src/pages/[lang]/methodology.astro`
- [ ] T010 [US1] Implement dynamic routing parameter guard in `src/pages/[lang]/methodology.astro` redirecting invalid locales to `/en/`

**Checkpoint**: Locale dynamic routing validation guard is fully operational.

---

## Phase 4: User Story 2 - Resilient Content Rendering (Priority: P2)

**Goal**: Implement safe content data-fetching layers with placeholder default values and parameter mismatch warnings to prevent page crashes.

**Independent Test**: Simulating an empty or missing content document collection does not break the HTML build.

### Implementation for User Story 2

- [ ] T011 [P] [US2] Implement safe dynamic content fetching utility for SEO collection in `src/scripts/seoHelper.ts`
- [ ] T012 [P] [US2] Implement safe dynamic content fetching utility for services collection in `src/scripts/servicesHelper.ts`
- [ ] T013 [P] [US2] Implement safe dynamic content fetching utility for socials collection in `src/scripts/socialsHelper.ts`

**Checkpoint**: Defensive content boundaries are complete.

---

## Phase 5: User Story 3 - Isolated Hydration and Lightweight Performance (Priority: P3)

**Goal**: Build localized, accessible layout blocks (Hero, About, Services grid, Contact form with honeypot) using pure Tailwind logical properties and zero global javascript.

**Independent Test**: Audit HTML structure and CSS variables to confirm logical properties work and page loads with 0ms client execution time.

### Implementation for User Story 3

- [ ] T014 [P] [US3] Create global stylesheet with Tailwind directives in `src/styles/global.css`
- [ ] T015 [P] [US3] Build Header, Footer, and mobile Side Drawer navigation UI in `src/components/ui/Navigation.astro` using Tailwind logical properties
- [ ] T016 [P] [US3] Create Hero, About card layout, and Services grid components inside `src/components/sections/`
- [ ] T017 [P] [US3] Create Contact Form component inside `src/components/sections/Contact.astro` including the hidden anti-spam `_gotcha` input field
- [ ] T018 [US3] Integrate components into pages layouts inside `src/pages/[lang]/index.astro`

**Checkpoint**: Portfolio pages render perfectly with styling, responsive layout, and zero script dependencies.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Implement unit and E2E automated tests and perform Lighthouse performance validation.

- [ ] T019 [P] Create schema validation tests using Vitest in `tests/unit/schemas.test.ts`
- [ ] T020 [P] Create navigation and route guard E2E tests using Playwright in `tests/e2e/navigation.spec.ts`
- [ ] T021 [P] Create contact form submission honeypot verification E2E tests in `tests/e2e/contact.spec.ts`
- [ ] T022 Run `npm run build` and execute performance/SEO audits to confirm Lighthouse budgets

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion. Blocks all user stories.
- **User Stories (Phases 3+)**: All depend on Foundational phase completion. Proceed sequentially: US1 (Priority: P1) → US2 (Priority: P2) → US3 (Priority: P3).
- **Polish (Final Phase)**: Depends on all user stories being complete.

### Parallel Opportunities

- Configuration setups (T001, T002, T003) can be worked on in parallel.
- Landing and Methodology page files (T007, T009) can be scaffolded in parallel.
- Safe content collections helpers (T011, T012, T013) are parallelizable.
- Layout sections styling components (T014, T015, T016, T017) are parallelizable.
- Unit and E2E tests files creation (T019, T020, T021) can be done in parallel.

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
