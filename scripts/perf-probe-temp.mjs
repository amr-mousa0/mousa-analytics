import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const PORT = 4322;
const DIST_DIR = path.resolve('dist/client');

const server = http.createServer((req, res) => {
  let safeUrl = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(DIST_DIR, safeUrl === '/' ? 'index.html' : safeUrl);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
  if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    if (ext === '.js') contentType = 'text/javascript';
    else if (ext === '.css') contentType = 'text/css';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404');
  }
});
await new Promise((r) => server.listen(PORT, r));
console.log('server on', PORT);

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 3, isMobile: true });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1474.6 * 1024 / 8, uploadThroughput: 675 * 1024 / 8 });

await page.addInitScript(() => {
  window.__perf = { longtasks: [], lcp: [], fcp: 0, load: 0, dom: 0, res: [] };
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__perf.longtasks.push({ s: Math.round(e.startTime), d: Math.round(e.duration), f: (e.attribution?.[0]?.container?.src || e.attribution?.[0]?.container?.id || '').slice(0, 40) });
  }).observe({ type: 'longtask', buffered: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__perf.lcp.push({ s: Math.round(e.startTime), size: Math.round(e.size), el: (e.element?.className || e.element?.tagName || '').toString().slice(0, 60) });
  }).observe({ type: 'largest-contentful-paint', buffered: true });
});
await page.goto('http://localhost:4322/', { waitUntil: 'load' });
await page.waitForTimeout(7000);
const r = await page.evaluate(() => {
  const p = window.__perf;
  p.fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0;
  p.load = Math.round(performance.timing.loadEventEnd - performance.timing.navigationStart);
  p.dom = Math.round(performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart);
  p.res = performance.getEntriesByType('resource').map((x) => ({ n: x.name.split('/').pop().slice(0, 50), t: Math.round(x.startTime), d: Math.round(x.duration), size: Math.round(x.transferSize) })).sort((a, b) => a.t - b.t);
  return p;
});
console.log('FCP:', Math.round(r.fcp), '| load:', r.load, '| DCL:', r.dom);
console.log('longtasks:');
for (const t of r.longtasks) console.log('  +' + t.s + 'ms dur=' + t.d + 'ms src=' + t.f);
console.log('LCP candidates:');
for (const l of r.lcp) console.log('  +' + l.s + 'ms size=' + l.size + ' el=' + l.el);
console.log('resources first 40:');
for (const x of r.res.slice(0, 40)) console.log('  +' + x.t + ' dur=' + x.d + ' size=' + x.size + ' ' + x.n);

await browser.close();
server.close();