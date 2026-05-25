# Research & Design Choices: Minimalist Systems Hero Layout

This document details the architectural and design decisions for rebranding and redesigning the Hero section into a centered, minimalist Systems presentation.

## Design Goals

1. **Center-Aligned Systems Layout**: Transition from a split-column (text left / portrait right) to a focused, single-column centered layout.
2. **System Background Visualization**: Use a single clean background graphic representing the growth engine/system instead of a personal portrait.
3. **Typography & Direct Copy**: Make the copywriting punchy, direct, and focused on the B2B outcome (182% sales growth via unified data tracking and media buying).
4. **Interactive Audit Form**: Maintain and polish the inline URL form for auditing a store's growth system, linking directly to the contact section.
5. **No Layout Shift (CLS = 0)**: Ensure the background image is pre-loaded and optimized with correct sizing.

## Decisions

### 1. Layout Structure
- **Decision**: Center-aligned single column.
- **Rationale**: The user wants a clean, minimalist design that avoids the cliché and "boring" text-left/face-right split layout. A centered, elegant alignment focuses attention directly on the product engine.
- **Alternatives Considered**: 
  - Split column with visual diagram on the right: Rejected to avoid splitting the screen and to align with the minimalist requirement.

### 2. Background Visual Asset
- **Decision**: Use an optimized, full-screen background image representing the growth system (e.g. `src/assets/images/growth-engine-bg.png`), overlayed with CSS radial gradients for high text contrast.
- **Rationale**: The user wants "only one clean image representing the system or organization in the background completely... not divided, not many elements". 
- **Alternatives Considered**:
  - Personal portrait of Amr Hazem: Rejected as the user explicitly requested no portrait/face on the right.
  - Interactive SVG canvas: Rejected to avoid high client-side CPU runtime, matching the Minimal Dependency (No GSAP) constitution rule.

### 3. Copy & Highlights
- **Decision**: Highlight key terms like "Scaled +182%" using Tailwind custom colors (`#2563EB`) and elegant font styles (`font-serif italic font-medium`). Keep the text simple and clean.
- **Rationale**: Direct, numbers-based copywriting converts higher for premium B2B prospects.

### 4. Interactive Domain Audit
- **Decision**: Keep the inline URL input form with a floating layout and browser-native validation, smooth-scrolling to pre-populate the contact form on submit.
- **Rationale**: Highly engaging CTA that provides direct utility.
