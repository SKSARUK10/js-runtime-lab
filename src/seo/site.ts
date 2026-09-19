// ===== Site-wide SEO constants =====
// Single source of truth for canonical URLs, default meta, and the
// crawlable route list. Add content routes to LEARN_PAGES
// (src/content/learnPages.ts) and they are picked up by both react-router
// (src/App.tsx) and vite-plugin-sitemap automatically.

import { LEARN_PAGES } from '../content/learnPages.ts';

// NOTE: set VITE_SITE_URL in production (e.g. Netlify environment
// variables) or update the fallback below to the real production domain.
const envSiteUrl = (import.meta as unknown as { env?: Record<string, string | undefined> }).env
  ?.VITE_SITE_URL;

export const SITE_URL = (envSiteUrl ?? 'https://js-runtime-lab.netlify.app').replace(/\/$/, '');

export const SITE_NAME = 'JS Runtime Lab';

export const SITE_DEFAULTS = {
  title: 'JS Runtime Lab — Event Loop Visualizer',
  description:
    'Watch JavaScript execute one operation at a time. An interactive event loop and runtime visualizer for call stack, Web APIs, promises, and async/await.',
  ogImage: `${SITE_URL}/og/home.svg`,
};

export interface AppRoute {
  path: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export const APP_ROUTES: AppRoute[] = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/learn', changefreq: 'weekly', priority: 0.8 },
  ...LEARN_PAGES.map((p): AppRoute => ({
    path: `/learn/${p.slug}`,
    changefreq: 'monthly',
    priority: 0.9,
  })),
  { path: '/interview', changefreq: 'weekly', priority: 0.8 },
];

/** Absolute canonical URL for a given app path. */
export function canonicalFor(path: string): string {
  return `${SITE_URL}${path === '/' ? '/' : path}`;
}
