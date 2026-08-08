import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

const jobs = [
  // Gallery screenshots (hero parallax stage)
  { src: 'public/images/gallery/pic1.png', out: 'public/images/gallery/pic1.webp', q: 84 },
  { src: 'public/images/gallery/pic2.png', out: 'public/images/gallery/pic2.webp', q: 84 },
  { src: 'public/images/gallery/pic3.png', out: 'public/images/gallery/pic3.webp', q: 84 },
  { src: 'public/images/gallery/pic4.png', out: 'public/images/gallery/pic4.webp', q: 84 },
  { src: 'public/images/gallery/pic5.png', out: 'public/images/gallery/pic5.webp', q: 84 },
  // Visual collage assets (src/assets/images) - re-encoded in place next to originals
  { src: 'src/assets/images/power bi.png', out: 'src/assets/images/power bi.webp', q: 84 },
  { src: 'src/assets/images/media-buying.jpg', out: 'src/assets/images/media-buying.webp', q: 82 },
  { src: 'src/assets/images/Crm.png', out: 'src/assets/images/Crm.webp', q: 84 },
{ src: 'src/assets/images/Portfolio.jpeg', out: 'src/assets/images/Portfolio.webp', q: 78 },
  // Project covers (displayed small in coverflow cards)
  { src: 'public/images/uploads/coffee-shop.jpg', out: 'public/images/uploads/coffee-shop.webp', q: 74 },
  { src: 'public/images/uploads/oxygen-gym.jpg', out: 'public/images/uploads/oxygen-gym.webp', q: 74 },
  { src: 'public/images/uploads/marketing-roi.jpg', out: 'public/images/uploads/marketing-roi.webp', q: 74 },
];

let totalBefore = 0;
let totalAfter = 0;

for (const job of jobs) {
  const srcPath = path.join(ROOT, job.src);
  const outPath = path.join(ROOT, job.out);
  if (!fs.existsSync(srcPath)) {
    console.log(`[SKIP] missing source: ${job.src}`);
    continue;
  }
  const before = fs.statSync(srcPath).size;
  const meta = await sharp(srcPath, { limitInputPixels: false }).metadata();
  const img = sharp(srcPath, { limitInputPixels: false }).rotate();
  if (meta.format === 'png' && meta.hasAlpha) {
    img.webp({ quality: job.q, alphaQuality: 95, effort: 4 });
  } else {
    img.flatten({ background: '#0a0b0e' }).webp({ quality: job.q, effort: 4 });
  }
  await img.toFile(outPath);
  const after = fs.statSync(outPath).size;
  totalBefore += before;
  totalAfter += after;
  const pct = ((before - after) / before) * 100;
  console.log(
    `${job.src.padEnd(50)} ${(before / 1024).toFixed(0).padStart(5)}KB -> ${(after / 1024).toFixed(0).padStart(4)}KB  (-${pct.toFixed(0)}%)  ${meta.width}x${meta.height}${meta.hasAlpha ? ' alpha' : ''}`
  );
}

console.log('------------------------------------------');
console.log(`TOTAL: ${(totalBefore / 1024).toFixed(0)}KB -> ${(totalAfter / 1024).toFixed(0)}KB  (-${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(0)}%)`);