import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const VP = 'C:/Users/HP/AppData/Local/Temp/opencode/vp';
const names = ['hero-top', 'hero-gallery', 'collage', 'services', 'projects'];

for (const name of names) {
  const before = path.join(VP, `before-${name}.png`);
  const after = path.join(VP, `after-${name}.png`);
  const diffOut = path.join(VP, `diff-${name}.png`);
  const b = await sharp(before).raw().toBuffer({ resolveWithObject: true });
  const a = await sharp(after).raw().toBuffer({ resolveWithObject: true });
  const w = b.info.width;
  const h = b.info.height;
  const ch = b.info.channels;
  const bb = b.data;
  const aa = a.data;
  let diffPixels = 0;
  let maxDiff = 0;
  let sumDiff = 0;
  for (let i = 0; i < bb.length; i += ch) {
    const d = Math.max(Math.abs(bb[i] - aa[i]), Math.abs(bb[i + 1] - aa[i + 1]), Math.abs(bb[i + 2] - aa[i + 2]));
    if (d > 40) diffPixels++;
    if (d > maxDiff) maxDiff = d;
    sumDiff += d;
  }
  const total = w * h;
  const pct = ((diffPixels / total) * 100).toFixed(3);
  const mean = (sumDiff / total).toFixed(2);
  console.log(`${name}: diffPixels=${diffPixels} (${pct}%) meanDiff=${mean} maxDiff=${maxDiff}`);

  const diffBuf = Buffer.alloc(bb.length);
  for (let i = 0; i < bb.length; i += ch) {
    const d = Math.max(Math.abs(bb[i] - aa[i]), Math.abs(bb[i + 1] - aa[i + 1]), Math.abs(bb[i + 2] - aa[i + 2]));
    const v = d > 30 ? 255 : 0;
    diffBuf[i] = v;
    diffBuf[i + 1] = 0;
    diffBuf[i + 2] = v;
    if (ch === 4) diffBuf[i + 3] = 255;
  }
  await sharp(diffBuf, { raw: { width: w, height: h, channels: ch } }).png().toFile(diffOut);
}
console.log('diff done');