# Interface Contract: Discriminated Union Payloads & GA4 Mappings

This contract defines the structured mapping between the discriminated union TypeScript payloads and the final GA4 parameters.

---

## 1. Discriminated Union Schema & Parameter Rules

To enforce strict mapping, GTM and the GA4 configuration will parse events based on the `event` key.

| Event Type Name | Discriminated Event Key | Required Parameters | Optional Parameters | GA4 Event Name |
|-----------------|-------------------------|---------------------|---------------------|----------------|
| `ProjectViewEvent` | `project_view` | `slug`, `title`, `category`, `language`, `page_path` | None | `select_content` |
| `ServiceViewEvent` | `service_view` | `slug`, `title`, `category`, `language`, `page_path` | None | `view_item` |
| `LanguageSwitchEvent` | `language_switch` | `source_lang`, `target_lang`, `language`, `page_path` | None | `language_switch` |
| `CTAInteractionEvent` | `cta_click` | `cta_text`, `cta_type`, `language`, `page_path` | `context_slug` | `generate_lead` |
| `ContactFormSubmitEvent`| `contact_form_submit`| `form_id`, `language`, `page_path` | None | `generate_lead` |

---

## 2. Parameter Definitions & Mappings

The following variables must be configured in GTM as User-Defined Variables (Data Layer Variable type) and mapped as Custom Dimensions in GA4:

### Custom Dimensions:
1. **`language`** -> `DLV - Page Language` (Scope: Event): The locale under which the interaction occurred (`en` | `ar`).
2. **`slug`** -> `DLV - Content Slug` (Scope: Event): Alphanumeric identifier of the project/service/blog.
3. **`category`** -> `DLV - Content Category` (Scope: Event): The content grouping (e.g. `Systems Automation`).
4. **`cta_type`** -> `DLV - CTA Type` (Scope: Event): The type of communication channel (`whatsapp` | `email` | `call` | `form`).
5. **`analytics_env`** -> `DLV - Analytics Env` (Scope: Event): Active deployment environment (`development` | `staging` | `production`).

---

## 3. Session Engagement KPIs

GA4 custom reports will define "High Engagement Sessions" as visits triggering:
- `contact_form_submit`
- `cta_click`
- A session duration exceeding 2 minutes with at least one `project_view` event.
