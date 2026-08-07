import { gsap } from 'gsap';
import { MOTION } from './grid-tokens';
import { GRID_SELECTORS, MEDIA_QUERIES } from './grid-constants';
import { entryVector } from './grid-direction';
import type { EntryDirection } from './grid-direction';
import { createCardTimeline } from './grid-timeline';
import { attachPointer } from './grid-pointer';
import type { Disposer } from './grid-pointer';

export type EngineState = 'IDLE' | 'HOVERED' | 'FOCUSED' | 'EXPANDED' | 'DISABLED';

export interface GridEngine {
  enabled: boolean;
  state: EngineState;
  attach: () => void;
  detach: () => void;
  collapse: () => void;
  on: (card: HTMLElement, event: string, handler: EventListener) => void;
}

declare global {
  interface Window {
    __servicesEngineActive?: boolean;
  }
}

export function createGridEngine(root: HTMLElement | null): GridEngine {
  const movesMedia = typeof window !== 'undefined' ? window.matchMedia(MEDIA_QUERIES.MOVES) : null;
  const staticMedia = typeof window !== 'undefined' ? window.matchMedia(MEDIA_QUERIES.STATIC) : null;

  const isEnabled = Boolean(
    movesMedia?.matches && !staticMedia?.matches && root
  );

  if (typeof window !== 'undefined') {
    window.__servicesEngineActive = isEnabled;
  }

  let currentState: EngineState = isEnabled ? 'IDLE' : 'DISABLED';
  const listeners: Array<{ target: HTMLElement; event: string; handler: EventListener }> = [];

  const timelinesMap = new Map<HTMLElement, gsap.core.Timeline>();
  let activeCard: HTMLElement | null = null;
  let pointerDisposer: Disposer | null = null;

  function getSiblings(card: HTMLElement): HTMLElement[] {
    if (!root) return [];
    const all = Array.from(root.querySelectorAll<HTMLElement>(GRID_SELECTORS.CARD_SELECTOR));
    return all.filter((c) => c !== card);
  }

  function dimNeighbors(active: HTMLElement) {
    const siblings = getSiblings(active);
    siblings.forEach((s) => {
      gsap.to(s, {
        opacity: MOTION.DIM_OPACITY,
        filter: `brightness(${MOTION.DIM_BRIGHTNESS}) saturate(${MOTION.DIM_SATURATE})`,
        duration: MOTION.DURATION_MEDIUM,
        ease: MOTION.EASE_STANDARD,
        overwrite: 'auto',
      });
    });
  }

  function undimNeighbors() {
    if (!root) return;
    const all = Array.from(root.querySelectorAll<HTMLElement>(GRID_SELECTORS.CARD_SELECTOR));
    all.forEach((s) => {
      gsap.to(s, {
        opacity: 1,
        filter: 'none',
        duration: MOTION.DURATION_MEDIUM,
        ease: MOTION.EASE_STANDARD,
        overwrite: 'auto',
      });
    });
  }

  function expandCard(card: HTMLElement, dir: EntryDirection, stateType: 'HOVERED' | 'FOCUSED') {
    if (!isEnabled) return;

    // Prevent re-triggering expansion if card is already expanding/expanded in the same state
    if (activeCard === card && currentState === stateType) {
      return;
    }

    if (activeCard && activeCard !== card) {
      collapseActiveCard();
    }

    activeCard = card;
    currentState = stateType;

    // Clean up any existing timeline for this card to ensure fresh entryVector transformOrigin
    const existingTl = timelinesMap.get(card);
    if (existingTl) {
      existingTl.kill();
      timelinesMap.delete(card);
    }

    const tl = createCardTimeline(card, dir);
    timelinesMap.set(card, tl);

    tl.play();
    dimNeighbors(card);
  }

  function collapseActiveCard() {
    if (!activeCard) return;

    const cardToCollapse = activeCard;
    const tl = timelinesMap.get(cardToCollapse);
    if (tl) {
      tl.reverse();
    }
    undimNeighbors();
    activeCard = null;
    if (isEnabled) {
      currentState = 'IDLE';
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && (currentState === 'FOCUSED' || currentState === 'EXPANDED')) {
      collapseActiveCard();
    }
  };

  return {
    get enabled() {
      return isEnabled;
    },
    get state() {
      return currentState;
    },
    set state(next: EngineState) {
      if (!isEnabled) {
        currentState = 'DISABLED';
        return;
      }
      currentState = next;
    },
    collapse() {
      collapseActiveCard();
    },
    attach() {
      if (!isEnabled || !root) return;

      const cards = Array.from(root.querySelectorAll<HTMLElement>(GRID_SELECTORS.CARD_SELECTOR));

      pointerDisposer = attachPointer(root, (card, dir) => {
        expandCard(card, dir, 'HOVERED');
      });

      cards.forEach((card) => {
        const mouseLeaveHandler = (e: MouseEvent) => {
          if (activeCard === card && currentState === 'HOVERED') {
            const related = e.relatedTarget as Node | null;
            if (!related || !card.contains(related)) {
              collapseActiveCard();
            }
          }
        };

        const cardLink = card.querySelector<HTMLElement>(GRID_SELECTORS.CARD_LINK);

        const focusInHandler = (e: FocusEvent) => {
          if (!cardLink) return;
          if (e.target === cardLink || cardLink.contains(e.target as Node)) {
            const rect = card.getBoundingClientRect();
            const dir = entryVector(rect.left + rect.width / 2, rect.left + rect.width / 2);
            expandCard(card, dir, 'FOCUSED');
          }
        };

        const focusOutHandler = (e: FocusEvent) => {
          if (activeCard === card && currentState === 'FOCUSED') {
            const related = e.relatedTarget as Node | null;
            if (!related || !card.contains(related)) {
              collapseActiveCard();
            }
          }
        };

        card.addEventListener('mouseleave', mouseLeaveHandler as EventListener);
        if (cardLink) {
          cardLink.addEventListener('focusin', focusInHandler as EventListener);
          cardLink.addEventListener('focusout', focusOutHandler as EventListener);
          listeners.push(
            { target: cardLink, event: 'focusin', handler: focusInHandler as EventListener },
            { target: cardLink, event: 'focusout', handler: focusOutHandler as EventListener }
          );
        }

        listeners.push({ target: card, event: 'mouseleave', handler: mouseLeaveHandler as EventListener });
      });

      window.addEventListener('keydown', handleKeyDown);
    },
    detach() {
      if (pointerDisposer) {
        pointerDisposer();
        pointerDisposer = null;
      }

      listeners.forEach(({ target, event, handler }) => {
        target.removeEventListener(event, handler);
      });
      listeners.length = 0;

      window.removeEventListener('keydown', handleKeyDown);

      timelinesMap.forEach((tl) => tl.kill());
      timelinesMap.clear();

      undimNeighbors();
      activeCard = null;

      if (isEnabled) {
        currentState = 'IDLE';
      }
    },
    on(card: HTMLElement, event: string, handler: EventListener) {
      if (!isEnabled) return;
      card.addEventListener(event, handler);
      listeners.push({ target: card, event, handler });
    },
  };
}
