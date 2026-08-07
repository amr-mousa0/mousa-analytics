/**
 * Geometry constants for the Circular Carousel layout engine.
 * Governed by Constitution Article 14 & Carousel Separation of Concerns.
 * Contains ONLY spatial geometry math and slot definitions.
 */
export const VISIBLE_COUNT = 5;
export const RADIUS_X = 220;
export const RADIUS_Y = 100;

export interface CircularPosition {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  zIndex: number;
  adjustedOffset: number;
}

/**
 * Calculates slot transform parameters for a given card relative to activeIndex.
 */
export function getItemPosition(
  index: number,
  activeIndex: number,
  total: number
): CircularPosition | null {
  if (total === 0) return null;
  const offset = index - activeIndex;
  const half = Math.floor(VISIBLE_COUNT / 2);
  let adjustedOffset = offset;

  if (offset > half) adjustedOffset = offset - total;
  if (offset < -half) adjustedOffset = offset + total;

  if (Math.abs(adjustedOffset) > half * 2) return null;

  const angle = (adjustedOffset / VISIBLE_COUNT) * Math.PI;
  const x = Math.sin(angle) * RADIUS_X;
  const y = -Math.cos(angle) * RADIUS_Y;

  const distance = Math.abs(adjustedOffset);
  const maxDistance = half + 1;
  const scale = Math.max(0, 1 - (distance / maxDistance) * 0.3);
  const opacity = Math.max(0.3, 1 - (distance / maxDistance) * 0.7);
  const zIndex = VISIBLE_COUNT - distance;

  return { x, y, scale, opacity, zIndex, adjustedOffset };
}
