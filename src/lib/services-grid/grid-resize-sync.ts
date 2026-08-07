import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { MOTION } from './grid-tokens';
import { GRID_SELECTORS } from './grid-constants';

gsap.registerPlugin(Flip);

export function attachResizeObserver(gridRoot: HTMLElement): () => void {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0;

  const triggerFlipSync = () => {
    const cards = Array.from(gridRoot.querySelectorAll<HTMLElement>(GRID_SELECTORS.CARD_SELECTOR));
    if (!cards.length) return;

    requestAnimationFrame(() => {
      const state = Flip.getState(cards);
      Flip.from(state, {
        duration: MOTION.DURATION_MEDIUM,
        ease: MOTION.EASE_STANDARD,
        scale: false,
        absolute: false,
        onComplete: () => {
          // Clear any inline positional properties so native CSS grid remains intact
          gsap.set(cards, { clearProps: 'position,top,left,width,height' });
        },
      });
    });
  };

  const handleResize = () => {
    if (typeof window === 'undefined') return;
    const currentWidth = window.innerWidth;
    // Only trigger if window width actually changed (ignore vertical scrollbar / height shifts)
    if (currentWidth === lastWidth) return;
    lastWidth = currentWidth;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      triggerFlipSync();
    }, 150);
  };

  window.addEventListener('resize', handleResize, { passive: true });

  return () => {
    window.removeEventListener('resize', handleResize);
    if (debounceTimer) clearTimeout(debounceTimer);
  };
}
