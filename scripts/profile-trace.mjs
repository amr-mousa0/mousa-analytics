// One-off: trace-enabled Lighthouse run for waterfall analysis (not part of the audit matrix)
import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const PORT = 4322;
const DIST = 'dist/client';

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  let f = path.join(DIST, p === '/' ? 'index.html' : p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (fs.existsSync(f) && !fs.statSync(f).isDirectory()) {
    const ext = path.extname(f);
    let ct = 'text/html';
    if (ext === '.js') ct = 'text/javascript';
    else if (ext === '.css') ct = 'text/css';
    else if (ext === '.webp') ct = 'image/webp';
    else if (ext === '.svg') ct = 'image/svg+xml';
    const raw = fs.createReadStream(f);
    if ((req.headers['accept-encoding'] || '').includes('gzip')) {
      res.writeHead(200, { 'Content-Type': ct, 'Content-Encoding': 'gzip', 'Cache-Control': 'public, max-age=31536000, immutable' });
      raw.pipe(zlib.createGzip()).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': ct, 'Cache-Control': 'public, max-age=31536000, immutable' });
      raw.pipe(res);
    }
  } else {
    res.writeHead(404); res.end('404');
  }
});

server.listen(PORT, async () => {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-software-rasterizer']
  });
  const { lhr, artifacts } = await lighthouse(`http://localhost:${PORT}/`, {
    logLevel: 'error',
    output: 'json',
    port: chrome.port,
    throttlingMethod: 'simulate',
    formFactor: 'mobile',
    screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
    onlyCategories: ['performance'],
    trace: true
  });
  fs.writeFileSync('lh-single.json', JSON.stringify(lhr));

  const traceArr = artifacts.Trace?.traceEvents || artifacts.Trace || [];
  const evs = traceArr.filter(
    (e) => e.name === 'largestContentfulPaint::Candidate' || e.name === 'firstContentfulPaint' || e.name === 'firstPaint' || e.name === 'firstMeaningfulPaint'
  );
  const baseTs = artifacts.Trace?.[0]?.ts || 0;
  for (const e of evs) {
    console.log('TRACE', e.name, Math.round((e.ts - baseTs) / 1000) + 'ms', e.args?.data?.size || '');
  }

  const reqs = {};
  for (const e of artifacts.DevtoolsLog) {
    if (e.method === 'Network.requestWillBeSent') {
      const p = e.params;
      reqs[p.requestId] = { url: p.request.url, start: p.timestamp, priority: p.initiator?.priority || '' };
    } else if (e.method === 'Network.responseReceived') {
      const r = reqs[e.params.requestId];
      if (r) r.end = e.params.response.responseTime / 1000;
    }
  }
  const lines = Object.values(reqs)
    .filter((r) => r.url.startsWith(`http://localhost:${PORT}`))
    .map((r) => ({ u: r.url.replace(`http://localhost:${PORT}`, ''), s: Math.round((r.start - 1000) * 1000), e: r.end ? Math.round((r.end - 1000) * 1000) : null, p: r.priority }))
    .sort((a, b) => (a.s || 0) - (b.s || 0));
  fs.writeFileSync('reqs-lean.json', JSON.stringify(lines, null, 1));

  console.log('PERF', Math.round(lhr.categories.performance.score * 100),
    'FCP', lhr.audits['first-contentful-paint'].displayValue,
    'LCP', lhr.audits['largest-contentful-paint'].displayValue,
    'TBT', lhr.audits['total-blocking-time'].displayValue,
    'SI', lhr.audits['speed-index'].displayValue);

  await chrome.kill();
  server.close();
  process.exit(0);
});