// ===== Monetization placeholders =====
// Everything here is inert until real IDs are filled in: with placeholder
// values no third-party request is ever made (see adsEnabled).
// Only erasable TypeScript: safe to import from Node tooling.

// Google AdSense publisher ID. Replace with your real ID (page shows the
// same ID in AdSense > Account > Publisher ID).
export const ADSENSE_CLIENT_ID = 'ca-pub-XXXXXXXXXXXXXXXX';

// Ad unit ID for in-content slots (AdSense > Ads > Ad units).
export const ADSENSE_CONTENT_SLOT = 'YYYYYYYYYY';

function isPlaceholder(value: string): boolean {
  return /X{4,}|Y{4,}/.test(value);
}

/** True only when real AdSense IDs are configured. */
export const adsEnabled =
  !isPlaceholder(ADSENSE_CLIENT_ID) && !isPlaceholder(ADSENSE_CONTENT_SLOT);

// YouTube channel for the subscribe CTA.
export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@your-channel';

// Plausible script source. Override with VITE_PLAUSIBLE_SRC to self-host.
const envSrc = (import.meta as unknown as { env?: Record<string, string | undefined> }).env
  ?.VITE_PLAUSIBLE_SRC;

export const PLAUSIBLE_SRC = envSrc ?? 'https://plausible.io/js/script.js';
