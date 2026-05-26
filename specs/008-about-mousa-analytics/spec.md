# Feature Specification: about-mousa-analytics

**Feature Branch**: `008-about-mousa-analytics`

**Created**: 2026-05-26

**Status**: Draft

**Input**: User description: "بناء صفحة تعريفية موحدة تجمع بين (من أنا - خبير التحليلات عمرو موسى) و(من نحن - علامة موسى للتحليلات) لحل تشتت الهوية وتعزيز المصداقية والـ B2B."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Understand the Expert's Profile (Priority: P1)

As a business lead, I want to understand the exact credentials, skills, and professional journey of Amr Mousa (the CEO & Lead Analyst) so that I can trust him with my sensitive business data and budget.

**Why this priority**: Trust and authority (Social Proof) are the absolute highest conversion drivers in B2B consulting. Seeing real credentials is P1.

**Independent Test**: Can be fully tested by reviewing the founder bio, credentials block, and timeline section on the `/about/` page, ensuring it matches NTI, DEPI, and So Care actual backgrounds.

**Acceptance Scenarios**:

1. **Given** a user lands on the `/ar/about/` page, **When** they scroll to the founder's section, **Then** they see Amr Mousa's certified credentials, NTI/DEPI alumni details, and experience timeline in clean Arabic.
2. **Given** a user lands on the `/en/about/` page, **When** they scroll to the founder's section, **Then** they see the exact corresponding English profile.

---

### User Story 2 - Understand the Corporate Agency (Priority: P2)

As a corporate client, I want to understand what "Mousa Analytics" is, its core values, unique value proposition, and business philosophy so that I know how the firm handles projects professionally.

**Why this priority**: A corporate shell provides stability, official contracting structures, and represents a robust system beyond just a single person.

**Independent Test**: Verified by reviewing the "Mousa Analytics" section on the `/about/` page.

**Acceptance Scenarios**:

1. **Given** a user reviews the company section, **When** they read the brand values, **Then** they understand how Mousa Analytics solves ad waste and builds tracking architecture.

---

### Edge Cases

- **What happens when a client only wants to deal with an agency and not a solo freelancer?** The spec handles this by framing "Mousa Analytics" as a specialized consultancy capably captained by Amr Mousa, emphasizing systemic, professional agency delivery methods.
- **How does the system handle missing/untranslated content?** The page falls back gracefully to localized standard items with structured i18n guards.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render a single, unified `/about/` page layout containing two distinct but harmonized narratives: the corporate consultancy entity (Mousa Analytics) and the founder's credentials (Amr Mousa).
- **FR-002**: The founder's profile section MUST accurately reflect Amr Mousa's real biography, certificates, and professional history as defined in the existing `/about/` page, including NTI, DEPI, So Care, Oxygen Gym, and Iris Communications.
- **FR-003**: The company section MUST explicitly define Mousa Analytics as a specialized agency model focused on transforming complex raw data into actionable profitability decisions and dashboards (Data to Real Profit), presenting a scalable team structure capable of handling comprehensive corporate intelligence workflows.
- **FR-004**: The page MUST support fully localized contents for both Arabic (`/ar/about/`) and English (`/en/about/`).
- **FR-005**: The contact actions inside the about page MUST link directly to the high-performance contact modal sheet in `Navigation.astro`.

### Key Entities

- **Consultancy Profile**: Represents the business entity (Mousa Analytics), including core values, unique methodologies, and client focus.
- **Founder Profile**: Represents the individual expert (Amr Mousa), including experience timeline, technical skill stack (SQL, Python, Power BI, Excel), and certifications.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Page provides a zero-friction narrative flow with 100% of readers understanding both the corporate reliability (Mousa Analytics) and the high personal expertise (Amr Mousa) on a single scroll.
- **SC-002**: Page load time under 1 second on mobile devices.
- **SC-003**: Accessibility compliance with AAA standards for contrast and font sizes.

## Assumptions

- Amr Mousa remains the sole lead analyst and director of Mousa Analytics, ensuring a perfect personal-corporate alignment.
- Existing background assets and luxury design system styling are maintained.
