/**
 * Brand Governance Naming Constants & Guards
 * Governed by AD-03, AD-05, SPEC-BRAND-001, and TASK-FND-003
 */

export const BRAND_CONSTANTS = Object.freeze({
  PRIMARY_BRAND_EN: 'Mousa Data Analytics',
  BRAND_TITLE_EN: 'MOUSA DATA ANALYTICS',
  PRIMARY_BRAND_AR: 'موسى لتحليل البيانات',
  LEGAL_ENTITY_EN: 'Mousa Systems',
  LEGAL_ENTITY_AR: 'أنظمة موسى',
  SHORT_NAME_EN: 'Mousa',
  SHORT_NAME_AR: 'موسى',
  TAGLINE_EN: 'Advanced Enterprise Data & Analytics Systems',
  TAGLINE_AR: 'أنظمة البيانات والتحليلات المؤسسية المتقدمة',
  // Canonical contact & social governance (referenced by Footer.astro)
  CANONICAL_PHONE: '201017749925',
  WHATSAPP_URL: 'https://wa.me/201017749925',
  SOCIAL_LINKEDIN: 'https://www.linkedin.com/in/amr-mousa0',
  SOCIAL_GITHUB: 'https://github.com/amr-mousa0',
} as const);

export const UNAPPROVED_BRAND_ALIASES = Object.freeze([
  'Amr Systems',
  'Amr Portfolio',
  'Amr Systems Portfolio',
  'Mousa Portfolio',
]);

/**
 * Validates whether a brand string matches canonical brand naming standards.
 * Returns false if legacy unapproved aliases are detected.
 */
export function isValidBrandName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;

  const lowerInput = name.trim().toLowerCase();
  for (const alias of UNAPPROVED_BRAND_ALIASES) {
    if (lowerInput.includes(alias.toLowerCase())) {
      return false;
    }
  }
  return true;
}

/**
 * Asserts that a given string contains zero unapproved brand aliases.
 * Throws an Error if a violation is detected.
 */
export function assertValidBrandName(name: string): void {
  if (!isValidBrandName(name)) {
    throw new Error(`Brand Governance Violation: Unapproved brand alias detected in "${name}". Must use canonical brand names from SPEC-BRAND-001.`);
  }
}
