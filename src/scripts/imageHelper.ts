/**
 * Helper utility to safely normalize image paths for Astro components.
 * Handles strings, Astro ImageMetadata objects, relative asset paths, and CDN URLs.
 */
export function getImageUrl(img: any): string {
  if (!img) return '/images/og-image.png';

  if (typeof img === 'string') {
    if (img.startsWith('http://') || img.startsWith('https://')) {
      return img;
    }
    // Normalize relative pipeline paths like '../../../assets/images/uploads/...'
    // Absolute '/assets/...' paths are preserved as-is (real public files served from /assets/).
    let clean = img
      .replace(/^(\.\.\/)+assets\/images\/uploads\//, '/images/uploads/')
      .replace(/^\/assets\/images\/uploads\//, '/images/uploads/')
      .replace(/^(\.\.\/)+assets\/images\//, '/images/uploads/')
      .replace(/^(\.\.\/)+assets\//, '/images/uploads/');

    if (!clean.startsWith('/')) {
      clean = '/' + clean;
    }
    return clean;
  }

  if (typeof img === 'object' && img !== null) {
    if (typeof img.src === 'string') {
      return getImageUrl(img.src);
    }
  }

  return '/images/og-image.png';
}
