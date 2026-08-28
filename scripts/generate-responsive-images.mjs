import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

async function generateResponsiveImages() {
  console.log('🖼️  Generating high-fidelity responsive WebP variants...');

  const tasks = [
    // Hero laptop graphics: 740px mobile width (perfect 2x for <= 370px displayed CSS width)
    {
      src: 'public/dashboard-hero-right.webp',
      out: 'public/dashboard-hero-right-mobile.webp',
      width: 740,
      q: 82,
      hasAlpha: true
    },
    {
      src: 'public/dashboard-hero-left.webp',
      out: 'public/dashboard-hero-left-mobile.webp',
      width: 740,
      q: 82,
      hasAlpha: true
    },
    // Totem gallery cards: 480px width (perfect 2x for <= 240px displayed CSS width on mobile/tablet)
    {
      src: 'public/images/gallery/pic1.webp',
      out: 'public/images/gallery/pic1-sm.webp',
      width: 480,
      q: 82
    },
    {
      src: 'public/images/gallery/pic2.webp',
      out: 'public/images/gallery/pic2-sm.webp',
      width: 480,
      q: 82
    },
    {
      src: 'public/images/gallery/pic3.webp',
      out: 'public/images/gallery/pic3-sm.webp',
      width: 480,
      q: 82
    },
    {
      src: 'public/images/gallery/pic4.webp',
      out: 'public/images/gallery/pic4-sm.webp',
      width: 480,
      q: 82
    },
    {
      src: 'public/images/gallery/pic5.webp',
      out: 'public/images/gallery/pic5-sm.webp',
      width: 480,
      q: 82
    },
    // Visual collage assets: right-sized for crisp display
    {
      src: 'src/assets/images/Portfolio.jpeg',
      out: 'src/assets/images/Portfolio.webp',
      width: 640,
      q: 80
    },
    {
      src: 'src/assets/images/amr-mousa-transparent-hq.png',
      out: 'src/assets/images/amr-mousa.webp',
      width: 320,
      q: 84,
      hasAlpha: true
    }
  ];

  for (const t of tasks) {
    const srcPath = path.join(ROOT, t.src);
    const outPath = path.join(ROOT, t.out);

    if (!fs.existsSync(srcPath)) {
      console.warn(`[WARN] Source file missing: ${t.src}`);
      continue;
    }

    const before = fs.existsSync(outPath) ? fs.statSync(outPath).size : fs.statSync(srcPath).size;
    const instance = sharp(srcPath, { limitInputPixels: false }).resize(t.width, null, {
      withoutEnlargement: true,
      fit: 'inside'
    });

    if (t.hasAlpha) {
      await instance.webp({ quality: t.q, alphaQuality: 95, effort: 6 }).toFile(outPath);
    } else {
      await instance.flatten({ background: '#0a0b0e' }).webp({ quality: t.q, effort: 6 }).toFile(outPath);
    }

    const after = fs.statSync(outPath).size;
    console.log(`  ✅ ${t.out.padEnd(48)} : ${(before / 1024).toFixed(1)} KB -> ${(after / 1024).toFixed(1)} KB (-${(((before - after) / before) * 100).toFixed(0)}%)`);
  }

  console.log('✨ Responsive WebP generation complete!');
}

generateResponsiveImages().catch(console.error);
