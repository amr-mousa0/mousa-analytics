import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const PORT = 4323;
const DIST_DIR = process.argv[2] || 'D:/AI and coding/new portofolio/dist/client';
const OUT_DIR = process.argv[3] || 'C:/Users/HP/AppData/Local/Temp/opencode/vp';
const LABEL = process.argv[4] || 'v';

fs.mkdirSync(OUT_DIR, { recursive: true });

function startServer() {
  const server = http.createServer((req, res) => {
    let safeUrl = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
    let filePath = path.join(DIST_DIR, safeUrl === '' ? 'index.html' : safeUrl);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
    if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
      const ext = path.extname(filePath);
      const ct = ext === '.js' ? 'text/javascript' : ext === '.css' ? 'text/css' : ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : ext === '.svg' ? 'image/svg+xml' : ext === '.woff2' ? 'font/woff2' : 'text/html';
      res.writeHead(200, { 'Content-Type': ct, 'Cache-Control': 'no-store' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404');
    }
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

async function shot(page, name) {
  const pos = await page.evaluate(() => ({
    scrollY: window.scrollY,
    docH: document.documentElement.scrollHeight,
    collage: (() => { const el = document.getElementById('visual-collage'); return el ? Math.round(el.getBoundingClientRect().top) : null; })(),
    hero: (() => { const el = document.getElementById('hero'); return el ? Math.round(el.getBoundingClientRect().top) : null; })(),
  }));
  console.log(`${LABEL}-${name}: scrollY=${pos.scrollY} docH=${pos.docH} collage.top=${pos.collage} hero.top=${pos.hero}`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT_DIR, `${LABEL}-${name}.png`) });
}

const server = await startServer();
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
const page = await ctx.newPage();

// Arabic homepage (default locale) — the primary mobile cold-cache visit
await page.goto('http://localhost:4323/', { waitUntil: 'load' });
await page.waitForTimeout(5200); // preloader exit (400ms) + entrance + idle engine build
await shot(page, 'hero-top');

await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = 'auto';
  window.scrollTo(0, 1100);
});
await page.waitForTimeout(2600);
await shot(page, 'hero-gallery');

await page.evaluate(() => document.getElementById('visual-collage')?.scrollIntoView({ behavior: 'instant' }));
await page.waitForTimeout(2800);
await shot(page, 'collage');

await page.evaluate(() => document.getElementById('services')?.scrollIntoView({ behavior: 'instant' }));
await page.waitForTimeout(3000);
await shot(page, 'services');

await page.evaluate(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' }));
await page.waitForTimeout(3000);
await shot(page, 'projects');

await browser.close();
server.close();
console.log('done', LABEL);