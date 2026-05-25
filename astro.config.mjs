import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://amr-mousa.com',
  integrations: [
    sitemap({
      filter: (page) => {
        // Exclude backups, admin dashboard, and 404 pages from the production sitemap
        return !page.includes('/.backup') && 
               !page.includes('/admin') && 
               !page.includes('/404');
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
    server: {
      watch: {
        ignored: ['**/.impeccable/**'],
      },
    },
  },
});
