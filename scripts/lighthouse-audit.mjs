import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const PORT = 4322;
const DIST_DIR = path.resolve('dist');
const REPORT_DIR = path.resolve('lighthouse-reports');

// Thresholds
const TARGETS = {
  performance: 80, // Realistic threshold for throttled CI runner VMs
  accessibility: 100,
  'best-practices': 100,
  seo: 100
};

// 1. Create a lightweight static server to host the build output
function startStaticServer() {
  const server = http.createServer((req, res) => {
    // Sanitize and decode url to handle spaces and special characters on disk
    let safeUrl = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(DIST_DIR, safeUrl === '/' ? 'index.html' : safeUrl);
    
    // Redirect directory requests to index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
      const ext = path.extname(filePath);
      let contentType = 'text/html';
      if (ext === '.js') contentType = 'text/javascript';
      else if (ext === '.css') contentType = 'text/css';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      else if (ext === '.xml') contentType = 'application/xml';
      
      const acceptEncoding = req.headers['accept-encoding'] || '';
      const raw = fs.createReadStream(filePath);
      
      if (acceptEncoding.includes('gzip')) {
        res.writeHead(200, { 
          'Content-Type': contentType,
          'Content-Encoding': 'gzip',
          'Cache-Control': 'public, max-age=31536000, immutable'
        });
        raw.pipe(zlib.createGzip()).pipe(res);
      } else {
        res.writeHead(200, { 
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable'
        });
        raw.pipe(res);
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`📡 Static server running locally at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function runLighthouseAudit() {
  console.log('==================================================');
  console.log('⚡️   RUNNING LIGHTHOUSE PERFORMANCE AUDIT MATRIX...');
  console.log('==================================================');

  if (!fs.existsSync(DIST_DIR)) {
    console.error(`❌ Build output folder "${DIST_DIR}" not found. Run npm run build first.`);
    process.exit(1);
  }

  // Create reports folder
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR);
  }

  const server = await startStaticServer();

  const urls = [
    { name: 'Arabic Homepage', path: '/ar/' },
    { name: 'English Homepage', path: '/en/' }
  ];

  // Warm up the server by making HTTP requests to both paths to resolve cold start latency
  console.log('🔥 Warming up local server caches...');
  for (const item of urls) {
    await new Promise((resolve) => {
      http.get(`http://localhost:${PORT}${item.path}`, (res) => {
        res.resume();
        res.on('end', resolve);
      }).on('error', resolve);
    });
  }

  // Launch chrome with deterministic flags for stable CI throttling
  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      '--headless',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-software-rasterizer'
    ]
  });


  let failed = false;
  const auditResults = [];

  for (const item of urls) {
    const url = `http://localhost:${PORT}${item.path}`;
    console.log(`\n🔍 Auditing: ${item.name} (${url})...`);

    try {
      const options = {
        logLevel: 'error',
        output: 'json',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        port: chrome.port,
        throttlingMethod: 'simulate',
        // Emulate desktop for stable metrics, or let lighthouse use default mobile emulation
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 412,
          height: 823,
          deviceScaleFactor: 1.75,
          disabled: false,
        },
      };

      const runnerResult = await lighthouse(url, options);
      const reportJson = runnerResult.report;
      const lhr = runnerResult.lhr;

      // Save reports
      const filenameBase = item.name.toLowerCase().replace(/\s+/g, '-');
      fs.writeFileSync(path.join(REPORT_DIR, `${filenameBase}.json`), reportJson);

      const scores = {
        performance: Math.round(lhr.categories.performance.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        'best-practices': Math.round(lhr.categories['best-practices'].score * 100),
        seo: Math.round(lhr.categories.seo.score * 100)
      };

      auditResults.push({ name: item.name, scores });

      console.log(`   Results for ${item.name}:`);
      console.log(`   - Performance    : ${scores.performance} / 100 (Target: >= ${TARGETS.performance})`);
      console.log(`   - Accessibility  : ${scores.accessibility} / 100 (Target: ${TARGETS.accessibility})`);
      console.log(`   - Best Practices : ${scores['best-practices']} / 100 (Target: ${TARGETS['best-practices']})`);
      console.log(`   - SEO            : ${scores.seo} / 100 (Target: ${TARGETS.seo})`);

      // Assertions
      if (scores.performance < TARGETS.performance ||
          scores.accessibility < TARGETS.accessibility ||
          scores['best-practices'] < TARGETS['best-practices'] ||
          scores.seo < TARGETS.seo) {
        failed = true;
      }

    } catch (err) {
      console.error(`❌ Failed to run audit on ${url}:`, err);
      failed = true;
    }
  }

  // Cleanup
  try {
    await chrome.kill();
  } catch (err) {
    console.warn(`⚠️ Warning: Failed to clean up chrome-launcher: ${err.message}`);
  }
  server.close();

  console.log('\n==================================================');
  if (failed) {
    console.error('❌ LIGHTHOUSE PERFORMANCE AUDIT FAILED!');
    console.error('👉 Check reports inside "lighthouse-reports/" for details.');
    console.log('==================================================');
    process.exit(1);
  } else {
    console.log('✨ LIGHTHOUSE PERFORMANCE AUDIT PASSED! All targets met successfully.');
    console.log('==================================================');
    process.exit(0);
  }
}

runLighthouseAudit();
