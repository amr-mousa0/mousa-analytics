# Implementation Plan: Master Rebuild Blueprint

**Branch**: `002-rebuild-blueprint` | **Date**: 2026-05-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-rebuild-blueprint/spec.md`

## Summary

This plan details the full scaffolding, implementation phases, and verification rules to rebuild the Amr portfolio website from scratch. It defines six sequential phases (Phases 0 through 5), strict runtime safety controls, design principles, and enterprise verification checklists.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 18+ (strict mode enabled)

**Primary Dependencies**: Astro (latest), Tailwind CSS, TypeScript, Sharp (image optimization)

**Storage**: Astro Content Collections (typed schema)

**Testing**: Playwright (E2E), Vitest (Schema / Unit), `astro check`

**Target Platform**: Vercel / Netlify / Static Host

**Project Type**: Localized Web Application

**Performance Goals**: Lighthouse performance score >= 90, SEO score 100

**Constraints**: No GSAP, no global client runtimes, no light/dark mode system, no state managers.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Gate | Status | Notes / Justification |
|------------------|--------|-----------------------|
| I. Astro-Native Architecture | **PASS** | Pure Astro-native layout and pages without SPA dependencies. |
| II. Isolated Hydration & No Global Runtime | **PASS** | Hydration isolated, zero global JS or Zustand/Redux. |
| III. TypeScript Strict Mode | **PASS** | Strict mode validated in tsconfig. |
| IV. Styling with Tailwind Logical Properties | **PASS** | Tailwind logical properties used throughout src/. |
| V. Minimal Dependency Footprint (No GSAP) | **PASS** | Animation libraries and GSAP excluded. |

---

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
│   ├── index.astro      # Root locale redirect page
│   └── [lang]/          # Localized dynamic pages (index.astro, methodology.astro)
├── scripts/             # Standard utilities / browser runtime elements
├── styles/              # Global stylesheets (Tailwind imports)
├── types/               # TypeScript interfaces
└── middleware.ts        # CSP and security headers middleware
tests/
├── e2e/                 # Playwright test specs
└── unit/                # Vitest files
```

---

## Core Architecture & Safety Rules

### 1. Root Locale Redirect (`src/pages/index.astro`)
- Direct visits to the root URL `/` must redirect using a history-safe navigation mechanism:
  - Client-side: `window.location.replace('/en/')` to prevent breaking the back button.
  - Server-side / static fallback: `<meta http-equiv="refresh" content="0;url=/en/" />` for bots and zero-JS clients.

### 2. Runtime Safety & Listener Lifecycle Management
- To prevent memory leaks and duplicate listeners during client-side navigation (especially when using Astro View Transitions):
  - **Duplicate Listener Guards**: Wrap event registration (e.g., drawer toggling, scroll events) with verification logic to ensure listeners are not added multiple times to `window` or `document`.
  - **Astro Transition Hooks**: Hook into `astro:before-swap` to dynamically clean up state, disconnect observers (`ResizeObserver`, `IntersectionObserver`), and clean up stale DOM modifications.
  - **Observer Registry**: Implement a central tracking array/registry for active observers so they can be explicitly disconnected on route swap.

### 3. Hydration Governance (Zero unnecessary hydration)
- Maintain a strict zero-JS-by-default policy.
- Prevent unnecessary `client:*` directives on Astro components.
- Isolate interactive elements to minimal interactive islands.

### 4. Security & CSP Middleware (`src/middleware.ts`)
- Implement Astro middleware to inject standard security headers:
  - **Content-Security-Policy (CSP)**: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';`
  - **X-Frame-Options**: `DENY`
  - **Referrer-Policy**: `strict-origin-when-cross-origin`
  - **X-Content-Type-Options**: `nosniff`

### 5. Styling Audit (Tailwind Logical Properties Only)
- Prohibit direction-locked physical Tailwind classes:
  - Do NOT use: `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`, `text-right`.
  - Use logical alternatives: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`.

### 6. Asset & Performance Optimization
- All layout and background images must be processed through Astro's image optimization engine backed by `sharp` to output optimized WebP/AVIF images.
- Enforce bundle budgets: zero third-party client scripts, zero Zustand/state managers, and zero GSAP.

---

## Proposed Implementation Phases

### Phase 0: System Architecture & Foundation Setup
- Initialize `package.json`, `tsconfig.json` with strict mode, `astro.config.mjs`, and `tailwind.config.mjs`.
- Install dependencies: `astro`, `tailwindcss`, `typescript`, `@types/node`, `@tailwindcss/vite` (or equivalent), `sharp`.
- Verify standard `astro check` compiles successfully.

### Phase 1: Localized Content Collections Schema & Tests
- Define schema definitions in `src/content/config.ts` for SEO metadata, services, and social links.
- Place localized markdown files inside `src/content/seo/en`, `src/content/seo/ar`, etc.
- Write unit tests in `tests/unit/` using Vitest to validate schemas against markdown files.

### Phase 2: Core Layouts, Security Middleware, & Localized Routing (Routing Freeze)
- Implement `src/middleware.ts` for CSP, X-Frame-Options, Referrer-Policy, and X-Content-Type-Options.
- Implement root redirect in `src/pages/index.astro` using `window.location.replace('/en/')` and `<meta>` fallback.
- Implement `src/layouts/Layout.astro` supporting dynamic language and page direction (`dir` attribute: RTL/LTR).
- Implement dynamic routing folder `src/pages/[lang]/index.astro` and `src/pages/[lang]/methodology.astro`.
- Implement dynamic route parameter guards in the frontmatter. If `lang` is invalid, redirect to `/en/`.
- **Checkpoint**: Foundational routing, layout, and middleware security systems become FROZEN after this phase.

### Phase 3: Dynamic UI Components & Landing Page
- Implement UI components styled strictly with Tailwind logical properties (no direction-locked physical styles).
- Implement localized sections: Hero, About card layout, Services grid, and Socials.
- Implement Contact form component inside `src/components/sections/Contact.astro` including the hidden anti-spam `_gotcha` input field.

### Phase 4: Methodology Page & Navigation Drawer Lifecycle
- Implement `src/pages/[lang]/methodology.astro` displaying Amr's marketing and analytical methods.
- Build localized header/footer and mobile side drawer navigation.
- Implement lifecycle cleanups: hook into `astro:before-swap` to clean up transition state, disconnect Resize/Intersection observers, and prevent duplicate event listeners.
- Ensure transitions between routes do not append messy hash fragments to the URL.

### Phase 5: Verification & Production Polish
- Implement automated E2E tests in `tests/e2e/` with Playwright covering forms, routing redirection, and language switches.
- Run `npm run build` and ensure zero TypeScript compilation errors or hydration warnings.
- Run Lighthouse CI audits and verify that performance budgets are met.
