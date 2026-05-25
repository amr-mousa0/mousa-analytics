# Research: Decap CMS Integration in Astro

## 1. Technical Decision

We will integrate **Decap CMS** (formerly Netlify CMS) into the Astro-based static portfolio project. 
The integration will feature:
- An admin gateway route at `public/admin/index.html` loading Decap CMS via CDN.
- A YAML configuration file at `public/admin/config.yml` managing content structures.
- Local filesystem editing using the Decap CMS Local Backend (`local_backend: true` and the `decap-cms-proxy-server`).
- Refactoring the projects from static `.astro` pages in `src/pages/[lang]/projects/` into a new Astro Content Collection (`src/content/projects/`) to allow full CRUD capability (add, edit, delete) from the CMS.
- Production hosting authentication utilizing Netlify Identity / Git Gateway (or GitHub OAuth).

---

## 2. Rationale

- **Git-Based and Serverless**: Decap CMS does not require an active database, backend server, or API layer. It edits Markdown files and pushes changes directly to the Git repository.
- **Astro Alignment**: Since the website is already built with Astro Content Collections (e.g. for `services`, `hero`, etc.), a Git-based CMS aligns perfectly.
- **Local Backend Support**: Developers can run `npx decap-cms-proxy-server` locally to run the CMS, modify files, and upload images locally without needing production deployment.
- **Unified Project Directory**: All content collections stay in the same repository under `src/content/`, maintaining the single-project Astro design constraint.

---

## 3. Alternatives Considered

### Alternative A: Headless CMS (Strapi, Sanity, or Contentful)
- **Why rejected**: Introduces external API dependencies, requires database hosting (or paid plans), violates the Astro-Native / offline-capable principles, and requires complex client-side fetching or build-time API integration.

### Alternative B: Keeping projects hardcoded in Astro files
- **Why rejected**: Decap CMS cannot parse or modify complex Astro JSX structure in pages safely. To allow the user to add, edit, or delete projects dynamically, projects must be represented as structured content files (Markdown).
