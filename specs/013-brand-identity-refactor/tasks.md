# Tasks: Brand Identity Refactor

**Input**: Design documents from `/specs/013-brand-identity-refactor/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `public/` at repository root
- Paths shown below assume single project monorepo structure

---

## Phase 1: Setup & Pre-Refactoring Audits (Shared Infrastructure)

**Purpose**: Prepare the repository, run baseline checks, perform a code-wide audit of all logo instances, and secure backups for rollbacks.

- [ ] T001 Verify local dependencies and run initial build checks in [package.json](file:///c:/Users/HP/Downloads/new%20portofolio/package.json)
- [ ] T002 Create a backup directory `scratch/branding-backup/` and copy all existing brand assets (`public/favicon.*`, `public/images/og-image.png`, and a snapshot of current inline SVGs in components) for rollback purposes
- [ ] T003 Perform a comprehensive static code search to identify all inline SVG logo paths, favicon link references, Open Graph image tags, and logo CSS properties in the `/src` and `/public` directories. Save the list of file paths and component structures to [specs/013-brand-identity-refactor/research.md](file:///c:/Users/HP/Downloads/new%20portofolio/specs/013-brand-identity-refactor/research.md)
- [ ] T004 Conduct a trademark and visual similarity audit on the new continuous loop monogram (Direction D) defined in [specs/013-brand-identity-refactor/data-model.md](file:///c:/Users/HP/Downloads/new%20portofolio/specs/013-brand-identity-refactor/data-model.md) to ensure it does not contain Gmail envelope folds or Google design overlaps. Document this in [specs/013-brand-identity-refactor/research.md](file:///c:/Users/HP/Downloads/new%20portofolio/specs/013-brand-identity-refactor/research.md)

---

## Phase 2: Foundational (Design Verification & Tokens Setup)

**Purpose**: Define global styling tokens, create reference vectors, and establish client/team design approval checkpoint.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete and the design is approved.

- [ ] T005 [P] Add the global theme-adjusted gradient colors and CSS variables for the light and dark monogram variants inside [src/styles/global.css](file:///c:/Users/HP/Downloads/new%20portofolio/src/styles/global.css) using the values in [specs/013-brand-identity-refactor/data-model.md](file:///c:/Users/HP/Downloads/new%20portofolio/specs/013-brand-identity-refactor/data-model.md)
- [ ] T006 Create a standalone draft SVG reference file of the new Direction D monogram in `public/images/logo-reference.svg` with its vector paths, stroke styling, and gradients as defined in [specs/013-brand-identity-refactor/data-model.md](file:///c:/Users/HP/Downloads/new%20portofolio/specs/013-brand-identity-refactor/data-model.md)
- [ ] T007 **Design Approval Checkpoint**: Review the standalone SVG reference file `public/images/logo-reference.svg` in a browser window. Verify legibility, safe margins, and similarity checks. Obtain client sign-off on the design direction before beginning site-wide refactoring

**Checkpoint**: Foundation ready and Design Approved - code updates can now begin.

---

## Phase 3: User Story 1 - Preloader Animation Updates (Priority: P1) 🎯 MVP

**Goal**: Update the loading screen to animate the new monogram path smoothly without external JS.

**Independent Test & Acceptance Criteria**: Start the development server, load `http://localhost:4321`, verify that the global preloader draws the new monogram from start to end in `< 1.4s`, shows zero clipping/cropping, and passes standard Lighthouse performance tests with zero render-blocking warnings.

### Implementation for User Story 1

