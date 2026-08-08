/**
 * One-time font self-hosting tool.
 *
 * Fetches the exact Google Fonts CSS2 response that a headless Chrome/Chromium
 * UA receives, downloads every unique subset .woff2 file into /public/fonts,
 * and generates src/styles/fonts.css with identical @font-face rules
 * (family / weight / style / unicode-range / font-display) that point at the
 * local files. The rendered typography is byte-for-byte the same fonts.
 */
import https from 'https';
import fs from 'fs';
import path from 'path';

const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Cormorant+Garamond:wght@600;700&family=Inter:wght@400;600;700&family=Outfit:wght@400;600;700&display=swap';

// Google serves different (still valid) subset hashes per UA; use the same
// woff2-capable UA family the production Chrome builds use.
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const ROOT = process.cwd();
const FONTS_DIR = path.join(ROOT, 'public', 'fonts');
const STYLE_PATH = path.join(ROOT, 'src', 'styles', 'fonts.css');

function fetchUrl(url, headers = {}, attempts = 4) {
  return new Promise((resolve, reject) => {
    const tryFetch = (left) => {
      const req = https
        .get(url, { headers: { 'User-Agent': UA, ...headers } }, (res) => {
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () =>
            resolve({ status: res.statusCode, body: Buffer.concat(chunks) })
          );
        });
      req.setTimeout(15000, () => req.destroy());
      req.on('error', (e) => {
        if (left > 1) {
          console.log(`  retry ${url.slice(0, 60)}… (${e.code})`);
          setTimeout(() => tryFetch(left - 1), 1500);
        } else {
          reject(e);
        }
      });
    };
    tryFetch(attempts);
  });
}

async function main() {
  fs.mkdirSync(FONTS_DIR, { recursive: true });

  console.log('Fetching Google Fonts CSS…');
  const cssRes = await fetchUrl(CSS_URL);
  if (cssRes.status !== 200) throw new Error(`CSS fetch failed: ${cssRes.status}`);
  const css = cssRes.body.toString('utf8');

  // Split on @font-face blocks
  const blocks = css.split('@font-face').slice(1);
  let index = 0;
  const seenUrls = new Map(); // url -> local filename
  const rules = [];

  for (const block of blocks) {
    const family = (/font-family:\s*'([^']+)'/.exec(block) || [])[1] || 'font';
    const weight = (/font-weight:\s*(\d+)/.exec(block) || [])[1] || '400';
    const style = (/font-style:\s*(\w+)/.exec(block) || [])[1] || 'normal';
    const display = (/font-display:\s*(\w+)/.exec(block) || [])[1] || 'swap';
    const unicode = (/unicode-range:\s*([^;]+);/.exec(block) || [])[1] || '';
    const srcMatch = /src:\s*url\(([^)]+)\)\s*format\('woff2'\)/.exec(block);
    if (!srcMatch) continue;
    const url = srcMatch[1];

    let local = seenUrls.get(url);
    if (!local) {
      index++;
      local = `${family.replace(/\s+/g, '-').toLowerCase()}-${weight}-${index}.woff2`;
      seenUrls.set(url, local);
      console.log(`Downloading ${family} ${weight} -> ${local}`);
      const res = await fetchUrl(url, { accept: 'font/woff2' });
      if (res.status !== 200) {
        console.error(`  FAILED (${res.status}) for ${url}`);
        continue;
      }
      fs.writeFileSync(path.join(FONTS_DIR, local), res.body);
    }

    rules.push(
      `@font-face {
  font-family: '${family}';
  font-style: ${style};
  font-weight: ${weight};
  font-display: ${display};
  src: url('/fonts/${local}') format('woff2');
  unicode-range: ${unicode};
}`
    );
    index = rules.length;
  }

  const banner = `/* ==========================================================================
   Web Fonts — Self-hosted build (synchronized with the Google Fonts CSS2
   served to Chrome UAs). Every file + unicode-range mirrors the original
   Google CSS, font-display: swap preserved. Regenerate with:
   node scripts/download-fonts.mjs
   ========================================================================== */

`;
  fs.writeFileSync(STYLE_PATH, banner + rules.join('\n\n') + '\n');
  console.log(`\nWrote ${rules.length} @font-face rules -> ${STYLE_PATH}`);
  console.log(`Fonts in -> ${FONTS_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});