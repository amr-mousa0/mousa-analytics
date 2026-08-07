import fs from 'fs';
import path from 'path';

/**
 * Favicon Generator Script (TASK-TOK-005 / AD-05)
 * Derives public/favicon.svg and derivative assets directly from canonical BrandMark vectors.
 * Uses approved semantic color tokens (#0A192F Navy Slate, #2563EB Consultancy Blue, #F8F9FA Alabaster Light).
 */

const faviconSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" fill="none" role="img" aria-label="Mousa Analytics Favicon">
  <rect width="100" height="100" rx="20" fill="#0A192F" />
  <g transform="translate(2.5, 12.5) scale(0.95)" fill="#2563EB">
    <path d="M 21.5,59.5 C 16.5,59.5 13.0,55.0 12.0,49.0 C 11.0,43.0 14.0,37.0 18.0,37.5 C 22.0,38.0 25.0,44.0 27.5,48.0 C 30.0,52.0 26.5,59.5 21.5,59.5 Z" fill="#60A5FA" opacity="0.9" />
    <path d="M 52.38,59.37 C 48.00,59.37 45.00,57.50 44.50,55.95 L 28.44,22.34 C 26.80,21.00 24.72,21.00 23.09,21.75 C 26.00,14.50 29.50,10.00 32.16,10.00 C 34.83,10.00 37.00,11.00 38.85,12.23 L 56.10,47.32 C 58.00,48.36 60.00,48.36 61.15,47.62 C 58.00,56.00 55.00,59.37 52.38,59.37 Z M 45.62,26.00 Q 47.67,30.16 52.79,26.00 L 52.79,35.00 L 45.62,35.00 Z" fill="#2563EB" />
    <path d="M 81.22,59.37 C 76.84,59.37 73.84,57.50 73.34,55.95 L 64.28,37.00 Q 62.31,32.87 57.26,37.00 L 52.82,40.63 L 50.00,59.37 L 36.52,39.28 L 57.28,22.34 C 55.64,21.00 53.56,21.00 51.93,21.75 C 54.84,14.50 58.34,10.00 61.00,10.00 C 63.67,10.00 65.84,11.00 67.69,12.23 L 84.94,47.32 C 86.84,48.36 88.84,48.36 89.99,47.62 C 86.84,56.00 83.84,59.37 81.22,59.37 Z" fill="#2563EB" />
    <path d="M 19.80,48.50 L 53.98,43.00 L 82.82,43.00" stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.85" />
    <circle cx="19.80" cy="48.50" r="3" fill="#60A5FA" />
    <circle cx="53.98" cy="43.00" r="3" fill="#60A5FA" />
    <circle cx="82.82" cy="43.00" r="3" fill="#60A5FA" />
  </g>
</svg>`;

const publicFaviconPath = path.resolve('public/favicon.svg');
const publicImagesDir = path.resolve('public/images');
const publicLogoRefPath = path.resolve('public/images/logo-reference.svg');

if (!fs.existsSync(publicImagesDir)) {
  fs.mkdirSync(publicImagesDir, { recursive: true });
}

fs.writeFileSync(publicFaviconPath, faviconSvgContent, 'utf-8');
fs.writeFileSync(publicLogoRefPath, faviconSvgContent, 'utf-8');

console.log('[TASK-TOK-005] Generated public/favicon.svg and public/images/logo-reference.svg from BrandMark vectors.');
