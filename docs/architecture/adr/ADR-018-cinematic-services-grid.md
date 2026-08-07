# ADR-018: Cinematic Bento Grid for Services Section

## Status
Accepted

## Context
The Services section required a high-end, cinematic interactive experience on desktop without introducing layout shifts (CLS), reflowing neighbor text, or degrading the mobile swipe deck experience.

## Decision
1. **Transform-Only Expansion**: Hover expansion is executed strictly via CSS transforms (`scale`, `translate3d`) and opacity. Grid column tracks remain frozen to guarantee 0 layout shifts.
2. **Flip Plugin Scope**: GSAP `Flip` plugin is used exclusively for resize handling and late-geometry absorption, never for per-frame hover animations.
3. **`gsap-enhanced` CSS Handover**: An enhancement class (`gsap-enhanced`) is added to `<html>` on initialization to disable baseline CSS hover transitions while the GSAP engine manages orchestrations.
4. **Hover & Pointer Media Gating**: Active expansion is gated on `(hover: hover) and (pointer: fine)` and disabled when `(prefers-reduced-motion: reduce)` is active.
5. **Zero-CLS Contract**: Standardized image loading (`index 0` eager, others lazy) and decode checks prior to interactive binding prevent reflow false-fails.

## Consequences
- 60fps smooth animations on desktop with zero CLS.
- Full mobile swipe deck compatibility preserved without script overhead.
- Accessibility standards maintained (keyboard focus, Escape key collapse, reduced-motion compliance).
