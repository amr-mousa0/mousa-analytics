# Developer Reference: Analytics Event Registry & Governance

This document serves as the single source of truth mapping all custom telemetry events, parameters, and environment routing configurations for the portfolio.

---

## 1. Analytics Event Registry

| Event Name | Target Element / Trigger | Description | Required Parameters | KPI / Business Value | GA4 Mapping |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `project_view` | Project Details Page Load | Fired when a user views a specific project page | `slug` (string), `title` (string), `category` (string) | Measures interest in specific case studies / niches | `select_content` |
| `service_view` | Service Details Page Load | Fired when a user views a specific service page | `slug` (string), `title` (string), `category` (string) | Measures interest in specific technical service offerings | `view_item` |
| `language_switch` | Language Switcher button | Fired when a user switches between English and Arabic layouts | `source_lang` ("en" \| "ar"), `target_lang` ("en" \| "ar") | Analyzes multilingual audience engagement patterns | `language_switch` (custom) |
| `cta_click` | WhatsApp CTA Buttons | Fired when a user initiates a contact/inquiry chat via WhatsApp | `cta_text` (string), `cta_type` ("whatsapp"), `context_slug` (string, optional) | Primary B2B conversion intent lead metric | `generate_lead` |
| `contact_form_submit` | Contact Section Form Submit | Fired upon successful validation and submission of the Contact form | `form_id` ("contact_form") | Hard B2B inquiry conversion lead metric | `generate_lead` |

### Auto-Enriched Metadata
All events triggered via the central `trackEvent()` utility automatically append:
- `language`: Current UI language (`en` \| `ar`).
- `page_path`: Current route pathname.
- `analytics_env`: Deployment environment (`development` \| `staging` \| `production`).
- `timestamp`: UTC ISO time string.

---

## 2. Tracking Exclusions

To keep telemetry data clean and focus strictly on conversion metrics, the following interactions are **explicitly excluded** from custom event tracking:
- **Internal Navigation Clicks**: Header menu links to `#about`, `#projects`, `#services` or footer menu links. (GA4 Enhanced Measurement default pageview captures route transitions).
- **Internal Scroll Buttons**: Hero buttons "Discuss Your Strategy" (scrolling to `#contact`) or "Explore Services" (scrolling to `#services`).
- **Local UI Interaction**: Carousel navigation arrows (Projects carousel) or detail page tab switching ("Gallery" vs "Dashboard" tabs).
- **Outbound Social / Profile Icons**: External social media icons (LinkedIn, GitHub) in the Hero or Footer, unless GA4's default Enhanced Measurement captures them automatically as generic outbound link clicks.
- **Detail Navigation Cards**: Cards in the home page projects carousel that take users to case study subpages. (The subpage load itself triggers `project_view`).

---

## 3. Environment Isolation & Variable Routing

We use a single GTM container configured with a dynamic variable-based router:
- GTM reads the `analytics_env` parameter.
- **Lookup Table mapping:**
  - `production` -> Route to Production GA4 Property ID (`G-XXXXXX`)
  - `staging` -> Route to a separate Staging/Sandbox GA4 Property ID (`G-YYYYYY`)
  - `development` -> Tag triggers disabled (console logging via wrapper only)

---

## 4. Maintenance Workflow for Solo Developers

1. **Schema Update**: If adding an event, declare it inside the `TrackedEventPayload` discriminated union in `src/scripts/analytics.ts` and write descriptive JSDoc comments.
2. **Registry Sync**: Add the new event details to the table in Section 1 of this document.
3. **GTM Tag Setup**: Create a matching trigger in GTM (using the event name) and hook it to a GA4 tag routed via the Environment Lookup table.
