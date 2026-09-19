import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_URL } from '@/seo/site';
import { PLAUSIBLE_SRC } from '@/config/monetization';
import { trackPageview } from '@/lib/analytics';

/**
 * Injects the Plausible script once (deferred by the browser, ~1KB, never
 * render-blocking). Renders nothing.
 */
export function Analytics() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.querySelector('script[data-plausible]')) return;
    try {
      const domain = new URL(SITE_URL).hostname;
      const s = document.createElement('script');
      s.defer = true;
      s.src = PLAUSIBLE_SRC;
      s.setAttribute('data-domain', domain);
      s.setAttribute('data-plausible', 'true');
      document.head.appendChild(s);
    } catch {
      // Analytics must never break the app.
    }
  }, []);
  return null;
}

/** Fires a manual pageview on every SPA navigation (first load is automatic). */
export function RoutePageviewTracker() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    trackPageview(`${pathname}${search}`);
  }, [pathname, search]);
  return null;
}
