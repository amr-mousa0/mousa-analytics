/**
 * Project Governance & Non-Project Rogue Slugs Guard
 * Prevents non-project GitHub repositories (such as user profile READMEs or internal infra repos)
 * from ever being rendered as portfolio projects.
 */

export const ROGUE_PROJECT_SLUGS = Object.freeze([
  'amr-mousa0',
  'amr-mousa0.github.io',
  'landing-page',
  'crm-erb',
  'content-sync-service'
]);

export function isRogueProject(slug?: string | null): boolean {
  if (!slug) return true;
  const clean = String(slug)
    .replace(/^(ar|en)\//, '')
    .replace(/\.[^/.]+$/, '')
    .split('/')
    .pop()
    ?.trim()
    ?.toLowerCase() || '';
  return ROGUE_PROJECT_SLUGS.includes(clean);
}
