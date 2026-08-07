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
});
