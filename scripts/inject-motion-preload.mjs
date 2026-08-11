// Injects a <link rel="modulepreload"> for the GSAP (vendor-motion) chunk into
// the built homepage HTML so the browser starts its network fetch at the same
// priority as the critical hero resources — the scroll engines are decoded
// before the user can reach the pinned scene on slow mobile connections.
// The chunk hash is resolved from the actual build output, so this never
// hardcodes a filename. Runs after `astro build`; mirrors the injection into
// the Vercel output directory when present.
import fs from 'fs';
import path from 'path';

const ROOTS = ['dist/client', '.vercel/output/static']
  .map((r) => path.resolve(r))
  .filter((r) => fs.existsSync(r));

const TARGETS = ['index.html', 'en/index.html'];

let injected = 0;
let motionFile = null;

for (const root of ROOTS) {
  const astroDir = path.join(root, '_astro');
  if (!fs.existsSync(astroDir)) continue;
  if (!motionFile) {
    motionFile = fs
      .readdirSync(astroDir)
      .find((f) => f.startsWith('vendor-motion.') && f.endsWith('.js')) || null;
  }
}

if (!motionFile) {
  console.warn('[inject-motion-preload] vendor-motion chunk not found; skipping.');
  process.exit(0);
}

const link = `<link rel="modulepreload" href="/_astro/${motionFile}" />`;

for (const root of ROOTS) {
  for (const target of TARGETS) {
    const file = path.join(root, target);
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf-8');
    if (html.includes(`/_astro/${motionFile}`)) continue;
    if (!html.includes('<title>')) {
      console.warn(`[inject-motion-preload] no <title> anchor in ${file}; skipping.`);
      continue;
    }
    html = html.replace('<title>', `${link}\n    <title>`);
    if (!html.includes(link)) {
      console.warn(`[inject-motion-preload] replace failed for ${file}; skipping.`);
      continue;
    }
    fs.writeFileSync(file, html);
    injected++;
  }
}

console.log(`[inject-motion-preload] ${motionFile} injected into ${injected} html file(s).`);