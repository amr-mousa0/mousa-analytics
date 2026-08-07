import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import fs from 'fs';
import path from 'path';

// Helper to recursively scan content collections for drafts or noindex items
function getExcludedSlugs() {
  const excluded = [];
  const contentPath = path.resolve('src/content');
  
  if (!fs.existsSync(contentPath)) return excluded;
  
  function scan(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (file.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const isDraft = /draft:\s*true/.test(content);
        const isNoindex = /noindex:\s*true/.test(content);
        if (isDraft || isNoindex) {
          const slug = path.basename(file, '.md');
          excluded.push(slug);
        }
      }
    }
  }
  
  scan(contentPath);
  return [...new Set(excluded)]; // Deduplicate slugs
}

const excludedSlugs = getExcludedSlugs();

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  site: process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://mousa-analytics.vercel.app')),
  integrations: [
    react(),
    sitemap({
      filter: (page) => {
        // Exclude backups, admin dashboard, and 404 pages
        if (page.includes('/.backup') || page.includes('/admin') || page.includes('/404')) {
          return false;
        }
        // Exclude any page whose path matches an excluded draft/noindex slug
        return !excludedSlugs.some(slug => page.includes(`/${slug}/`) || page.endsWith(`/${slug}`));
      }
    })
  ],
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('gsap') || id.includes('framer-motion')) {
                return 'vendor-motion';
              }
              if (id.includes('lucide') || id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
            }
          }
        }
      }
    },
    optimizeDeps: {
      // Removed React from optimizeDeps to fix `jsxDEV is not a function` in React 19
    },
    server: {
      watch: {
        ignored: ['**/.impeccable/**'],
      },
    },
  },
});
