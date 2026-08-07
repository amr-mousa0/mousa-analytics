import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOTION } from './grid-tokens';
import { GRID_SELECTORS, MEDIA_QUERIES } from './grid-constants';

gsap.registerPlugin(ScrollTrigger);

export type EntranceDisposer = () => void;

/**
 * Entrance reveal for the Services section: header (eyebrow → title → subtitle)
 * then the bento cards rise + fade in staggered, played once on first scroll into
 * view. Runs on ALL devices (unlike the hover engine) but is fully stripped under
 * `prefers-reduced-motion`. Transform/opacity only, so frozen grid tracks stay intact.
 *
 * Hidden state is applied immediately via `gsap.set` (no content flash, no CSS
 * dependency); no-JS and reduced-motion users see content instantly because the
 * set never runs for them.
 *
 * Returns a disposer; safe to call before ScrollTrigger ever fires.
 */
export function attachEntrance(root: HTMLElement): EntranceDisposer {
  if (typeof document === 'undefined') return () => {};

  const section = root.closest<HTMLElement>('section');
  if (!section) return () => {};
  if (window.matchMedia(MEDIA_QUERIES.STATIC).matches) return () => {};

  const ctx = gsap.context(() => {
    const headerItems = Array.from(section.querySelectorAll<HTMLElement>('[data-entrance]'));
    const cards = Array.from(root.querySelectorAll<HTMLElement>(GRID_SELECTORS.CARD_SELECTOR));
    const targets = [...headerItems, ...cards];
    if (targets.length === 0) return;

    // Hide immediately so the reveal starts from a clean slate (no content flash)
    gsap.set(targets, { y: MOTION.ENTRANCE_Y, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        once: true,
        toggleActions: 'play none none none',
      },
      defaults: { ease: MOTION.EASE_STANDARD },
    });

    if (headerItems.length > 0) {
      tl.to(headerItems, {
        y: 0,
        opacity: 1,
        duration: MOTION.ENTRANCE_DURATION_HEADER,
        stagger: MOTION.ENTRANCE_STAGGER_HEADER,
        ease: MOTION.EASE_STANDARD,
      }, 0);
    }

    if (cards.length > 0) {
      tl.to(cards, {
        y: 0,
        opacity: 1,
        duration: MOTION.ENTRANCE_DURATION_CARD,
        stagger: MOTION.ENTRANCE_STAGGER_CARD,
        ease: MOTION.EASE_EMPHASIZED,
        clearProps: 'transform,opacity',
      }, '>-0.1');
    }
  }, section);

  // Refresh once images/layout settle so the trigger start is accurate
  requestAnimationFrame(() => ScrollTrigger.refresh());

  return () => {
    ctx.revert();
  };
}