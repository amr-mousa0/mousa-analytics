# Feature Specification: Decap CMS Integration

**Feature Branch**: `006-decap-cms-integration`

**Created**: 2026-05-25

**Status**: Draft

**Input**: User description: "Decap CMS و لو هعملها للمشروع اعملها ب اي و ازاي و احسنطريقه و الباس الصح لكل حاجه عاوز اقدر اضيف و اعدل و امسح عادي للمشاريع و الخدمات و الصور معانا ابحث"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Services Content (Priority: P1)

As a content manager, I want to create, read, update, and delete service items in both English and Arabic through an intuitive web-based interface, so that I can keep my service offerings up-to-date without writing code.

**Why this priority**: Services are a core business offering on the portfolio site and need to be easily editable.

**Independent Test**: Can be tested by visiting the CMS admin page locally or in staging, creating a new service in both English and Arabic, modifying its content, and verifying that the changes are rendered correctly on the live page and persisted as Markdown files in the repository.

**Acceptance Scenarios**:

1. **Given** the user is authenticated on the CMS dashboard, **When** they click "New Service", fill in the title, description, icon name, priority, and select English, **Then** a new Markdown file is created in the English services content collection.
2. **Given** an existing service, **When** the user edits its fields and clicks "Save", **Then** the corresponding Markdown file is updated with the new values.
3. **Given** an existing service, **When** they click "Delete", **Then** the corresponding Markdown file is deleted from the repository.

---

### User Story 2 - Upload and Manage Media Assets (Priority: P1)

As a content manager, I want to upload new images and select existing ones from a media library when creating or editing projects and services, so that I can enrich the visual quality of the portfolio.

**Why this priority**: Rich media and visuals are critical to the portfolio's aesthetics and credibility.

**Independent Test**: Test by uploading a new image through the CMS editor, saving it, and verifying that the image file is stored in the correct directory in the repository and correctly referenced by the collection items.

**Acceptance Scenarios**:

1. **Given** the editor interface for a project or service, **When** the user clicks "Upload Image", selects an image from their local machine, and saves, **Then** the image is uploaded to the designated asset directory and its path is referenced in the markdown frontmatter.
2. **Given** the media library modal, **When** the user selects an existing image, **Then** it is inserted into the field and referenced correctly.

---

### User Story 3 - Manage Projects Content dynamically (Priority: P2)

As a content manager, I want to add, edit, and delete project case studies dynamically using the CMS, so that I can display my latest work without creating new Astro page files manually.

**Why this priority**: Portfolio projects showcase actual capability. Managing them dynamically reduces code maintenance and allows quick updates.

**Independent Test**: Test by migrating existing hardcoded project Astro pages to a dynamic content collection, creating a new project in the CMS, and verifying that a dynamic route (e.g. `/projects/new-project`) is automatically generated and displays the correct content.

**Acceptance Scenarios**:

1. **Given** the user clicks "New Project", **When** they fill in the project title, description, client, date, tags, and content, **Then** a markdown file is created under the projects content collection, and the system renders it via a dynamic route.

---

### User Story 4 - Secure Authentication and Editing (Priority: P2)

As a site owner, I want to ensure that only authorized users can access the CMS admin panel in production, while allowing frictionless passwordless local development.

**Why this priority**: Security prevents unauthorized changes to the portfolio, while local access is essential for developers to test configurations.

**Independent Test**: Verify that accessing `/admin/` in production redirects to an identity provider login page, while in local development, it loads the editor directly using a local proxy server.

**Acceptance Scenarios**:

1. **Given** the site is deployed in production, **When** a user visits `/admin/`, **Then** they are prompted to log in using secure credentials.
2. **Given** local development mode is active, **When** the developer launches the CMS locally, **Then** it connects to the local Git repository file system without requiring external internet authentication.

---

### User Story 5 - Editorial Workflow & Collaboration (Priority: P2)

As a site editor, I want to save updates as drafts, request team reviews, and preview changes on temporary staging deployments before publishing live, to prevent breaking production content.

**Why this priority**: The editorial workflow separates draft reviews from production and coordinates multi-editor releases.

**Independent Test**: Verify that saving a change in the CMS creates a pull request on GitHub (e.g., `cms/projects/...`) instead of pushing directly to main, and that a preview deployment is launched for the PR branch.

**Acceptance Scenarios**:

1. **Given** editorial workflow is active, **When** the editor clicks "Save", **Then** a pull request is created, and the item's status is set to "Draft/Ready for Review".
2. **Given** a draft PR is approved, **When** the admin clicks "Publish" in the CMS, **Then** the PR is merged into main and the production build is triggered.

---

### Edge Cases & Production Policy

