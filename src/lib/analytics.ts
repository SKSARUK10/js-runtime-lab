// ===== Privacy-friendly analytics helpers (Plausible) =====
// All calls are no-ops when the Plausible script hasn't loaded (ad
// blockers, placeholder config, SSR) — tracking never throws.

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string>; u?: string },
    ) => void;
  }
}

/** Fire a custom engagement event, e.g. trackEvent('visualizer_run', { example: 'basic-setTimeout' }). */
export function trackEvent(name: string, props?: Record<string, string>): void {
  try {
    if (typeof window === 'undefined') return;
    if (typeof window.plausible === 'function') {
      window.plausible(name, props ? { props } : undefined);
    }
  } catch {
    // Analytics must never break the app.
  }
}

/** Manual pageview for SPA route changes (Plausible auto-tracks the first load). */
export function trackPageview(url: string): void {
  try {
    if (typeof window === 'undefined') return;
    if (typeof window.plausible === 'function') {
      window.plausible('pageview', { u: url });
    }
  } catch {
    // Analytics must never break the app.
  }
}
