import fs from 'fs';
import path from 'path';

function resolveDistDir() {
  const candidates = [
    path.resolve('dist/client/_astro'),
    path.resolve('.vercel/output/static/_astro'),
    path.resolve('dist/_astro')
  ];
  for (const cand of candidates) {
    if (fs.existsSync(cand)) return cand;
  }
  return candidates[0];
}

const DIST_DIR = resolveDistDir();

// Limits
const MAX_JS_CHUNK_SIZE_KB = 150; // 150KB
const MAX_CSS_CHUNK_SIZE_KB = 100; // 100KB

function getFilesRecursive(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  const list = fs.readdirSync(dir);
  
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results.push(...getFilesRecursive(filePath));
    } else {
      results.push({
        path: filePath,
        name: file,
        sizeBytes: stat.size,
        sizeKB: stat.size / 1024,
      });
    }
  }
  return results;
}

function runAudit() {
  console.log('==================================================');
  console.log('⚙️   RUNNING PRODUCTION BUNDLE SIZE AUDIT...');
  console.log('==================================================');

  if (!fs.existsSync(DIST_DIR)) {
    console.error(`❌ Error: Build directory "${DIST_DIR}" not found. Please run "npm run build" first.`);
    process.exit(1);
  }

  const files = getFilesRecursive(DIST_DIR);
  let failed = false;
  const diagnostics = [];

  console.log('\n📦 Compiled Chunks Summary:');
  
  for (const file of files) {
    const isJS = file.name.endsWith('.js');
    const isCSS = file.name.endsWith('.css');
    
    if (!isJS && !isCSS) continue;

    const formattedSize = file.sizeKB.toFixed(2) + ' KB';
    let status = '✅ PASS';
    let thresholdViolation = false;

    if (isJS && file.sizeKB > MAX_JS_CHUNK_SIZE_KB) {
      status = `❌ FAIL (Exceeded limit of ${MAX_JS_CHUNK_SIZE_KB} KB)`;
      thresholdViolation = true;
      failed = true;
    } else if (isCSS && file.sizeKB > MAX_CSS_CHUNK_SIZE_KB) {
      status = `❌ FAIL (Exceeded limit of ${MAX_CSS_CHUNK_SIZE_KB} KB)`;
      thresholdViolation = true;
      failed = true;
    }

    console.log(`  - ${file.name.padEnd(65)} : ${formattedSize.padStart(10)} [${status}]`);
    
    if (thresholdViolation) {
      diagnostics.push(`Chunk "${file.name}" is too large: ${formattedSize} (Limit: ${isJS ? MAX_JS_CHUNK_SIZE_KB : MAX_CSS_CHUNK_SIZE_KB} KB)`);
    }
  }

  console.log('\n==================================================');
  if (failed) {
    console.error('❌ BUNDLE SIZE AUDIT FAILED!');
    for (const diag of diagnostics) {
      console.error(`   - ${diag}`);
    }
    console.error('\n👉 Please optimize imports, split chunks, or audit third-party libraries.');
    console.log('==================================================');
    process.exit(1);
  } else {
    console.log('✨ BUNDLE SIZE AUDIT PASSED! All chunks are within healthy budgets.');
    console.log('==================================================');
  }
}

runAudit();
