/**
 * Central Content Display Limits & Rules Config
 * Governed by Enterprise Architecture Guidelines
 */
export const CONTENT_LIMITS = Object.freeze({
  /**
   * Maximum character threshold for project card problem descriptions.
   * Set to 160 characters to ensure descriptions fit cleanly within 3 lines
   * across both English and Arabic card layouts without any text line clipping.
   */
  PROJECT_CARD_DESCRIPTION: 160,

  /**
   * Maximum word count for Arabic outer card descriptions.
   * Arabic characters are wider and require fewer words to fill 3 visible lines
   * on standard card widths without overflow or clipping.
   */
  PROJECT_CARD_DESCRIPTION_WORDS_AR: 18,

  /**
   * Maximum word count for English outer card descriptions.
   * English characters are narrower, allowing more words to fit cleanly
   * within 3 visible lines on standard card widths.
   */
  PROJECT_CARD_DESCRIPTION_WORDS_EN: 22,
});
