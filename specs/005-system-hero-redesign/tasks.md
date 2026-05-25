# Tasks: Minimalist Systems Hero Layout

**Input**: Design documents from `/specs/005-system-hero-redesign/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure verification

- [x] T001 [P] Verify background system image is present in `src/assets/images/growth-engine-bg.png`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Verify dev server compiles and baseline E2E tests run cleanly using `npx playwright test`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Minimalist Centered System Layout (Priority: P1) 🎯 MVP

**Goal**: Render the Hero section in a centered single-column layout using a full-screen system background image, with zero split columns and zero portraits.

**Independent Test**: Visually load the site and verify center alignment of Hero elements, with the single background image visible and no portrait.

### Implementation for User Story 1

- [x] T003 [P] [US1] Modify `src/components/sections/Hero.astro` to remove the portrait container, split-column layout grids, and change the outer container to an absolute centered column layout.
- [x] T004 [P] [US1] Style the background image container in `src/components/sections/Hero.astro` with absolute positioning, cover sizing, reduced opacity, and radial overlays to ensure high contrast and zero CLS.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - High-Contrast System outcome messaging (Priority: P2)

**Goal**: Ensure the copywriting is direct and punchy, highlighting the system and the +182% sales growth outcome, and translated correctly.

**Independent Test**: View English and Arabic versions of the homepage and check that the core sales scaling message matches translation files.

### Implementation for User Story 2

- [x] T005 [P] [US2] Update English localized copy in `src/content/hero/en.md` with system-focused B2B messaging.
- [x] T006 [P] [US2] Update Arabic localized copy in `src/content/hero/ar.md` with corresponding B2B system messaging.
- [x] T007 [US2] Adjust text highlighting function and styling in `src/components/sections/Hero.astro` to ensure correct tag rendering and RTL/LTR text flow.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Direct Growth Audit Intake (Priority: P3)

**Goal**: Provide an audit domain input form and exploration CTA buttons with smooth scroll-and-fill functionality.

**Independent Test**: Input a domain, click submit, and verify page scroll and form pre-fill.

### Implementation for User Story 3

- [x] T008 [US3] Implement/update the inline audit intake form with input styling and submission event listener in `src/components/sections/Hero.astro` to handle scrolling to the contact form and pre-populating the message textarea.
- [x] T009 [P] [US3] Verify page navigation/anchors do not append trailing hash fragments to the URL during transitions.

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T010 [P] Check visual layouts on mobile, tablet, and desktop viewports using browser responsiveness tools
- [x] T011 [P] Run `astro check` and `npm run build` to ensure type-safe and compilation builds pass
- [x] T012 [P] Run Playwright E2E tests (`npx playwright test`) to ensure baseline and navigation transitions pass without failures

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

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch layout updates and background styling updates in parallel:
Task: "Modify src/components/sections/Hero.astro to remove the portrait container..."
Task: "Style the background image container in src/components/sections/Hero.astro..."
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready
