---
name: Amr Systems Portfolio
description: Enterprise-level conversion and data pipeline consultancy
colors:
  primary: "#2563EB"
  neutral-bg: "#F8F9FA"
  text-main: "#0A192F"
  card-bg: "#FFFFFF"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.1
  body:
    fontFamily: "Outfit, Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "4px"
  md: "8px"
  lg: "16px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text-main}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
---

# Design System: Amr Systems Portfolio

## 1. Overview

**Creative North Star: "Precision Data & Conversion Architecture"**

This system represents a high-end, elite consultancy design language. It is objective, result-oriented, and corporate. The aesthetic feels highly structured, reliable, and premium, utilizing an editorial Serif typeface for headings combined with a clean Sans-Serif for body copy. 

This design explicitly rejects generic, cartoonish SaaS landing-page styles, neon gradient overlays, or unnecessary global client-side frameworks. It emphasizes clean logical alignments, subtle structural indicators, and clear content hierarchy.

**Key Characteristics:**
- Strict corporate color harmony with heavy contrast.
- Editorial Serif typography for identity names and headers, with modern geometric Sans-Serif body copy.
- Flat container structure utilizing white floating cards overlaying clean backgrounds.

**The Simplicity Doctrine.** Design must focus entirely on clarity of idea and ease of use. Remove any visual clutter, redundant copying, or decorative slop.

## 2. Colors

A highly restrained and high-contrast professional color palette, structured to evoke executive trust and clean data flow.

### Primary
- **Consultancy Blue** (#2563EB): Used for key call-to-actions, category kickers, accents, and interactive highlights.

### Neutral
- **Alabaster Warm Light** (#F8F9FA): The primary page background, providing a clean, warm-tinted slate for reading.
- **Deep Navy Slate** (#0A192F): The primary text, header, and logo color, providing ultimate contrast and authority.
- **Card White** (#FFFFFF): The background for floating stat widgets and container cards to create subtle structural layering.

**The Restrained Accents Rule.** High-saturation blue is limited to call-to-action buttons, key status indicators, and category tags. No background fill is colored with primary blue except primary button styling.

**The Neutral Tinting Rule.** Never use pure black (#000000) or pure white (#ffffff). All backgrounds and borders must be tinted slightly toward the brand hue (with a chroma of 0.005–0.01) to feel premium and warm.

## 3. Typography

**Display Font:** Cormorant Garamond (or system fallback Georgia/serif)
**Body Font:** Outfit (or system fallback Inter/sans-serif)

**Character:** The typography marries an elegant, editorial Serif font (representing prestige and executive leadership) with a clean, high-legibility Sans-Serif (representing modern systems, data, and precision).

### Hierarchy
- **Display** (Bold, 3.5rem - 5.5rem, 1.1): Amr Mousa name and major header titles.
- **Headline** (Semi-bold, 1.5rem - 2.25rem, 1.3): The core hook and subheadings.
- **Body** (Regular, 1rem, 1.6): Paragraph text. Captions at 65-75ch maximum width.
- **Label** (Bold, 0.75rem, uppercase, 0.2em tracking): Eyebrow/overline kickers and navigation links.

**The Editorial Contrast Rule.** Paired Serif Cormorant Garamond headings and Outfit body copy ensure a luxury B2B consulting feel.

## 4. Elevation

The system is flat by default, utilizing high contrast and solid white containers to create separation. Structural layering is achieved using flat container borders (1px solid #0A192F with low opacity) and very soft, ambient shadows.

### Shadow Vocabulary
- **Ambient Card Glow** (`box-shadow: 0 4px 20px rgba(10, 25, 47, 0.05)`): Applied to floating cards overlapping main visuals.

**The No-Glow Rule.** Do not use radial gradients, glowing accents, background grids, or repeating watermarks for decoration. The default is a clean, solid warm-cream background.

## 5. Components

For each component, lead with a short character line, then specify shape, color assignment, states, and any distinctive behavior.

### Buttons
- **Shape:** Rounded Pill (9999px)
- **Primary:** Solid #2563EB background with bold white text. Padding is 14px 28px.
- **Secondary:** Transparent background with #0A192F border (1px solid) and text.

### Cards / Containers
- **Corner Style:** Medium curves (12px to 16px radius)
- **Background:** Solid Card White (#FFFFFF)
- **Shadow Strategy:** Very subtle ambient drop-shadow.

### Navigation
- **Style:** Flat header with small uppercase links, wide tracking, and clean text logo.

**The No-Slop Rule.** Never use pointer icons, arrows, cursors, or indicators as static decorations inside elements.

**The Clean CTA Rule.** Conversion buttons must be simple, rounded pills using primary brand tokens, without heavy wrapping cards or competing actions.

## 6. Do's and Don'ts

Concrete, forceful guardrails. Lead each with "Do" or "Don't".

### Do:
- **Do** maintain a strict contrast ratio between #0A192F text and #F8F9FA background.
- **Do** use the serif font exclusively for the name Amr Mousa and main sections headings.
- **Do** align components strictly to a grid layout.
- **Do** use whitespace as a primary layout element.

### Don't:
- **Don't** use multi-color gradient text or colorful backgrounds.
- **Don't** use border-left colors as accents on cards.
- **Don't** add GSAP or other animation libraries; rely on pure CSS transitions.
- **Don't** include cursor icons or pointers inside static layouts.
- **Don't** use hardcoded values like #ffffff or bg-white where design tokens like bg-hero-card are defined.
