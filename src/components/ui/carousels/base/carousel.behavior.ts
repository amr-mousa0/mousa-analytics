/**
 * Centralized behavior constants for all carousel implementations.
 * Governed by Constitution Article 14 (Centralized Configuration).
 * Any carousel component requiring default behavior settings imports from here.
 */
export const CAROUSEL_BEHAVIOR = {
  DEFAULT_AUTO_PLAY_INTERVAL: 4000, // ms — single source of truth
  DEFAULT_AUTO_PLAY: true,
} as const;
