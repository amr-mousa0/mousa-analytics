import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isRtl, mirror, entryVector } from '../../src/lib/services-grid/grid-direction.js';

describe('grid-direction utility', () => {
  let docMock: { documentElement: { dir: string } };

  beforeEach(() => {
    docMock = { documentElement: { dir: '' } };
    // @ts-ignore
    globalThis.document = docMock;
  });

  afterEach(() => {
    // @ts-ignore
    delete globalThis.document;
  });

  it('detects RTL based on document.documentElement.dir', () => {
    docMock.documentElement.dir = 'ltr';
    expect(isRtl()).toBe(false);

    docMock.documentElement.dir = 'rtl';
    expect(isRtl()).toBe(true);
  });

  it('mirrors values appropriately based on direction', () => {
    docMock.documentElement.dir = 'ltr';
    expect(mirror(12)).toBe(12);

    docMock.documentElement.dir = 'rtl';
    expect(mirror(12)).toBe(-12);
  });

  it('calculates entryVector correctly (-1 for left, 0 for center, 1 for right)', () => {
    const centerX = 100;
    expect(entryVector(50, centerX)).toBe(-1);
    expect(entryVector(150, centerX)).toBe(1);
    expect(entryVector(100, centerX)).toBe(0);
  });
});
