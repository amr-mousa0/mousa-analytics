# Feature Specification: Creative Hero Redesign

**Feature Branch**: `003-redesign-hero-creative`

**Created**: 2026-05-23

**Status**: Draft

**Input**: User description: "Redesign the Hero section with full creative freedom as the company's core landing/product introduction page, giving full liberty over color, layout, assets, and image styling."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Responsive Layout & Creative Portrait (Priority: P1)

Visitors see a visually striking, luxury-grade hero layout featuring a professional portrait framed in a vertical rectangular aspect ratio with an offset border and minimal mock analytics widgets, conveying technical mastery.

**Why this priority**: Crucial first impression that establishes immediate professional credibility and positions the company as an elite data-driven agency.

**Independent Test**: Loading the homepage displays the rectangular portrait, thin double borders, and mock dashboard pills correctly centered on both desktop and mobile viewports.

**Acceptance Scenarios**:

1. **Given** a visitor lands on `/en/` or `/ar/`, **When** the page renders, **Then** the portrait is displayed inside a custom rectangular frame with a thin Royal Blue border and a soft drop shadow.
2. **Given** a mobile viewport, **When** the page loads, **Then** the visual assets stack cleanly with the name and credentials at the top, followed by the portrait and details.

---

### User Story 2 - Unified Blueprint Grid & Typography (Priority: P2)

Visitors experience a continuous light slate background with a detailed fine grid pattern and high-contrast editorial typography (`Cormorant Garamond` headings + `Outfit` body).

**Why this priority**: Visually represents "precision engineering" and "data systems" while maintaining absolute readability.

**Independent Test**: The grid pattern spans across the entire viewport width, with cell sizes at `2rem_2rem` and text elements aligned to the grid lines.

**Acceptance Scenarios**:

1. **Given** the page renders, **When** scrolling, **Then** the fine blueprint grid lines are clearly visible but subtle (5% opacity), aligning all structural elements.

---

### User Story 3 - High-Conversion CTA Interaction (Priority: P3)

Visitors are guided by clear, active copywriting and can click CTA buttons that transition smoothly on hover.

**Why this priority**: Essential to convert portfolio visits into service inquiries and leads.

**Independent Test**: Primary and secondary buttons are fully interactive with transitions and redirect to the correct routes.

**Acceptance Scenarios**:

1. **Given** a visitor hover on "Explore Services", **When** they click, **Then** they are navigated to the methodology page.
2. **Given** a visitor hover on "Get to Know Me", **When** they click, **Then** the page scrolls smoothly to the contact section.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Hero section MUST use a continuous light slate background (`bg-primary-bg`) with a fine blue grid backdrop overlay (cell size `2rem_2rem`, opacity `0.05`).
- **FR-002**: Amr's profile portrait MUST be displayed in a vertical rectangular frame with a Royal Blue border and soft shadow, replacing the generic circle layout.
- **FR-003**: The visual composition MUST include at least one mock analytics widget (e.g. ROI Metric badge showing `+182%` and a pulsing green status dot) overlaying the portrait corner to visually convey the "Data & Marketing Analyst" brand identity.
- **FR-004**: Hero content and visual assets MUST align in an asymmetrical two-column layout on desktop and stack vertically on mobile.
- **FR-005**: All copywriting MUST use high-contrast text and support full localization (English/Arabic) with exact translation parity.

### Key Entities

- **Hero Layout**: The grid structure containing the text column, visual asset column, and floating widgets.
- **Mock Analytics Widget**: Decorative UI components styled as minimalist dashboard pills overlaying the portrait.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100/100 SEO score and >=90 Performance score in Lighthouse CI audits.
- **SC-002**: All 21 Playwright E2E tests pass successfully without diagnostic errors.
- **SC-003**: Zero layout shifts (CLS < 0.1) on load, with optimized WebP portrait delivery.

## Assumptions

- The existing logo, colors, and fonts (`Cormorant Garamond` + `Outfit`) are loaded correctly in `Layout.astro`.
- Mobile responsiveness will target standard device sizes (320px to 1024px+ width).
