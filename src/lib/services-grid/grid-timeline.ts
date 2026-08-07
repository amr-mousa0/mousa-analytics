import { gsap } from 'gsap';
import { MOTION } from './grid-tokens';
import { GRID_SELECTORS, CSS_VARS } from './grid-constants';
import { mirror } from './grid-direction';
import type { EntryDirection } from './grid-direction';

export interface CardTimelineBundle {
  expandTimeline: gsap.core.Timeline;
  parallaxTimeline: gsap.core.Timeline;
}

export function createCardTimeline(
  card: HTMLElement,
  entryDir: EntryDirection = 0
): gsap.core.Timeline {
  const image = card.querySelector(GRID_SELECTORS.CARD_IMAGE) as HTMLElement | null;
  const title = card.querySelector(GRID_SELECTORS.CARD_TITLE) as HTMLElement | null;
  const desc = card.querySelector(GRID_SELECTORS.CARD_DESC) as HTMLElement | null;
  const overlay = card.querySelector(GRID_SELECTORS.CARD_OVERLAY) as HTMLElement | null;
  const actions = card.querySelector(GRID_SELECTORS.CARD_ACTIONS) as HTMLElement | null;

  const originX = entryDir === -1 ? 'left' : entryDir === 1 ? 'right' : 'center';
  const transformOrigin = `${originX} center`;

  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: MOTION.EASE_STANDARD },
    onStart: () => {
      card.style.willChange = 'transform, opacity';
      card.style.zIndex = String(MOTION.Z_RAISED);
    },
    onReverseComplete: () => {
      card.style.willChange = '';
      card.style.zIndex = String(MOTION.Z_BASE);
      gsap.set(card, { clearProps: 'transform' });
    },
  });

  const entryX = mirror(entryDir * 6);

  // 1. Scale card
  tl.to(
    card,
    {
      scale: MOTION.SCALE_CAP,
      [CSS_VARS.CARD_SCALE]: MOTION.SCALE_CAP,
      x: entryX,
      y: -8,
      transformOrigin,
      duration: MOTION.DURATION_SLOW,
      ease: MOTION.EASE_EMPHASIZED,
      overwrite: 'auto',
    },
    0
  );

  // 2. Parallax / subtle image scale & title float
  if (image) {
    tl.to(
      image,
      {
        scale: 1.08,
        rotate: 0.3,
        x: mirror(12),
        duration: MOTION.DURATION_SLOW,
        ease: MOTION.EASE_STANDARD,
      },
      MOTION.ENTRY
    );
  }

  if (title) {
    tl.to(
      title,
      {
        y: -4,
        duration: MOTION.DURATION_MEDIUM,
        ease: MOTION.EASE_STANDARD,
      },
      MOTION.ENTRY + MOTION.STAGGER_SMALL
    );
  }

  if (desc) {
    tl.to(
      desc,
      {
        y: -2,
        opacity: 0.95,
        duration: MOTION.DURATION_MEDIUM,
        ease: MOTION.EASE_STANDARD,
      },
      MOTION.ENTRY + MOTION.STAGGER_SMALL * 2
    );
  }

  if (actions) {
    tl.to(
      actions,
      {
        opacity: 0,
        duration: MOTION.DURATION_FAST,
        ease: MOTION.EASE_STANDARD,
      },
      MOTION.ENTRY + MOTION.STAGGER_SMALL
    );
  }

  if (overlay) {
    tl.to(
      overlay,
      {
        y: 0,
        opacity: 1,
        visibility: 'visible',
        pointerEvents: 'auto',
        duration: MOTION.DURATION_MEDIUM,
        ease: MOTION.EASE_EMPHASIZED,
      },
      MOTION.ENTRY + MOTION.STAGGER_MEDIUM
    );
  }

  return tl;
}

export function collapseCardTimeline(tl: gsap.core.Timeline): void {
  tl.reverse();
}
