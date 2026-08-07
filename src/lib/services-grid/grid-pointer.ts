import { gsap } from 'gsap';
import { MOTION } from './grid-tokens';
import { GRID_SELECTORS, CSS_VARS } from './grid-constants';
import { entryVector } from './grid-direction';
import type { EntryDirection } from './grid-direction';

export type EntryCallback = (card: HTMLElement, entryDir: EntryDirection) => void;
export type Disposer = () => void;

interface CardPointerQuickTo {
  cardX: ReturnType<typeof gsap.quickTo>;
  cardY: ReturnType<typeof gsap.quickTo>;
  glowX: ReturnType<typeof gsap.quickTo>;
  glowY: ReturnType<typeof gsap.quickTo>;
}

export function attachPointer(root: HTMLElement, onEntry: EntryCallback): Disposer {
  const cards = Array.from(root.querySelectorAll<HTMLElement>(GRID_SELECTORS.CARD_SELECTOR));
  const quickToMap = new Map<HTMLElement, CardPointerQuickTo>();
  const cleanups: Array<() => void> = [];

  cards.forEach((card) => {
    const cardX = gsap.quickTo(card, CSS_VARS.CARD_X, {
      duration: MOTION.POINTER_LERP,
      ease: 'power3.out',
    });
    const cardY = gsap.quickTo(card, CSS_VARS.CARD_Y, {
      duration: MOTION.POINTER_LERP,
      ease: 'power3.out',
    });
    const glowX = gsap.quickTo(card, CSS_VARS.GLOW_X, {
      duration: MOTION.POINTER_LERP,
      ease: 'power3.out',
    });
    const glowY = gsap.quickTo(card, CSS_VARS.GLOW_Y, {
      duration: MOTION.POINTER_LERP,
      ease: 'power3.out',
    });

    quickToMap.set(card, { cardX, cardY, glowX, glowY });

    let rafId: number | null = null;
    let pendingEvent: PointerEvent | null = null;

    const handlePointerEnter = (e: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const dir = entryVector(e.clientX, centerX);
      onEntry(card, dir);
    };

    const handlePointerMove = (e: PointerEvent) => {
      pendingEvent = e;
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        if (pendingEvent) {
          const rect = card.getBoundingClientRect();
          const relX = pendingEvent.clientX - rect.left;
          const relY = pendingEvent.clientY - rect.top;

          const quickTo = quickToMap.get(card);
          if (quickTo) {
            quickTo.cardX(relX);
            quickTo.cardY(relY);
            quickTo.glowX(relX);
            quickTo.glowY(relY);
          }
        }
        rafId = null;
        pendingEvent = null;
      });
    };

    const handlePointerLeave = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      pendingEvent = null;
    };

    card.addEventListener('pointerenter', handlePointerEnter, { passive: true });
    card.addEventListener('pointermove', handlePointerMove, { passive: true });
    card.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    cleanups.push(() => {
      card.removeEventListener('pointerenter', handlePointerEnter);
      card.removeEventListener('pointermove', handlePointerMove);
      card.removeEventListener('pointerleave', handlePointerLeave);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    });
  });

  return () => {
    cleanups.forEach((fn) => fn());
    quickToMap.clear();
  };
}
