# Feature Specification: Rebrand Hero to Systems Approach

**Feature Branch**: `004-rebrand-systems-approach`

**Created**: 2026-05-24

**Status**: Draft

**Input**: User description: "change the hero section to designs with The Systems Approach which means إزاي بيبيع؟ بيبيع "الآلة والنتيجة المحسوبة". العميل هنا مش بيشتري "عمرو"، العميل بيشتري "السيستم اللي هيزود مبيعاته 182%". البيع هنا بيعتمد على إثبات إنك بتمتلك عملية (Process) واضحة ومجربة (زي دمج الـ Data مع الـ Media Buying). so insted of identfying myself i will identfy the product or service i offer and to be in a fucking very simple words and shortcut up to the point and neit also its very important to have an image as the landing page or brand i guess and the brand name and logo search for the best approch for this"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Presenting the Growth System Value Proposition (Priority: P1)

As a business owner or marketing director visiting the landing page, I want to immediately see a bold, calculated value proposition focused on a growth engine (promising a 182% sales increase) rather than a personal portfolio introduction, so that I understand the business outcome I can buy.

**Why this priority**: Focuses the user's attention immediately on the commercial result and the "machine" being sold. This is the core MVP of the rebrand.

**Independent Test**: Visually verify that the Hero headline and subheadings lead with the growth metric and the system engine process, rather than the name "Amr Mousa" or biographical details.

**Acceptance Scenarios**:

1. **Given** a user loads the website homepage on mobile or desktop, **When** they view the Hero section, **Then** the primary copy highlights "The Growth Engine / System" and the calculated metric (+182% sales increase).
2. **Given** the user is viewing the page in English or Arabic, **When** the page renders, **Then** the copy must be short, punchy, and direct to the point, avoiding conversational filler or fluff.

---

### User Story 2 - Illustrating the Integrated Analytics & Acquisition Process (Priority: P2)

As a high-intent B2B prospect, I want to see a clear visual representation (image/graphic) of the process (merging data analytics with media buying) on the landing page, so that I can visualize the "machine" and trust its systematic rigor.

**Why this priority**: Proves the existence of a structured, repeatable methodology, building trust in the calculated result.

**Independent Test**: Verify that a high-quality illustration/image representing the data-driven acquisition engine is rendered within the Hero section.

**Acceptance Scenarios**:

1. **Given** the home page is loaded, **When** the user looks at the Hero section layout, **Then** they see a premium, optimized visual graphic showing the intersection of data pipelines and acquisition media buying.
2. **Given** the mobile bottom navigation bar or top header is visible, **When** the screen size changes, **Then** the layout of this visual graphic adapts cleanly to avoid layout shifts.

---

### User Story 3 - High-Ticket Direct Call-To-Action (Priority: P3)

As a qualified prospect ready to optimize their pipeline, I want direct conversion buttons that allow me to audit the system or explore the methodology immediately, so that I can take action without digging through biographical text.

**Why this priority**: Converts attention into direct leads based on the systems approach.

**Independent Test**: Click the primary and secondary CTAs in the Hero section and verify they scroll/navigate directly to the contact audit form and the methodology section.

**Acceptance Scenarios**:

1. **Given** a user is viewing the Hero, **When** they click "Explore the System / Get Growth Audit" (or Arabic equivalent), **Then** it instantly navigates/scrolls them to the target sections without broken anchors.

---

### Edge Cases

- **Language alignment**: How does the calculated result copy flow in Arabic (RTL) vs English (LTR)? The layout must support logical alignment, ensuring the +182% metric and the process flow read naturally in both languages.
- **Image loading performance**: How does the visual graphic handle page load times? Since it is the prominent above-the-fold image, it must use Astro's optimized image engine (`sharp`) to prevent Cumulative Layout Shift (CLS) and ensure rapid Largest Contentful Paint (LCP).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hero Headline MUST state the primary outcome (Calculated 182% Sales Increase) using high-impact, short, and concise words.
- **FR-002**: Hero Subheading MUST define the "machine" process: the integration of Data Analytics/Pipelines and Performance Media Buying.
- **FR-003**: Hero section MUST include a premium visual graphic representing this data acquisition system (the "machine").
- **FR-004**: Hero section MUST exclude biographical personal descriptions of "Amr Mousa" (e.g. "I am Amr Mousa, Data Analyst...") in favor of product/service outcomes.
- **FR-005**: All CTAs MUST align with high-ticket B2B audits (e.g., "Deploy the Engine" or "Request Growth Audit").

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Page load metrics maintain a Google Lighthouse performance score >= 90 and CLS = 0 by pre-allocating the visual graphic container size and using optimized web image outputs.
- **SC-002**: Average reading time of the Hero section is under 5 seconds due to concise, simplified, and direct copywriting.
- **SC-003**: 100% of links/CTAs correctly route users to target anchors (Contact form or Methodology).

## Assumptions

- **A-001**: The brand palette (Deep Teal, Ice Blue, Platinum) remains unchanged.
- **A-002**: The logo and branding name will remain **Mousa Analytics / موسى للتحليلات** as recently approved.
- **A-003**: We will generate or choose a premium system diagram/graphic asset to represent the data-driven marketing machine.
