# Implementation Plan: Minimalist Systems Hero Layout

**Branch**: `005-system-hero-redesign` | **Date**: 2026-05-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-system-hero-redesign/spec.md`

## Summary

This plan outlines the design transitions, routing, localization setup, and verification checklists to implement the centered, minimalist Systems Hero section on the portfolio landing page.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 18+ (strict mode enabled)

**Primary Dependencies**: Astro (latest), Tailwind CSS, Sharp

**Storage**: Astro Content Collections (typed schema)

**Testing**: Playwright (E2E), Vitest (Unit), `astro check`

**Target Platform**: Static Host (Vercel/Netlify)

**Project Type**: Localized Web Application

**Performance Goals**: Lighthouse performance score >= 90, SEO score 100, CLS = 0

**Constraints**: No GSAP, no global client runtimes, Tailwind logical properties only, zero unnecessary hydration, no light/dark mode.

**Scale/Scope**: Hero section redesign for both English and Arabic locales.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Gate | Status | Notes / Justification |
|------------------|--------|-----------------------|
| I. Astro-Native Architecture | **PASS** | Uses Astro Content Collections and native components. |
| II. Isolated Hydration & No Global Runtime | **PASS** | Standard vanilla JavaScript only. No React or Zustand. |
| III. TypeScript Strict Mode | **PASS** | Validated in tsconfig.json. |
| IV. Styling with Tailwind Logical Properties | **PASS** | Exclusively uses logical properties. |
| V. Minimal Dependency Footprint (No GSAP) | **PASS** | GSAP excluded; scroll parallax uses standard CSS transition/transforms. |

## Project Structure

### Documentation (this feature)

```text
specs/005-system-hero-redesign/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── sections/
│       └── Hero.astro   # Main Hero section component
├── content/
│   └── hero/
│       ├── en.md        # English localized copy
│       └── ar.md        # Arabic localized copy
└── assets/
    └── images/
        └── growth-engine-bg.png  # Single background image of growth system
```

**Structure Decision**: Adhere to the existing unified Astro single-project layout under `src/`.

## Proposed Changes

### Hero Redesign

#### [MODIFY] [Hero.astro](file:///c:/Users/HP/Downloads/new%20portofolio/src/components/sections/Hero.astro)
- Simplify HTML tags, clean up styling, and ensure absolute center alignment of elements.
- Clean up text overlays, stats cards, and CTA forms.
- Exclude any profile image elements or split columns.

#### [MODIFY] [en.md](file:///c:/Users/HP/Downloads/new%20portofolio/src/content/hero/en.md)
- Set title, description, buttons, stats to match the systems rebrand values.

#### [MODIFY] [ar.md](file:///c:/Users/HP/Downloads/new%20portofolio/src/content/hero/ar.md)
- Set title, description, buttons, stats to match the Arabic systems rebrand values.

## Verification Plan

### Automated Tests
- Run `npm run test` or `npx playwright test` to verify page rendering, links, and forms.
- Run `npm run build` to ensure type checks and building succeed without errors.

### Manual Verification
- View layout responsiveness on mobile (Safari/Chrome) and desktop.
- Verify RTL text alignment for Arabic locale (`/ar/`).
- Verify domain input pre-fills the message text area on submitting the form.
