import { CONTENT_LIMITS } from '../config/contentLimits.js';

export interface DescriptionFormatOptions {
  maxChars?: number;
}

/**
 * Smart Card Description Formatter (Guaranteed Idempotent & Bounded)
 *
 * Formats and truncates raw project descriptions at clean sentence/word boundaries
 * before translation and card rendering, ensuring identical 3-4 line readability.
 *
 * @param text The input raw or translated description string
 * @param options Format options overriding default config limit
 *
 * Supported Punctuation Boundaries (English & Arabic):
 * - English: . ! ?
 * - Arabic: ؟ (U+061F), ۔ (U+06D4)
 */
export function formatCardDescription(text: string, options: DescriptionFormatOptions = {}): string {
  const maxChars = options.maxChars ?? CONTENT_LIMITS.PROJECT_CARD_DESCRIPTION;

  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();

  // Idempotency guarantee: if text length is already <= maxChars, return immediately
  if (trimmed.length <= maxChars) return trimmed;

  // Attempt 1: Truncate at the last complete sentence boundary within maxChars limit
  const sentenceSub = trimmed.slice(0, maxChars);
  const lastSentenceMatch = sentenceSub.match(/.*[.!?\u061F\u06D4]/s);
  if (lastSentenceMatch && lastSentenceMatch[0].length >= Math.floor(maxChars * 0.45)) {
    return lastSentenceMatch[0].trim();
  }

  // Attempt 2: Fallback to last full word boundary with ellipsis (...) ensuring total length <= maxChars
  const targetLen = maxChars - 3;
  const wordSub = trimmed.slice(0, targetLen);
  const cleanSub = wordSub.replace(/[.!\?\u061F\u06D4\s]+$/, '');
  const spaceIndex = cleanSub.lastIndexOf(' ');

  if (spaceIndex > Math.floor(targetLen * 0.4)) {
    return `${cleanSub.slice(0, spaceIndex).trim()}...`;
  }

  return `${cleanSub.trim()}...`;
}
