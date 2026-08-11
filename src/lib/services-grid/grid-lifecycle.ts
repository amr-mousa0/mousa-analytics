import { gsap } from 'gsap';
import { GRID_SELECTORS, MEDIA_QUERIES, ENHANCED_CLASS } from './grid-constants';
import { createGridEngine } from './grid-engine';
import type { GridEngine } from './grid-engine';
import { attachResizeObserver } from './grid-resize-sync';

let currentEngine: GridEngine | null = null;
let currentCtx: gsap.Context | null = null;
let mm: gsap.MatchMedia | null = null;
let io: IntersectionObserver | null = null;
let isInitialized = false;

export const servicesGridLifecycle = {
  init() {
    if (typeof document === 'undefined') return;
    if (isInitialized) return;
    isInitialized = true;

    // Unconditionally add enhancement class as JS-presence signal
    document.documentElement.classList.add(ENHANCED_CLASS);

    const gridRoot = document.querySelector<HTMLElement>(GRID_SELECTORS.GRID_SELECTOR);
    if (!gridRoot) return;

    // Expose the gate result even when the engine is never created (touch devices,
    // reduced motion) so e2e tests can assert a boolean instead of `undefined`.
    if (typeof window !== 'undefined') {
      window.__servicesEngineActive = Boolean(
        window.matchMedia(MEDIA_QUERIES.MOVES).matches &&
        !window.matchMedia(MEDIA_QUERIES.STATIC).matches
      );
    }

    // The hover/expansion engine only has meaning on fine-pointer devices
    // (the grid's entrance reveal is CSS-only, handled elsewhere). Skipping it
    // early on touch devices avoids gating on image decode and building a
    // MatchMedia graph that would never match — mobile keeps its instant CSS
    // entrance while the main thread stays free for scrolling.
    if (
      typeof window === 'undefined' ||
      !window.matchMedia(MEDIA_QUERIES.MOVES).matches ||
      window.matchMedia(MEDIA_QUERIES.STATIC).matches
    ) {
      return;
    }

    // Decode check for images before engine activation
    const images = Array.from(gridRoot.querySelectorAll<HTMLImageElement>('img'));
    Promise.all(images.map((img) => (img.complete ? Promise.resolve() : img.decode().catch(() => {})))).then(() => {
      mm = gsap.matchMedia();

      mm.add(MEDIA_QUERIES.MOVES, () => {
        currentCtx = gsap.context(() => {
          currentEngine = createGridEngine(gridRoot);
          currentEngine.attach();

          const resizeDisposer = attachResizeObserver(gridRoot);

          if ('IntersectionObserver' in window) {
            io = new IntersectionObserver((entries) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting && currentEngine) {
                  // Collapse any active card + undim neighbors on scroll out
                  currentEngine.collapse();
                  currentEngine.state = 'IDLE';
                }
              });
            }, { threshold: 0.1 });
            const section = document.querySelector('#services');
            if (section) io.observe(section);
          }

          return () => {
            resizeDisposer();
          };
        }, gridRoot);
      });
    });
  },

  dispose() {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove(ENHANCED_CLASS);
    }

    if (io) {
      io.disconnect();
      io = null;
    }

    if (currentEngine) {
      currentEngine.detach();
      currentEngine = null;
    }

    if (currentCtx) {
      currentCtx.revert();
      currentCtx = null;
    }

    if (mm) {
      mm.revert();
      mm = null;
    }

    isInitialized = false;
  },
};
