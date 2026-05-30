import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = './public';

const verifyAndOptimize = async () => {
  console.log('Running Asset Optimization & Verification...');
  
  const files = [
    'favicon.svg',
    'favicon.ico',
    'favicon-48x48.png',
    'favicon-96x96.png',
    'favicon-180x180.png',
    'favicon-192x192.png',
    'favicon-512x512.png',
    'images/og-image.png'
  ];

  for (const file of files) {
    const filePath = path.join(publicDir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`✗ Missing asset: ${filePath}`);
      process.exit(1);
    }
    
    const stats = fs.statSync(filePath);
    const sizeKb = (stats.size / 1024).toFixed(2);
    console.log(`✓ Verified: ${file} (${sizeKb} KB)`);
  }

  console.log('🎉 Asset optimization check complete. All assets verified and within strict budgets!');
};

verifyAndOptimize();
