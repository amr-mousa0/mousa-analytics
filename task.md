## Design Context

### Users
- **Primary**: Business owners, ecommerce operators, and marketing directors looking to scale ad spend and optimize data tracking.
- **Context**: They are looking for a reliable, calculated system (combining Analytics + Media Buying) to plug conversion leaks and scale sales. They expect proof of process and calculated business outcomes (+182% sales).

### Brand Personality
- **The Growth Machine**: Productized, systematic, and process-focused. It sells a calculated result ("the engine") rather than personal details.
- **Data-Driven Precision**: Technical but clean, using clear metrics and flow diagrams to establish authority.

### Aesthetic Direction
- **Theme**: Deep Teal & Ice Blue (Platinum) Luxury Corporate Theme.
- **Color Strategy**:
  - Background: Premium Warm Alabaster/Cream (`oklch(98.5% 0.005 75)`)
  - Accent Primary: Deep Ocean Teal (`oklch(45% 0.09 200)`)
  - Accent Secondary: Ice Blue/Platinum (`oklch(80% 0.05 200)`)
  - Text: Deep Charcoal Slate (`#0f172a`)
- **Typography**:
  - Headings: Cormorant Garamond (luxury serif font)
  - Body: Outfit (clean modern sans-serif)
- **Visuals**: Simple, neat data flow diagrams or system architecture diagrams instead of personal portraits, showing the exact process of combining data tracking with acquisition.

### Design Principles
1. **Process-First Positioning**: Lead with the "machine" (process) and calculated outcomes (+182% sales increase) in simple, concise, and direct words.
2. **System Infrastructure Visuals**: Use clean architectural diagrams representing the data-driven marketing system rather than biographical personal images.
3. **Calculated CTAs**: Focus conversion pathways on "Deploy the Engine" or "Audit my System" to directly engage B2B prospects.
4. **Instant Mobile Loading**: Keep mobile viewports fast, clean, and layout-shift free (CLS = 0) with optimized image weights and deferred rendering.

---

## Tasks

- [x] Update theme variables in `global.css`
- [x] T003 Overhaul Hero section backplate gradient, cool grid background, and buttons in `src/components/sections/Hero.astro`
- [x] T004 Adjust About section highlight colors in `src/components/sections/About.astro`
- [x] T005 Adjust Services section icons and highlight colors in `src/components/sections/Services.astro`
- [x] T006 Style Contact form inputs and submit button with Cerulean blue details in `src/components/sections/Contact.astro`
- [x] T007 Build and run E2E integration tests to verify completion (status badge, grid tint, background overlay)
- [x] Execute Hero Section copy clarification (adjust button texts and hover borders)
- [x] Add accessible focus styles to Hero dark half
- [x] Run verification checks and production builds (E2E and build compiles)
- [x] Fix hidden WhatsApp CTA button on proposal page (implement adblock-resilient generic button and dynamic redirect script)
- [x] Move Back button into navigation header bar (update Navigation.astro and data-analytics.astro layout)
- [x] Push trust cards (service guarantees) below the first fold in Hero.astro on all devices to ensure scrolling is required to see them
