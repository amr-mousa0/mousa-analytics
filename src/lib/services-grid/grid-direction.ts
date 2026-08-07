export function isRtl(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.dir === 'rtl';
}

export function mirror(value: number): number {
  return isRtl() ? -value : value;
}

export type EntryDirection = -1 | 0 | 1;

export function entryVector(entryX: number, centerX: number, threshold = 15): EntryDirection {
  const diff = entryX - centerX;
  if (diff < -threshold) return -1;
  if (diff > threshold) return 1;
  return 0;
}
