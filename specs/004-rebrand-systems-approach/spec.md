# Feature Specification: Rebrand to The Systems Approach

**Feature Branch**: `004-rebrand-systems-approach`

**Created**: 2026-05-24

**Status**: Draft

**Input**: User description: "change this to The Systems Approach so insted of identfying myself i will identfy the product or service i offer and to be in a fucking very simple words and shortcut up to the point and neit also its very important to have an image as the landing page or brand i guess and the brand name and logo search for the best approch for this"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Brand Identity & Positioning (Priority: P1)

The homepage presents "The Systems Approach" as the core brand instead of "Amr Mousa", describing the data-driven marketing and analysis service with clear, simple, and neat copywriting.

**Why this priority**: Establishing the brand identity and shifting from personal to product-focused marketing is the core objective of this feature.

**Independent Test**: Loading the homepage `/en/` or `/ar/` immediately shows "The Systems Approach" as the primary title/brand, with objective copywriting explaining the service.

**Acceptance Scenarios**:
1. **Given** a visitor lands on the homepage, **When** they read the hero title and description, **Then** they see "The Systems Approach" as the core product/service offering, written in simple, concise terms.
2. **Given** the page renders, **When** reviewing the header or footer, **Then** all references to "Mousa Analytics" or "Amr Mousa" are replaced with the brand name "The Systems Approach".

---

### User Story 2 - Visual Brand Asset & Hero Image (Priority: P2)

The landing page features a striking, premium, and clean brand image/visual (such as a modern data system design or abstract geometric pattern) representing "The Systems Approach" instead of a personal portrait.

**Why this priority**: Provides the visual branding and identity necessary to establish credibility without personal face photos.

**Independent Test**: The hero section renders a custom brand graphic or abstract image (using optimized formats) representing data pipelines and system flows.

**Acceptance Scenarios**:
1. **Given** the hero section renders, **When** viewing the visual column on desktop or mobile, **Then** a clean, abstract brand image representing "The Systems Approach" is displayed instead of Amr's portrait.

---

### User Story 3 - Concise & Direct Copywriting (Priority: P3)

All copy on the website (Hero, About/Philosophy, Services, and Contact sections) is distilled into extremely simple, neat, and short sentences to get straight to the point.

**Why this priority**: Eliminates cognitive load and aligns with the user's requirement for very simple, shortcut, and neat language.

**Independent Test**: Every paragraph in the main sections is reviewed to ensure it contains no fluff or personal pronouns, using clear, direct business language.

**Acceptance Scenarios**:
1. **Given** any text block on the homepage, **When** read by a visitor, **Then** it uses direct, objective phrasing (e.g. "We build...", "Our method...") rather than personal pronouns ("I", "my").

---

### Edge Cases

- **Legacy Personal Pages**: If a user navigates to `/about/` (formerly "About Me" Amr Mousa), the page should either redirect to the homepage or be rebranded as "Our Approach" / "About The Systems Approach" to maintain consistency.
- **Arabic Translation Parity**: Ensuring "The Systems Approach" translates neatly to Arabic (e.g. "نهج الأنظمة" or "النهج النظامي") while keeping the same simple and direct tone.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The website header, footer, page title, and meta metadata MUST use "The Systems Approach" (or "نهج الأنظمة" in Arabic) instead of "Mousa Analytics" or "Amr Mousa".
- **FR-002**: The Hero section title MUST display "The Systems Approach" and the copy MUST be distilled into a single, clean headline and brief subtitle.
- **FR-003**: The Hero section portrait frame MUST be replaced with a custom, high-end brand visual/image representing systems, data flows, or precision marketing.
- **FR-004**: All personal references (e.g., "Amr Mousa", "I", "my", "me", "Who I Am") MUST be transitioned to objective, brand-focused copy ("Our team", "We", "About the System").
- **FR-005**: The `/about/` page path MUST be rebranded to focus on the company philosophy, team approach, and methodology rather than a single person's history.

### Key Entities

- **Brand Visual**: The main abstract graphic representing "The Systems Approach".
- **Brand Logo**: The updated logo text and logo emblem ("A" to "S" or custom brand emblem).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero occurrences of the string "Amr Mousa" or personal pronouns (I, my, me) in the user-visible copy of the homepage.
- **SC-002**: Page loading speeds remain high with Lighthouse performance score >= 90 and SEO score 100.
- **SC-003**: Core interactive routes (methodology, contact, portfolio anchors) remain fully functional.

## Assumptions

- We will design a custom brand visual / image (either using CSS art or a high-end vector SVG / optimized image asset) to represent "The Systems Approach".
- The brand colors (#2563EB, #F8F9FA, #0A192F) and layout structure will remain consistent.
