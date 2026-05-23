# Astro Portfolio Constitution

## Core Principles

### I. Astro-Native Architecture
The project must use native Astro components and features (like Astro Content Collections) as the primary architecture. Do not introduce Single Page Application (SPA) architecture or complex router libraries.

### II. Isolated Hydration & No Global Runtime
No global client runtime is allowed unless explicitly requested. Keep hydration isolated. Do not use React islands unless explicitly required. Avoid Zustand, Redux, or other global state managers.

### III. TypeScript Strict Mode
All TypeScript code must run in strict mode (`strict: true` in `tsconfig.json`) to enforce type-safety and eliminate compile-time bugs.

### IV. Styling with Tailwind Logical Properties
Styling must be built on Tailwind CSS, using Tailwind logical properties (e.g., margins, padding, border-radius, inset) exclusively to ensure modern, responsive layouts. No light/dark mode systems are to be implemented.

### V. Minimal Dependency Footprint (No GSAP)
Avoid unnecessary packages and dependencies. Specifically, the GSAP animation library must not be used.

## Governance

All PRs, commits, and additions must be validated against these core principles. Any deviation must be explicitly justified and approved by the user.

**Version**: 1.0.0 | **Ratified**: 2026-05-23 | **Last Amended**: 2026-05-23