- [ ] T008 [P] [US1] Temporarily measure the exact path length of the monogram vector in a browser console using `path.getTotalLength()` on the reference vector in [specs/013-brand-identity-refactor/quickstart.md](file:///c:/Users/HP/Downloads/new%20portofolio/specs/013-brand-identity-refactor/quickstart.md)
- [ ] T009 [US1] Replace the inline SVG path coordinates for the main path and the shadow path inside the preloader container in [src/components/ui/Preloader.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Preloader.astro) with the coordinates in [specs/013-brand-identity-refactor/data-model.md](file:///c:/Users/HP/Downloads/new%20portofolio/specs/013-brand-identity-refactor/data-model.md)
- [ ] T010 [US1] Update the `stroke-dasharray` and `stroke-dashoffset` variables to match the measured path length, and adjust animation transition variables inside [src/components/ui/Preloader.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Preloader.astro)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Navigation & Header Component Updates (Priority: P2)

**Goal**: Refactor header and mobile navigation logo emblems to display the new monogram.

**Independent Test & Acceptance Criteria**: Inspect the page on desktop and mobile viewports. Confirm that all four logo locations (Desktop Header Logo Emblem, Mobile Drawer Logo Emblem, Mobile Bottom Tab Bar Emblem, App Install Prompt Banner Emblem) display the monogram cleanly with zero overlap or clipping.

### Implementation for User Story 2

- [ ] T011 [US2] Update the inline SVG main path, shadow path, and linear gradient configuration inside the Header Navigation desktop logo container in [src/components/ui/Navigation.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Navigation.astro)
- [ ] T012 [US2] Update the inline SVG paths and linear gradients inside the Mobile Drawer navigation menu container in [src/components/ui/Navigation.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Navigation.astro)
- [ ] T013 [US2] Update the inline SVG paths and linear gradients inside the Mobile Bottom Tab Bar logo placeholder container in [src/components/ui/Navigation.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Navigation.astro)
- [ ] T014 [US2] Update the inline SVG paths and linear gradients inside the App Install Prompt Banner emblem container in [src/components/ui/Navigation.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Navigation.astro)
- [ ] T015 [US2] Align the gradient coordinates, stroke values, and decorative dotted connection lines (`stroke-dasharray="1 1.5"`) for all navigation instances to match the new geometry in [src/components/ui/Navigation.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Navigation.astro)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Footer & Hero Component Updates (Priority: P3)

**Goal**: Update logo instances in the hero section and footer.

**Independent Test & Acceptance Criteria**: Verify that the monogram is displayed inside the Hero section header and Footer column, showing proper contrast on dark background (`#0A192F` in Footer) and light background (`#F8F9FA` in Hero).

### Implementation for User Story 3

- [ ] T016 [US3] Replace the inline SVG paths, linear gradient, and shadow offset in the Hero section monogram header emblem container in [src/components/sections/Hero.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/sections/Hero.astro)
- [ ] T017 [US3] Replace the inline SVG paths, linear gradient, and shadow offset in the Footer brand emblem container in [src/components/ui/Footer.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Footer.astro)
- [ ] T018 [P] [US3] Align the responsive sizing classes, container padding, and wrapper borders of the logo emblems in [src/components/sections/Hero.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/sections/Hero.astro) and [src/components/ui/Footer.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Footer.astro) to prevent layout shifts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - Multi-format Favicons & Manifest Asset Generation (Priority: P4)

**Goal**: Regenerate, test, and optimize all public assets and metadata.

**Independent Test & Acceptance Criteria**: Ensure all raster and vector icons exist in `/public` directory. Confirm that the site favicon is legible at `16x16px` and that the web manifest and Open Graph preview image (1200x630px) load without errors.

### Implementation for User Story 4

- [ ] T019 [P] [US4] Generate the modern vector favicon [public/favicon.svg](file:///c:/Users/HP/Downloads/new%20portofolio/public/favicon.svg) featuring the new monogram coordinates, circular navy theme background, and proper margins
- [ ] T020 [P] [US4] Export optimized PNG favicon variants at the required resolutions: `48x48px` ([public/favicon-48x48.png](file:///c:/Users/HP/Downloads/new%20portofolio/public/favicon-48x48.png)), `96x96px` ([public/favicon-96x96.png](file:///c:/Users/HP/Downloads/new%20portofolio/public/favicon-96x96.png)), `180x180px` ([public/favicon-180x180.png](file:///c:/Users/HP/Downloads/new%20portofolio/public/favicon-180x180.png)), `192x192px` ([public/favicon-192x192.png](file:///c:/Users/HP/Downloads/new%20portofolio/public/favicon-192x192.png)), and `512x512px` ([public/favicon-512x512.png](file:///c:/Users/HP/Downloads/new%20portofolio/public/favicon-512x512.png))
- [ ] T021 [P] [US4] Create a multi-resolution `.ico` fallback file [public/favicon.ico](file:///c:/Users/HP/Downloads/new%20portofolio/public/favicon.ico) containing standard sizes (16, 32, 48)
- [ ] T022 [P] [US4] Create the new social card share preview image (1200x630px) at [public/images/og-image.png](file:///c:/Users/HP/Downloads/new%20portofolio/public/images/og-image.png)
- [ ] T023 [P] [US4] Verify the PWA manifest bindings, background colors, and icon links inside [public/manifest.json](file:///c:/Users/HP/Downloads/new%20portofolio/public/manifest.json)

**Checkpoint**: Favicons, manifest configurations, and open graph image updated and validated.

---

## Phase 7: Polish, Performance Audits, & Rollback Verification

**Purpose**: Clean code, run optimizations, build site, and verify rollback/failback path.

- [ ] T024 Perform a complete codebase clean-up, removing any residual legacy coordinates, unused inline styling, and temporary draft files in the `/src` and `/public` directories
- [ ] T025 Run the custom asset optimization script `node scripts/optimize-assets.mjs` to compress image exports and verify PageSpeed targets
- [ ] T026 Execute the full production build command `npm run build` from the project root and verify it compiles without warning logs
- [ ] T027 Conduct [specs/013-brand-identity-refactor/quickstart.md](file:///c:/Users/HP/Downloads/new%20portofolio/specs/013-brand-identity-refactor/quickstart.md) validation checks in a local browser and verify the rollback verification process (reverting from `scratch/branding-backup/`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (US1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (US2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (US3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable
- **User Story 4 (US4)**: Can start after Foundational (Phase 2) - May integrate with other stories but is focused on static asset generation

### Within Each User Story

- Models/SVG calculations before code implementation
- UI rendering before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tasks within User Story 4 marked [P] can run in parallel

---

## Parallel Example: User Story 4

```bash
# Generate favicon assets and icons in parallel
Task: "Generate the modern vector favicon public/favicon.svg..."
Task: "Export optimized PNG favicon variants at the required resolutions..."
Task: "Create the new social card share preview image public/images/og-image.png..."
Task: "Compile the multi-resolution fallback icon public/favicon.ico..."
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Preloader animation updates)
4. **STOP and VALIDATE**: Test User Story 1 independently in local dev environment
5. Verify that loading screen draws the monogram perfectly

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Preloader logo updates) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Navigation headers updates) → Test independently → Deploy/Demo
4. Add User Story 3 (Footer/Hero logo updates) → Test independently → Deploy/Demo
5. Add User Story 4 (Favicon exports & PWA updates) → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories
