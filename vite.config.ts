import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sitemap from 'vite-plugin-sitemap';
import { fileURLToPath, URL } from 'node:url';
import { SITE_URL, APP_ROUTES } from './src/seo/site';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Auto-generates dist/sitemap.xml at build time from the crawlable
    // route list (src/seo/site.ts, extended from src/content/learnPages.ts).
    // generateRobotsTxt is off: public/robots.txt (with Sitemap line) wins.
    sitemap({
      hostname: SITE_URL,
      dynamicRoutes: APP_ROUTES.map((r) => r.path).filter((p) => p !== '/'),
      changefreq: Object.fromEntries(APP_ROUTES.map((r) => [r.path, r.changefreq])),
      priority: Object.fromEntries(APP_ROUTES.map((r) => [r.path, r.priority])),
      readable: true,
      generateRobotsTxt: false,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
