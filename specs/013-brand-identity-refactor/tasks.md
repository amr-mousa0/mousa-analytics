# Tasks: Brand Identity Refactor

**Input**: Design documents from `/specs/013-brand-identity-refactor/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Tests are OPTIONAL - only run them to verify local builds and E2E checks if required.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `public/` at repository root
- Paths shown below assume single project monorepo structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure verification

- [ ] T001 Verify local dependencies and run initial build checks in [package.json](file:///c:/Users/HP/Downloads/new%20portofolio/package.json)
- [ ] T002 Stage the high-resolution vector and graphic design source file containing the approved Minimal SaaS Monogram (Direction D) path coordinates in [specs/013-brand-identity-refactor/research.md](file:///c:/Users/HP/Downloads/new%20portofolio/specs/013-brand-identity-refactor/research.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [P] Set up the global CSS gradient colors, shadow offsets, and stroke width properties in [src/styles/global.css](file:///c:/Users/HP/Downloads/new%20portofolio/src/styles/global.css)
- [ ] T004 Define a reference SVG template of Direction D featuring coordinates and gradient fills inside [specs/013-brand-identity-refactor/data-model.md](file:///c:/Users/HP/Downloads/new%20portofolio/specs/013-brand-identity-refactor/data-model.md)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Preloader Drawing Updates (Priority: P1) 🎯 MVP

**Goal**: Update the self-drawing animation inside the loading screen to render the new Minimal SaaS Monogram using pure CSS stroke transitions.

**Independent Test**: Start the development server, verify that the global preloader draws the updated loop logo, and finishes transition without errors in [src/components/ui/Preloader.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Preloader.astro).

### Implementation for User Story 1

- [ ] T005 [P] [US1] Temporarily inspect the path length of the new monogram vector in a blank HTML/browser context using `path.getTotalLength()` in [specs/013-brand-identity-refactor/quickstart.md](file:///c:/Users/HP/Downloads/new%20portofolio/specs/013-brand-identity-refactor/quickstart.md)
- [ ] T006 [US1] Replace the inline SVG path coordinates for `.logo-path-main` and `.logo-path-shadow` with the new Direction D coordinates in [src/components/ui/Preloader.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Preloader.astro)
- [ ] T007 [US1] Update the `stroke-dasharray` and `stroke-dashoffset` CSS values to match the calculated path length of the new monogram in [src/components/ui/Preloader.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Preloader.astro)
- [ ] T008 [US1] Adjust the entrance transitions, timing delay parameters, and linear gradient stop colors (`#FFFFFF` to `#93C5FD` to `#2563EB`) in [src/components/ui/Preloader.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Preloader.astro)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Navigation & Header Updates (Priority: P2)

**Goal**: Refactor all logo instances inside the header bar, mobile drawer, and bottom navigation bar to display the new monogram.

**Independent Test**: Load the site on desktop and mobile viewports, verify that the logo emblems in header navigation, mobile drawer, bottom bar, and PWA banner render correctly in [src/components/ui/Navigation.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Navigation.astro).

### Implementation for User Story 2

- [ ] T009 [US2] Replace the inline SVG emblem inside the Header Navigation desktop logo container (line 58) in [src/components/ui/Navigation.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Navigation.astro)
- [ ] T010 [US2] Replace the inline SVG emblem inside the Mobile Drawer navigation menu (line 237) in [src/components/ui/Navigation.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Navigation.astro)
- [ ] T011 [US2] Replace the inline SVG emblem inside the Mobile Bottom Tab Bar (line 300) in [src/components/ui/Navigation.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Navigation.astro)
- [ ] T012 [US2] Replace the inline SVG emblem inside the PWA App Install Prompt banner (line 358) in [src/components/ui/Navigation.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Navigation.astro)
- [ ] T013 [US2] Update the linear gradients and color definitions to match the adapted primary blue gradient (`logo-grad-header`, `logo-grad-drawer`, `logo-grad-tab`, `logo-grad-install`) in [src/components/ui/Navigation.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Navigation.astro)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Footer & Hero Updates (Priority: P3)

