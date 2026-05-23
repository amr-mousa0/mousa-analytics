# Implementation Plan: Project Bootstrap

**Branch**: `001-project-bootstrap` | **Date**: 2026-05-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-project-bootstrap/spec.md`

## Summary

Bootstrap a brand-new, clean Astro-native project in the repository root adhering to strict rules specified in `STARTER_CONSTRAINTS.md`. This will establish a lightweight, highly-performant skeleton featuring strict type-safety, Tailwind CSS using logical properties, and Astro Content Collections configuration, with no unnecessary runtime script or SPA frameworks.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 18+ (strict mode enabled)

**Primary Dependencies**: Astro (latest), Tailwind CSS, TypeScript

**Storage**: Astro Content Collections (typed schema)

**Testing**: `astro check` for syntax and type checks

**Target Platform**: Static Host / Modern Web Browsers

**Project Type**: Astro Web Application

**Performance Goals**: 100/100 Lighthouse Performance score on initial render (0ms blocking time, zero external JS)

**Constraints**: No GSAP, no Zustand/state managers, no client runtimes, no dark/light mode toggle.

**Scale/Scope**: Clean blank-slate scaffolding

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Gate | Status | Notes / Justification |
|------------------|--------|-----------------------|
| I. Astro-Native Architecture | **PASS** | Pure Astro page/layout structure, utilizing Astro Content Collections. |
| II. Isolated Hydration & No Global Runtime | **PASS** | Zero global JS, no state managers or React islands. |
| III. TypeScript Strict Mode | **PASS** | `strict: true` enabled in `tsconfig.json`. |
| IV. Styling with Tailwind Logical Properties | **PASS** | Tailwind configured; only logical properties will be used. No dark/light mode setup. |
| V. Minimal Dependency Footprint (No GSAP) | **PASS** | Scaffolding package.json with minimal dependencies. No GSAP. |

## Project Structure

### Documentation (this feature)

```text
specs/001-project-bootstrap/
├── plan.md              # This file
├── checklists/
│   └── requirements.md  # Spec checklist
└── spec.md              # Specification file
```

### Source Code (repository root)

We will initialize the following directory structure:

```text
astro.config.mjs         # Astro configuration
tailwind.config.mjs      # Tailwind CSS configuration
tsconfig.json            # Strict TypeScript configuration
package.json             # Package manifest (using npm consistently)
package-lock.json        # Lock file
src/
├── components/
│   ├── sections/
│   └── ui/
├── content/
│   ├── seo/
│   │   ├── en/
│   │   └── ar/
│   ├── services/
│   │   ├── en/
│   │   └── ar/
│   └── socials/
│       ├── en/
│       └── ar/
├── layouts/
├── pages/
│   └── [lang]/
├── scripts/
├── styles/
└── types/
tests/
├── e2e/
└── unit/
```

**Structure Decision**: Single project layout with a standard Astro structure inside the repository root.

## Complexity Tracking

No violations.
