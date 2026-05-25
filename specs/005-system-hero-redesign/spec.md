# Feature Specification: Minimalist Systems Hero Layout

**Feature Branch**: `005-system-hero-redesign`

**Created**: 2026-05-24

**Status**: Draft

**Input**: User description: "Very important: do not change the current presentation system, only one clean image representing the system or organization in the background completely, not split, not many elements, not chaotic, converting to minimalist and simple. I don't want showing off, I don't want stupidity, I don't want on the right my face and on the left old text, that's old-fashioned and super boring."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Minimalist Centered System Layout (Priority: P1)

As a B2B client visiting the homepage, I want to see a single-column, centered minimalist layout presenting the core growth system rather than a split layout with a personal profile photo on one side, so that I can immediately focus on the product and performance metrics.

**Why this priority**: Focuses the landing page entirely on the "growth engine machine" value proposition rather than commodity personal branding. It removes visual clutter and aligns with a minimalist, clean aesthetic.

**Independent Test**: Load the landing page and verify the layout is centered, contains no split-column layout for portrait vs. text, and does not feature a personal profile picture on the right side of the screen.

**Acceptance Scenarios**:

1. **Given** a visitor lands on the homepage, **When** the page renders, **Then** all copy, CTAs, and statistics are centered in a single column.
2. **Given** the page is loaded, **When** viewing the background, **Then** a single, unified, non-cluttered image representing the acquisition system spans the background completely.
3. **Given** the page is loaded, **When** checking for split layout structures, **Then** there is no side-by-side split layout containing text on the left and a portrait on the right.

---

### User Story 2 - High-Contrast System outcome messaging (Priority: P2)

As a B2B lead, I want to read concise, high-impact copywriting explaining the system's quantitative results (+182% sales growth) and data-to-acquisition integration, so that I can quickly evaluate the business value in under 5 seconds.

**Why this priority**: Reduces cognitive load, makes the system's core message clear, and provides immediate intellectual authority.

**Independent Test**: Read the headline and description on both desktop and mobile viewports, verifying the text is short, clear, and focused on system integration.

**Acceptance Scenarios**:

1. **Given** the home page is loaded, **When** reading the copy, **Then** the primary outcome metric (+182% sales growth) is prominent.
2. **Given** a visitor switches between English and Arabic, **When** the copy renders, **Then** it must maintain structural alignment, translation parity, and support logical LTR/RTL reading flows.

---

### User Story 3 - Direct Growth Audit Intake (Priority: P3)

As a high-intent B2B lead, I want to easily submit my store URL to request a growth audit and explore the system methodology, so that I can quickly engage with the services.

**Why this priority**: Drives user engagement and leads directly from the Hero section based on the system approach.

**Independent Test**: Fill out the domain input box in the Hero section and submit, verifying it navigates to the contact area with the domain pre-populated.

**Acceptance Scenarios**:

1. **Given** a user inputs a store domain, **When** they click the primary CTA button, **Then** they are navigated smoothly to the contact form, with the audit URL pre-filled in the inquiry details.
2. **Given** a user clicks the secondary CTA, **When** they do so, **Then** they are navigated smoothly to the methodology section.

---

### Edge Cases

- **Empty or invalid URL entry**: If the user submits a blank input or an invalid URL structure in the domain audit form, the system should prevent submission and display a clean browser-native validation message.
- **RTL / Arabic alignment for formulas**: When rendering metrics like "+182%" or labels, the numbers and symbols must align correctly in both English (LTR) and Arabic (RTL) without broken layouts.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Hero section layout MUST be centered as a single column and must NOT use a split-column grid (such as text on the left and a portrait on the right).
- **FR-002**: The background MUST feature a single, clean, optimized image representing the growth system/organization, styled to blend smoothly into the background.
- **FR-003**: The Hero copy MUST be clean and minimalist, highlighting the system integration (Data Tracking + Media Buying) and the core outcome (+182% sales growth).
- **FR-004**: The section MUST exclude biographical text introducing the person, focusing instead on the system engine and measurable B2B outcomes.
- **FR-005**: The primary CTA MUST be an interactive URL input form for entering a store domain to request an audit, which pre-populates the contact inquiry.
- **FR-006**: The CTAs and layouts MUST fully support English and Arabic translations with logical reading flow direction (LTR and RTL).

### Key Entities

- **System Background Image**: A single, clean visual asset representing the growth engine structure or data flow diagram that spans the full background.
- **Audit Intake Form**: An inline input field for store URLs and a submit button that links directly to the detailed contact form.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100/100 Lighthouse SEO score and >=90 Performance score.
- **SC-002**: Average page load speed remains fast, with zero Cumulative Layout Shift (CLS) from the background image.
- **SC-003**: 100% of links and form submissions successfully guide the user to the correct anchors or pre-fill the audit request.

## Assumptions

- **A-001**: The brand name "Mousa Analytics" is displayed at the top of the Hero.
- **A-002**: The layout uses standard tailwind styling that is already set up in the main project layouts.
- **A-003**: High-performance image loading is handled by the Astro native `<Image />` component.
