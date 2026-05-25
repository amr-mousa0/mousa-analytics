# Data Model: Minimalist Systems Hero Layout

This document defines the schema structures and data flows for the Systems Hero redesign.

## Content Collections Schema

The Hero content collection uses Astro's type-safe schema validator (`zod`).

### `Hero` Schema

Located in `src/content/config.ts`, the `hero` schema defines the localized copy elements:

| Field | Type | Description |
|---|---|---|
| `eyebrow` | `string` | Top subtitle defining the system category. |
| `bio` | `string` | High-impact paragraph explaining data tracking and media buying integration. |
| `primaryBtn` | `string` | Label for the audit form submit button. |
| `secondaryBtn` | `string` | Label for the secondary process link. |
| `floatingBadge` | `string` | Optional tag overlay label. |
| `statLeftTitle` | `string` | Title of the left stats card. |
| `statLeftVal` | `string` | Numeric or percentage value for the left stats card. |
| `statRightTitle` | `string` | Title of the right stats card. |
| `statRightVal` | `string` | Value for the right stats card. |

Validation Rules:
- All fields are required to support English and Arabic translations.

---

## Form Intake Entity

### `AuditFormSubmission`

Represents the data captured when a user inputs their domain to request a growth audit:

- **Fields**:
  - `storeUrl` (String): The validated URL of the user's store.
- **Validation**:
  - Must not be empty.
  - Must be a valid domain or URL format.
  - Automatically appends `https://` if no protocol is present.
- **Data Flow**:
  - Client side: The URL is stored in the browser state and pre-populated into the `#form-message` textarea of the contact form.
  - Transition: The viewport is smoothly scrolled to the `#contact` element.
