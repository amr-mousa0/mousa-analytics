import { CONTENT_LIMITS } from '../config/contentLimits.js';

export interface DescriptionFormatOptions {
  maxChars?: number;
  maxWordsAr?: number;
  maxWordsEn?: number;
}

/**
 * Detects whether text is predominantly Arabic based on Unicode character ranges.
 * Returns true if more than 30% of alphabetic characters fall within Arabic script blocks.
 */
export function isArabicText(text: string): boolean {
  if (!text) return false;
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
  const arabicMatches = text.match(arabicPattern);
  const latinPattern = /[a-zA-Z]/g;
  const latinMatches = text.match(latinPattern);
  const arabicCount = arabicMatches ? arabicMatches.length : 0;
  const latinCount = latinMatches ? latinMatches.length : 0;
  const totalAlpha = arabicCount + latinCount;
  if (totalAlpha === 0) return false;
  return arabicCount / totalAlpha > 0.3;
}

/**
 * Smart Card Description Formatter (Guaranteed Idempotent & Bounded)
 *
 * PRIMARY RULE: Enforces language-specific word count limits:
 *   - Arabic (AR): 18 words max (wider characters fill card lines faster)
 *   - English (EN): 22 words max (narrower characters allow more words)
 *
 * SECONDARY RULE: Character-based fallback safety net (160 chars default).
 *
 * Formats and truncates raw project descriptions at clean sentence/word boundaries
 * before translation and card rendering, ensuring identical 3-line readability.
 *
 * @param text The input raw or translated description string
 * @param options Format options overriding default config limits
 *
 * Supported Punctuation Boundaries (English & Arabic):
 * - English: . ! ?
 * - Arabic: ؟ (U+061F), ۔ (U+06D4)
 */
export function formatCardDescription(text: string, options: DescriptionFormatOptions = {}): string {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (!trimmed) return '';

  const isAr = isArabicText(trimmed);
  const maxWords = isAr
    ? (options.maxWordsAr ?? CONTENT_LIMITS.PROJECT_CARD_DESCRIPTION_WORDS_AR)
    : (options.maxWordsEn ?? CONTENT_LIMITS.PROJECT_CARD_DESCRIPTION_WORDS_EN);
  const maxChars = options.maxChars ?? CONTENT_LIMITS.PROJECT_CARD_DESCRIPTION;

  // Split into words (handles both Arabic and English whitespace patterns)
  const words = trimmed.split(/\s+/);

  // PRIMARY RULE: Word count enforcement
  if (words.length > maxWords) {
    const truncatedWords = words.slice(0, maxWords);
    let result = truncatedWords.join(' ');

    // Try to end at a clean sentence boundary within the word-limited text
    const sentenceMatch = result.match(/.*[.!?\u061F\u06D4]/s);
    if (sentenceMatch && sentenceMatch[0].split(/\s+/).length >= Math.ceil(maxWords * 0.5)) {
      return sentenceMatch[0].trim();
    }

    // Clean trailing punctuation fragments and add ellipsis
    result = result.replace(/[,،;:\s]+$/, '');
    return `${result}...`;
  }

  // SECONDARY RULE: Character-based fallback safety net
  if (trimmed.length > maxChars) {
    // Attempt sentence boundary within char limit
    const sentenceSub = trimmed.slice(0, maxChars);
    const lastSentenceMatch = sentenceSub.match(/.*[.!?\u061F\u06D4]/s);
    if (lastSentenceMatch && lastSentenceMatch[0].length >= Math.floor(maxChars * 0.45)) {
      return lastSentenceMatch[0].trim();
    }

    // Fallback to last full word boundary with ellipsis
    const targetLen = maxChars - 3;
    const wordSub = trimmed.slice(0, targetLen);
    const cleanSub = wordSub.replace(/[.!?\u061F\u06D4\s]+$/, '');
    const spaceIndex = cleanSub.lastIndexOf(' ');

    if (spaceIndex > Math.floor(targetLen * 0.4)) {
      return `${cleanSub.slice(0, spaceIndex).trim()}...`;
    }

    return `${cleanSub.trim()}...`;
  }

  // Text is within both word and character limits — return as-is
  return trimmed;
}
