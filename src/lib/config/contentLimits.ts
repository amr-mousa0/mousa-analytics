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
  PROJECT_CARD_DESCRIPTION: 130,

  /**
   * Maximum word count for Arabic outer card descriptions.
   * Set to 16 words max to fit complete sentences cleanly in 2 lines.
   */
  PROJECT_CARD_DESCRIPTION_WORDS_AR: 16,

  /**
   * Maximum word count for English outer card descriptions.
   * Set to 20 words max to fit complete sentences cleanly in 2 lines.
   */
  PROJECT_CARD_DESCRIPTION_WORDS_EN: 20,
});