**Goal**: Replace the remaining logo instances in the hero section and footer.

**Independent Test**: Inspect the hero section and footer at `http://localhost:4321` and verify that the logo emblems match Direction D and render cleanly on dark and light backgrounds.

### Implementation for User Story 3

- [ ] T014 [US3] Replace the inline SVG monogram emblem path and secondary shadow path in the hero section header (line 107-113) in [src/components/sections/Hero.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/sections/Hero.astro)
- [ ] T015 [US3] Replace the inline SVG emblem path, secondary shadow path, and supporting linear gradient parameters (line 41-47) in [src/components/ui/Footer.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Footer.astro)
- [ ] T016 [P] [US3] Align the styling, border opacity, and responsive width classes of the logo containers in both [src/components/sections/Hero.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/sections/Hero.astro) and [src/components/ui/Footer.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/ui/Footer.astro)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - Favicons, PWA Manifest, & Open Graph Image (Priority: P4)

**Goal**: Standardize the favicon suite and social sharing card images in the `/public` directory to use the new monogram icon.

**Independent Test**: Run a local production build, verify that favicon metadata tags are present, sitemap/manifest files parse without issues, and no 404 resource errors occur for favicon/manifest assets.

### Implementation for User Story 4

- [ ] T017 [P] [US4] Regenerate and overwrite the vector favicon asset in [public/favicon.svg](file:///c:/Users/HP/Downloads/new%20portofolio/public/favicon.svg) using the new Direction D vector path and background parameters
- [ ] T018 [P] [US4] Generate optimized square PNG favicon versions at the verified dimensions and overwrite [public/favicon-48x48.png](file:///c:/Users/HP/Downloads/new%20portofolio/public/favicon-48x48.png) and [public/favicon-96x96.png](file:///c:/Users/HP/Downloads/new%20portofolio/public/favicon-96x96.png)
- [ ] T019 [P] [US4] Generate and overwrite the iOS home screen icon [public/favicon-180x180.png](file:///c:/Users/HP/Downloads/new%20portofolio/public/favicon-180x180.png) and PWA app icons [public/favicon-192x192.png](file:///c:/Users/HP/Downloads/new%20portofolio/public/favicon-192x192.png) and [public/favicon-512x512.png](file:///c:/Users/HP/Downloads/new%20portofolio/public/favicon-512x512.png)
- [ ] T020 [P] [US4] Compile the multi-resolution fallback icon [public/favicon.ico](file:///c:/Users/HP/Downloads/new%20portofolio/public/favicon.ico) containing sizes (16, 32, 48)
- [ ] T021 [P] [US4] Update metadata and icon bindings in PWA schema configuration file [public/manifest.json](file:///c:/Users/HP/Downloads/new%20portofolio/public/manifest.json)
- [ ] T022 [P] [US4] Replace the social preview card asset [public/images/og-image.png](file:///c:/Users/HP/Downloads/new%20portofolio/public/images/og-image.png) with the new design (1200x630px)

**Checkpoint**: Favicons, manifest configurations, and open graph image updated and validated.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, code cleanup, and performance audits

- [ ] T023 Perform a complete codebase clean-up, removing any residual legacy coordinates or inline styling overrides in [src/components/](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/) and [src/layouts/Layout.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/layouts/Layout.astro)
- [ ] T024 Run a full production compilation check (`npm run build`) from the project root to ensure zero build errors
- [ ] T025 Run the custom asset optimization script `node scripts/optimize-assets.mjs` to compress image exports and verify PageSpeed targets
- [ ] T026 Conduct [specs/013-brand-identity-refactor/quickstart.md](file:///c:/Users/HP/Downloads/new%20portofolio/specs/013-brand-identity-refactor/quickstart.md) validation by testing in a local browser and inspecting asset links

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

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - May integrate with other stories but is focused on static asset generation

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
Task: "Regenerate and overwrite the vector favicon asset in public/favicon.svg"
Task: "Generate optimized square PNG favicon versions at the verified dimensions..."
Task: "Generate and overwrite the iOS home screen icon public/favicon-180x180.png..."
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
