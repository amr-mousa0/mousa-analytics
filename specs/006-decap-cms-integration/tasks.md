# Tasks: Decap CMS Integration

**Input**: Design documents from `/specs/006-decap-cms-integration/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, architecture_report.md

**Tests**: Tests are OPTIONAL. Verification will be handled by building the site and manual dashboard testing.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup & Safety (Shared Infrastructure)

**Purpose**: Project initialization, basic structure, and migration backup safety

- [x] T001 Create media upload directory in `src/assets/images/uploads/.gitkeep`
- [x] T002 Create admin directory `public/admin/.gitkeep`
- [x] T003 Backup hardcoded Astro project files by copying `src/pages/[lang]/projects/*.astro` files to `src/pages/[lang]/projects/.backup/` before deletion

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create CMS admin entry point `public/admin/index.html` with Netlify Identity and Decap CMS CDN scripts, configuring iframe sandboxing for previews
- [x] T005 Create CMS configuration base file `public/admin/config.yml` configuring backend, media_folder (`src/assets/images/uploads`), and public_folder (`../../../assets/images/uploads`)
- [x] T006 [P] Add DRY structures (YAML anchors and aliases for SEO fields and content states) in `public/admin/config.yml` to reduce config duplication

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Manage Services Content (Priority: P1) 🎯 MVP

**Goal**: Enable complete CRUD operations (add, edit, delete) on English and Arabic services via Decap CMS.

**Independent Test**: Run `npx decap-cms-proxy-server`, open `http://localhost:4321/admin/`, add/modify a service, and verify that the file updates in `src/content/services/`.

### Implementation for User St- [x] T007 [P] [US1] Define services collection schema in `public/admin/config.yml` (using anchors for content states and SEO fields)
- [x] T008 [P] [US1] Add slug generation and uniqueness handling in CMS config `public/admin/config.yml` using slug widget and readonly editing strategy
- [x] T009 [US1] Update services collection schema and Zod validation in `src/content/config.ts` (enforcing required fields, priority integer, category options, date formats, and nested SEO validation)
- [x] T010 [US1] Migrate/update existing service frontmatter files in `src/content/services/` to include draft, featured, translationKey, publishedDate, categories, tags, and SEO fields
- [x] T011 [US1] Implement empty state handling, deterministic sorting (featured first, then priority), and translation fallback (with localized banner warning) in services section of `src/pages/[lang]/index.astro`
- [x] T012 [US1] Register custom live preview templates for Services in `public/admin/index.html` using an iframe-based rendering structure with styles injected
- [x] T013 [US1] Verify local editing of services via proxy by modifying files and checking Git local backend updates

**Checkpoint**: At this point, services content can be fully managed via CMS.

---

## Phase 4: User Story 2 - Upload and Manage Media Assets (Priority: P1)

**Goal**: Support uploading images via CMS into local public folders and referencing them in collections.

**Independent Test**: Upload a test image through CMS, verify it is saved under `src/assets/images/uploads/` and referenced correctly in markdown.

### Implementation for User Story 2

- [x] T014 [P] [US2] Configure media folder and image optimization limits in `public/admin/config.yml` (WebP format preference, file upload size limit of 5MB, naming guidelines)
- [x] T015 [US2] Verify uploading local image assets via CMS in local proxy mode, checking file creation in `src/assets/images/uploads/`
- [x] T016 [US2] Verify Astro native `<Image />` component compatibility and build-time optimization of images loaded from `src/assets/images/uploads/`

**Checkpoint**: Media assets can be managed and selected inside collections.

---

## Phase 5: User Story 3 - Manage Projects Content dynamically (Priority: P2)

**Goal**: Migrate hardcoded Astro project files into a dynamic markdown collection, enabling full CRUD via Decap CMS.

**Independent Test**: Access `/projects/coffee-shop` on local dev server and confirm it loads from the new markdown collection. Confirm CMS allows adding/deleting projects.

### Implementation for User Story 3

- [x] T017 [P] [US3] Register projects content collection schema in `src/content/config.ts` using Zod (validating arrays, category, tags, required fields, date, coverImage, and nested SEO tags)
- [x] T018 [US3] Define projects collection fields and widgets in `public/admin/config.yml` (using anchors for content states and SEO fields)
- [x] T019 [US3] Add project slug generation and uniqueness handling in `public/admin/config.yml` using slug widget and readonly editing strategy
- [x] T020 [US3] Migrate existing projects to Markdown format by creating English files in `src/content/projects/en/` with identical filename slugs (e.g. `coffee-shop.md`, `marketing-roi.md`, `oxygen-gym.md`) and filling in metadata/translations
- [x] T021 [US3] Migrate existing projects to Markdown format by creating Arabic files in `src/content/projects/ar/` with matching filenames to link translations for language switcher
- [x] T022 [US3] Create dynamic route page `src/pages/[lang]/projects/[slug].astro` using `getStaticPaths` with draft filtering based on build mode (`PROD` vs `DEV`), same-slug translation switcher, missing image fallbacks, alternate hreflang links, canonical tags, and rendering meta tags dynamically
- [x] T023 [US3] Implement dynamic JSON-LD structured schema markup (schema.org markup) for projects in `src/pages/[lang]/projects/[slug].astro`
- [x] T024 [US3] Remove hardcoded project Astro files `src/pages/[lang]/projects/coffee-shop.astro`, `src/pages/[lang]/projects/marketing-roi.astro`, `src/pages/[lang]/projects/oxygen-gym.astro`
- [x] T025 [US3] Update projects showcase grid in homepage to pull dynamically from projects collection in `src/pages/[lang]/index.astro`, implementing empty states, deterministic sorting, draft filtering, and category filtering support
- [x] T026 [US3] Register custom live preview templates for Projects in `public/admin/index.html`
- [x] T027 [US3] Setup custom 404 page handling for invalid project slugs in `src/pages/404.astro`

**Checkpoint**: Projects are fully migrated to Content Collections and manageable via CMS.

---

## Phase 6: User Story 4 & 5 - Secure Authentication, Deployments, and Editorial Workflow (Priority: P2)

**Goal**: Implement security and editorial workflow settings for production dashboard.

**Independent Test**: Visit `/admin/` on production build/deploy and verify Netlify Identity login modal appears and publish mode shows editorial workflow.

### Implementation for User Stories 4 & 5

- [x] T028 [US4] Configure Netlify Identity widget and production publish mode to `editorial_workflow` in `public/admin/config.yml` (managing draft review, branch protection, and production-safe publishing workflow)
- [x] T029 [US4] Add Netlify Identity login scripts in production setup in `public/admin/index.html`
- [x] T030 [US5] Implement sitemap generation filtering out drafts/noindex and dynamic robots tags to prevent search indexing on staging preview environments in `astro.config.mjs`

**Checkpoint**: Production admin route is secure, editorial review is active, and dynamic SEO tools are setup.

---

## Phase 7: Future Scalability Preparation

**Purpose**: Preparing schemas for upcoming collections

- [x] T031 [P] Configure content collection files `src/content/config.ts` to support future collections (defining draft testimonials, blog posts, and categories/tags structures)

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Build checks, optimization, and final validation.

- [x] T032 [P] Run validation pipeline using `npm run astro check` and type validation
- [x] T033 Verify site compiles and builds successfully by running `npm run build`
- [x] T034 Document local CMS operation in `specs/006-decap-cms-integration/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational phase completion.
  - User Story 1 & 2 can run in parallel.
  - User Story 3 can run in parallel with 1 & 2 once Schema is defined.
  - User Story 4 & 5 can run after CMS setup is stable.
- **Scalability Prep (Phase 7)**: Can run after Content schemas are completed.
- **Polish (Phase 8)**: Depends on all user stories being complete.

### Parallel Opportunities

- T001 and T002 can run in parallel.
- T006, T007, T008, T014 can run in parallel as they touch different configuration/schema files.
- T032 and T034 can run in parallel in the final phase.
