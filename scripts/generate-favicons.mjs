import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SVG_PATH = 'public/favicon.svg';

const sizes = [
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'favicon-96x96.png', size: 96 },
  { name: 'favicon-180x180.png', size: 180 },
  { name: 'favicon-192x192.png', size: 192 },
  { name: 'favicon-512x512.png', size: 512 },
  { name: 'favicon.ico', size: 32 }
];

async function generateFavicons() {
  console.log('Generating PWA Favicons from SVG...');
  
  if (!fs.existsSync(SVG_PATH)) {
    console.error(`Source SVG not found at ${SVG_PATH}`);
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(SVG_PATH);

  for (const item of sizes) {
    const destPath = path.join('public', item.name);
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(destPath);
    
    console.log(`✓ Generated ${item.name} (${item.size}x${item.size})`);
  }
}

async function generateOGImage() {
  console.log('Generating premium Open Graph image (1200x630)...');

  // SVG representation for the Open Graph image card
  // Using standard system serif/sans fonts for clean layout
  const ogSvg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <style>
        .title {
          font-family: 'Georgia', 'Cinzel', serif;
          font-size: 64px;
          font-weight: bold;
          fill: #FFFFFF;
          letter-spacing: 4px;
        }
        .subtitle {
          font-family: 'Helvetica', 'Arial', 'Outfit', sans-serif;
          font-size: 24px;
          font-weight: 600;
          fill: #38BDF8;
          letter-spacing: 6px;
        }
        .desc {
          font-family: 'Helvetica', 'Arial', 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 300;
          fill: #E2E8F0;
          opacity: 0.8;
        }
      </style>
      
      <rect width="1200" height="630" fill="#0A192F" />
      
      <!-- Radial glow in center-left -->
      <circle cx="250" cy="315" r="450" fill="url(#radial-glow)" opacity="0.25" />
      
      <defs>
        <radialGradient id="radial-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#2563EB" />
          <stop offset="100%" stop-color="#0A192F" stop-opacity="0" />
        </radialGradient>
        
        <!-- Deep Ocean Teal to Royal Blue -->
        <linearGradient id="primary-grad" x1="20" y1="10" x2="90" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#0F4C5C" />
          <stop offset="100%" stop-color="#1D4ED8" />
        </linearGradient>
        
        <!-- Ice Blue/Cyan -->
        <linearGradient id="accent-grad" x1="10" y1="35" x2="30" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#38BDF8" />
          <stop offset="100%" stop-color="#64FFDA" />
        </linearGradient>
      </defs>

      <!-- Render the Approved Monogram Shape (Scale 2.8x) -->
      <g transform="translate(100, 185) scale(2.8)">
        <!-- Shape 0: Smooth Left Dot -->
        <path
          d="M 21.5,59.5 C 16.5,59.5 13.0,55.0 12.0,49.0 C 11.0,43.0 14.0,37.0 18.0,37.5 C 22.0,38.0 25.0,44.0 27.5,48.0 C 30.0,52.0 26.5,59.5 21.5,59.5 Z"
          fill="url(#accent-grad)" />

        <!-- Shape 1: Left Peak (Middle Pillar) -->
        <path
          d="M 52.38,59.37 C 48.00,59.37 45.00,57.50 44.50,55.95 L 28.44,22.34 C 26.80,21.00 24.72,21.00 23.09,21.75 C 26.00,14.50 29.50,10.00 32.16,10.00 C 34.83,10.00 37.00,11.00 38.85,12.23 L 56.10,47.32 C 58.00,48.36 60.00,48.36 61.15,47.62 C 58.00,56.00 55.00,59.37 52.38,59.37 Z M 45.62,26.00 Q 47.67,30.16 52.79,26.00 L 52.79,35.00 L 45.62,35.00 Z"
          fill="url(#primary-grad)" />

        <!-- Shape 2: Right Arch -->
        <path
          d="M 81.22,59.37 C 76.84,59.37 73.84,57.50 73.34,55.95 L 64.28,37.00 Q 62.31,32.87 57.26,37.00 L 52.82,40.63 L 50.00,59.37 L 36.52,39.28 L 57.28,22.34 C 55.64,21.00 53.56,21.00 51.93,21.75 C 54.84,14.50 58.34,10.00 61.00,10.00 C 63.67,10.00 65.84,11.00 67.69,12.23 L 84.94,47.32 C 86.84,48.36 88.84,48.36 89.99,47.62 C 86.84,56.00 83.84,59.37 81.22,59.37 Z"
          fill="url(#primary-grad)" />

        <!-- Trend Line -->
        <path d="M 19.80,48.50 L 53.98,43.00 L 82.82,43.00" stroke="#38BDF8" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="1" />
        <circle cx="19.80" cy="48.50" r="3.5" fill="#1D4ED8" stroke="#38BDF8" stroke-width="1.5" />
        <circle cx="53.98" cy="43.00" r="3.5" fill="#1D4ED8" stroke="#38BDF8" stroke-width="1.5" />
        <circle cx="82.82" cy="43.00" r="3.5" fill="#1D4ED8" stroke="#38BDF8" stroke-width="1.5" />
      </g>

      <!-- Typography -->
      <text x="440" y="270" class="title">MOUSA ANALYTICS</text>
      <text x="440" y="325" class="subtitle">DATA &amp; MARKETING ANALYTICS</text>
      <text x="440" y="380" class="desc">Turning data into smart decisions and campaigns into real profit.</text>
    </svg>
  `;

  const ogBuffer = Buffer.from(ogSvg);
  const destPath = 'public/images/og-image.png';

  await sharp(ogBuffer)
    .png()
    .toFile(destPath);
  
  console.log(`✓ Generated ${destPath}`);
}

async function run() {
  try {
    await generateFavicons();
    await generateOGImage();
    console.log('🎉 Asset generation completed successfully!');
  } catch (error) {
    console.error('✗ Asset generation failed:', error);
    process.exit(1);
  }
}

run();
