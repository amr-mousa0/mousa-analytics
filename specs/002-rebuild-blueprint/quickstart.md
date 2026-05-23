# Quickstart Guide: Amr Portfolio

Welcome to the localized Amr portfolio rebuild. This guide covers how to set up the project locally, run the development environment, and validate requirements.

## 1. Prerequisites

Ensure you have the following installed:
- Node.js (LTS version, v18+)
- npm (Node Package Manager)

## 2. Installation

Install all required workspace dependencies:

```bash
npm install
```

## 3. Development Server

Launch the Astro development server locally:

```bash
npm run dev
```

The site will be available at `http://localhost:4321/`.

## 4. Building for Production

Compile a production-ready static build:

```bash
npm run build
```

## 5. Verification Commands

Ensure all checks and verification tests pass successfully:

### Local Type Safety
Validate TypeScript and Astro markup:

```bash
npm run check
```

### Schema Checks (Vitest)
Verify content collections schema validation rules:

```bash
npx vitest run
```

### E2E Tests (Playwright)
Run the Playwright E2E verification test suite:

```bash
npx playwright test
```
