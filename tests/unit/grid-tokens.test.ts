import { describe, it, expect } from 'vitest';
import { MOTION } from '../../src/lib/services-grid/grid-tokens';

describe('grid-tokens motion constants', () => {
  it('enforces SCALE_CAP within bounds (1, 1.15]', () => {
    expect(MOTION.SCALE_CAP).toBeGreaterThan(1);
    expect(MOTION.SCALE_CAP).toBeLessThanOrEqual(1.15);
  });

  it('enforces dim tokens within (0, 1)', () => {
    expect(MOTION.DIM_OPACITY).toBeGreaterThan(0);
    expect(MOTION.DIM_OPACITY).toBeLessThan(1);

    expect(MOTION.DIM_SATURATE).toBeGreaterThan(0);
    expect(MOTION.DIM_SATURATE).toBeLessThan(1);

    expect(MOTION.DIM_BRIGHTNESS).toBeGreaterThan(0);
    expect(MOTION.DIM_BRIGHTNESS).toBeLessThan(1);
  });

  it('enforces durations are greater than 0', () => {
    expect(MOTION.DURATION_FAST).toBeGreaterThan(0);
    expect(MOTION.DURATION_MEDIUM).toBeGreaterThan(0);
    expect(MOTION.DURATION_SLOW).toBeGreaterThan(0);
  });

  it('ensures MOTION object is frozen and immutable', () => {
    expect(Object.isFrozen(MOTION)).toBe(true);
    expect(() => {
      // @ts-ignore
      MOTION.SCALE_CAP = 1.5;
    }).toThrow();
  });
});
