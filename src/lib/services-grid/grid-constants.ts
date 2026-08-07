export const GRID_SELECTORS = Object.freeze({
  GRID_SELECTOR: '#services .service-grid',
  CARD_SELECTOR: '.premium-card-global',
  CARD_LINK: '.card-link',
  CARD_IMAGE: '.card-image',
  CARD_TITLE: '.card-title',
  CARD_DESC: '.card-description',
  CARD_OVERLAY: '.card-overlay',
  CARD_ACTIONS: '.card-actions',
} as const);

export const CSS_VARS = Object.freeze({
  CARD_X: '--card-x',
  CARD_Y: '--card-y',
  GLOW_X: '--glow-x',
  GLOW_Y: '--glow-y',
  CARD_SCALE: '--card-scale',
} as const);

export const MEDIA_QUERIES = Object.freeze({
  MOVES: '(hover: hover) and (pointer: fine)',
  STATIC: '(prefers-reduced-motion: reduce)',
} as const);

export const ENHANCED_CLASS = 'gsap-enhanced' as const;
