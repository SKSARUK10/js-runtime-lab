// ===== Affiliate / recommended-resource placeholders =====
// Fill in real course/book links (with your affiliate tags) when ready.
// Until then the section renders as tasteful "coming soon" cards pointing
// nowhere — replace `url: '#'` entries one by one. Only erasable
// TypeScript: safe to import from Node tooling.

export interface AffiliateResource {
  name: string;
  blurb: string;
  /** Full URL incl. affiliate tag, or '#' while still a placeholder. */
  url: string;
  cta: string;
}

export const AFFILIATE_RESOURCES: AffiliateResource[] = [
  {
    name: 'JavaScript: Understanding the Weird Parts (course)',
    blurb: 'Deep-dive video course on closures, prototypes, and the execution model this lab visualizes.',
    url: '#',
    cta: 'View course',
  },
  {
    name: 'You Don’t Know JS Yet (book series)',
    blurb: 'The classic free-to-read series on scope, async, and the event loop — ideal follow-up reading.',
    url: '#',
    cta: 'View books',
  },
  {
    name: 'Frontend interview prep course',
    blurb: 'Structured practice for event-loop and async interview questions like the ones above.',
    url: '#',
    cta: 'View course',
  },
];