- **Translation Fallback Behavior (UX)**: If a project or service is missing its translation in one locale, the language switcher remains visible. When clicked, it renders the page in the selected locale using the default fallback locale content (e.g. showing English text under the Arabic layout) accompanied by a prominent localized banner ("This content is not yet translated, showing default version").
- **Draft Access Control**:
  - In production builds (`import.meta.env.PROD === true`), static pages for draft entries MUST NOT be generated or accessible via URL.
  - In local development (`DEV`) and preview deploy environments (staging/review builds), draft pages MUST be built to allow editors to preview changes using CMS review links.
- **Large Media Uploads**: Enforce strict size validation (<5MB) and normalizations to avoid route conflicts.
- **Git Concurrent Edit Conflicts**: Handle merge conflicts gracefully when both local and remote changes happen simultaneously on CMS-managed files.
- **Migration Backup and Rollback Strategy**: Before removing any hardcoded Astro project pages, a complete backup copy must be stored in a `.backup/` directory. If the Markdown collection migration fails at build time, a automated rollback script will restore the backup files to restore build health.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The CMS admin interface MUST be accessible at `/admin/`.
- **FR-002**: The CMS MUST support CRUD operations for the `services` collection located at `src/content/services/`.
- **FR-003**: The CMS MUST support CRUD operations for the `projects` collection located at `src/content/projects/`.
- **FR-004**: The CMS configuration MUST map multilingual files correctly (English under `en/` subdirectories and Arabic under `ar/` subdirectories).
- **FR-005**: The CMS MUST store uploaded media assets in a dedicated asset directory compatible with Astro Image optimization (`src/assets/images/uploads/`).
- **FR-006**: The CMS MUST support a `local_backend` mode to write directly to the local filesystem during development.
- **FR-007**: The CMS MUST integrate with Netlify Identity for production authentication.
- **FR-008**: The CMS configuration MUST enforce unique slugs and a translation linking system (`translationKey` or identical file-name slug mapping) to support the language switcher between `/en/` and `/ar/` versions.
- **FR-009**: The collections MUST support content states (e.g., `draft` boolean, `featured` boolean, `publishedDate` date).
- **FR-010**: The collections MUST support full SEO fields (e.g., `metaTitle`, `metaDescription`, `ogImage`, `canonicalUrl`).
- **FR-011**: The CMS dashboard MUST render live preview templates for services and projects using an iframe-based preview rendering mechanism.
- **FR-012**: The slug strategy MUST be explicit, using the CMS `slug` widget set to `readonly` after creation to prevent editors from breaking URLs.
- **FR-013**: The SEO layer MUST inject dynamic JSON-LD structured schema markup (schema.org markup) into service and project pages, and ensure sitemap (`sitemap-index.xml`) and canonical URL consistency across translations.
- **FR-014**: Image optimization MUST be automated at build-time via Astro's native Sharp image pipeline, converting inputs to WebP format, and applying lazy loading on gallery layouts.
- **FR-015**: The CMS MUST support a scalable taxonomy system containing reusable categories and tags for filtering services, projects, and future collections.
- **FR-016**: The CMS MUST support `editorial_workflow` mode, tracking draft and review states in production.
- **FR-017**: The project lists MUST utilize a deterministic ordering strategy: Featured items first (sorted by `priority` ascending, then by `publishedDate` descending), followed by regular items (sorted by `priority` ascending, then by `publishedDate` descending).
- **FR-018**: The CMS configuration schema MUST maintain DRY structure principles by using YAML anchors (`&`) and aliases (`*`) to share identical schemas like SEO blocks between collections.

### Key Entities *(include if feature involves data)*

- **Service**: Represents an offered service (e.g., Data Analytics).
  - Attributes: Title (string), Description (string), Icon Name (string), Priority (integer), Features (array of strings), draft (boolean), featured (boolean), publishedDate (date), translationKey (string), SEO fields (object).
- **Project**: Represents a portfolio case study.
  - Attributes: Title (string), ProjectBadge (string), Client Name (string), Date (string), Tags (array of strings), Cover Image (image path), Project URL (string), draft (boolean), featured (boolean), publishedDate (date), translationKey (string), SEO fields (object).
- **Media Asset**: Represents an uploaded image file.
  - Attributes: File path (string), File size (integer).
- **Taxonomy (Category/Tag)**: Reusable categories/tags.
  - Attributes: Slug (string), Display Name (string).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Modifying or creating a service or project via the CMS dashboard takes less than 3 minutes for a non-technical user.
- **SC-002**: Saved changes in the CMS trigger a production deployment that completes and goes live in under 5 minutes.
- **SC-003**: Accessing the `/admin/` path in production enforces authentication for all users, with zero unauthorized access.
- **SC-004**: Dynamic project page loading time is under 1.5 seconds, maintaining a Lighthouse Performance score of >= 90.
