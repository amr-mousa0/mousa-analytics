# Implementation Plan: Master Rebuild Blueprint

**Branch**: `002-rebuild-blueprint` | **Date**: 2026-05-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-rebuild-blueprint/spec.md`

## Summary

This plan details the full scaffolding, implementation phases, and verification rules to rebuild the Amr portfolio website from scratch. It defines six sequential phases (Phases 0 through 5), strict runtime safety controls, design principles, and enterprise verification checklists.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 18+ (strict mode enabled)

**Primary Dependencies**: Astro (latest), Tailwind CSS, TypeScript

**Storage**: Astro Content Collections (typed schema)

**Testing**: Playwright (E2E), Vitest (Schema / Unit), `astro check`

**Target Platform**: Vercel / Netlify / Static Host

**Project Type**: Localized Web Application

**Performance Goals**: Lighthouse performance score >= 90, SEO score 100

**Constraints**: No GSAP, no global client runtimes, no light/dark mode system, no state managers.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Gate | Status | Notes / Justification |
|------------------|--------|-----------------------|
| I. Astro-Native Architecture | **PASS** | Pure Astro-native layout and pages without SPA dependencies. |
| II. Isolated Hydration & No Global Runtime | **PASS** | Hydration isolated, zero global JS or Zustand/Redux. |
| III. TypeScript Strict Mode | **PASS** | Strict mode validated in tsconfig. |
| IV. Styling with Tailwind Logical Properties | **PASS** | Tailwind logical properties used throughout src/. |
| V. Minimal Dependency Footprint (No GSAP) | **PASS** | Animation libraries excluded. |

## Project Structure

We will adhere to the following directory structure:

```text
src/
├── components/
│   ├── sections/        # Section components (Hero, About, Services, Contact)
│   └── ui/              # Atom components (Buttons, Cards, Modals)
├── content/
│   ├── config.ts        # Collections definition file
│   ├── seo/
│   │   ├── en/
│   │   └── ar/
│   ├── services/
│   │   ├── en/
│   │   └── ar/
│   └── socials/
│       ├── en/
│       └── ar/
├── layouts/             # Page layouts
├── pages/
│   └── [lang]/          # Localized dynamic pages (index.astro, methodology.astro)
├── scripts/             # Standard utilities / browser runtime elements
├── styles/              # Global stylesheets (Tailwind imports)
└── types/               # TypeScript interfaces
tests/
├── e2e/                 # Playwright test specs
└── unit/                # Vitest files
```

## Proposed Implementation Phases

### Phase 0: System Architecture & Foundation Setup
- Initialize `package.json`, `tsconfig.json` with strict mode, `astro.config.mjs`, and `tailwind.config.mjs`.
- Install core devDependencies.
- Verify standard `astro check` run compiles successfully.

### Phase 1: Localized Content Collections Schema
- Define schema definitions in `src/content/config.ts` for SEO metadata, services, and social links.
- Place localized markdown files inside `src/content/seo/en`, `src/content/seo/ar`, etc.
- Write unit tests in `tests/unit/` using Vitest to validate schemas against markdown files.

### Phase 2: Core Layouts & Localized Routing (Routing Freeze)
- Implement `src/layouts/Layout.astro` supporting dynamic language and page direction (`dir` attribute: RTL/LTR).
- Implement dynamic routing folder `src/pages/[lang]/index.astro` and `src/pages/[lang]/methodology.astro`.
- Implement dynamic route parameter guards in the frontmatter. If `lang` is invalid, redirect to `/en/`.
- Foundational routing and layout systems become FROZEN after this phase.

### Phase 3: Component Development & Page Construction
- Implement localized components inside `src/components/sections/` (Hero, About, Services, Socials, Contact form).
- Implement honeypot anti-spam verification (`_gotcha` field) on the contact form.
- Use Tailwind CSS logical properties for layout margins and padding.

### Phase 4: Methodology Page & Navigation Drawer
- Implement `src/pages/[lang]/methodology.astro` displaying Amr's marketing and analytical methods.
- Build localized header/footer and mobile side drawer navigation.
- Ensure transitions between routes do not append messy hash fragments to the URL.

### Phase 5: Verification & Production Polish
- Implement automated E2E tests in `tests/e2e/` with Playwright covering forms, routing, and language switches.
- Run `npm run build` and ensure zero TypeScript compilation errors or hydration warnings.
- Run Lighthouse CI audits and verify that performance budgets are met.
