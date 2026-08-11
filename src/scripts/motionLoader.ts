import type { gsap } from 'gsap';
import type { ScrollTrigger } from 'gsap/ScrollTrigger';

export interface MotionApi {
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
}

let motionPromise: Promise<MotionApi> | null = null;

/**
 * Shared singleton loader for the GSAP + ScrollTrigger bundle.
 *
 * Every motion section (hero, collage, services, projects) awaits this single
 * promise instead of issuing its own late dynamic import. The first call — made
 * at module-scope by each section as soon as the page scripts run — starts the
 * network fetch for the vendor-motion chunk immediately after HTML parse, so
 * the scroll engines are decoded and registered long before the user can reach
 * the animated sections on a mobile device.
 */
export function loadMotion(): Promise<MotionApi> {
  if (!motionPromise) {
    motionPromise = Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([{ gsap: g }, { ScrollTrigger: st }]) => {
      g.registerPlugin(st);
      return { gsap: g, ScrollTrigger: st };
    });
  }
  return motionPromise;
}