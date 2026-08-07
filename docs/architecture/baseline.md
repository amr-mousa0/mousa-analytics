# Architecture & Regression Baseline (ARC-002)

**Baseline Capture Date:** 2026-08-01  
**Task:** `ARC-002 — Capture regression baseline`  
**Compliance Context:** Executed under [PLAN.md](../../PLAN.md) Wave 0 and [TASKS.md](../../TASKS.md).

---

## 1. Typecheck & Diagnostics Baseline

Command executed: `npm run check` (Astro Diagnostics Engine)

```text
> amr-portfolio@1.0.0 check
> astro check

[content] Synced content
[types] Generated
Result (69 files):
- 0 errors
- 0 warnings
- 2 hints (unused imports in src/lib/orchestrator/pipelineOrchestrator.ts and src/lib/providers/storageProvider.ts)
```

**Status:** PASS (0 blocking diagnostics).

---

## 2. Unit Test Suite Baseline

Command executed: `npm run test:unit`

```text
Test Files  1 failed | 5 passed (6 total)
Tests       25 passed (25 total)
```

### Passing Suites (5/6):
- `tests/unit/tokens.test.ts` (FND-001 design token palette, typography, radii, spacing, shadow assertions)
- `tests/unit/manifest.test.ts` (Manifest parsing and normalization)
- `tests/unit/pipelineOrchestrator.test.ts` (15-stage pipeline execution and target checks)
- `tests/unit/schemas.test.ts` (Project, service, blog, and social collection schema assertions)
- `tests/unit/sqlPracticeSync.test.ts` (SQL practice synchronization logic)

### Documented Baseline Failure (1/6):
- `tests/unit/contentHubClient.test.ts`
  - **Error:** `Failed to load url astro:content (resolved id: astro:content)`
  - **Owner:** Platform / Architecture (`CNT-001` façade task)
  - **Root Cause:** Direct import of Astro's virtual module `astro:content` inside standalone Vitest environment without Astro test runner environment container.
  - **Baseline Debt Note:** Recorded per `ARC-002` rules. Assertion will be resolved under `CNT-001` when the content façade replaces direct virtual content imports.

---

## 3. Public Route & Language Baseline

| Route Pattern | Supported Locales | Authority Source |
|---|---|---|
| `/` | `en`, `ar` (default Arabic `/` route) | `src/pages/index.astro`, `src/pages/[...lang]/index.astro` |
| `/projects` | `en`, `ar` | `src/pages/[...lang]/projects/index.astro` |
| `/projects/[slug]` | `en`, `ar` | `src/pages/[...lang]/projects/[slug].astro` |
| `/services` | `en`, `ar` | `src/pages/[...lang]/services/index.astro` |
| `/services/[slug]` | `en`, `ar` | `src/pages/[...lang]/services/[slug].astro` |
| `/blog` | `en`, `ar` | `src/pages/[...lang]/blog/index.astro` |
| `/blog/[slug]` | `en`, `ar` | `src/pages/[...lang]/blog/[slug].astro` |
| `/privacy`, `/terms` | static | `src/pages/privacy.astro`, `src/pages/terms.astro` |

---

## 4. API Route Compatibility Baseline

| API Path | Version | Current Implementation | Target Architecture (`APP-003`) |
|---|---|---|---|
| `/api/health` | Legacy v0 | `src/pages/api/health.ts` | Thin adapter over `health.controller.ts` |
| `/api/v1/health` | Version 1 | `src/pages/api/v1/health.ts` | Thin adapter over `health.controller.ts` |
| `/api/projects` | Legacy v0 | `src/pages/api/projects.ts` | Thin adapter over `projects.controller.ts` |
| `/api/v1/projects` | Version 1 | `src/pages/api/v1/projects.ts` | Thin adapter over `projects.controller.ts` |

---

## 5. Contact UX Baseline

- **Primary Conversion Channel:** Direct WhatsApp Lead Capture.
- **Target Phone Number:** `201017749925` (to be centralized in `site.config.ts` under `FND-004`).
- **Interactive Component:** `Navigation.astro` WhatsApp lead selection form (`whatsapp-lead-form`).
- **Secondary CTAs:** Section and page buttons routing to WhatsApp with pre-filled lead messages.

---

## 6. Audit & Debt Cross-Reference Baseline

All 15 findings (`CC-01` through `CC-15`) from `Constitution Compliance Audit.md` remain tracked in `Technical Debt Register.md` with status `Open`, awaiting Wave 1–5 task implementations.
