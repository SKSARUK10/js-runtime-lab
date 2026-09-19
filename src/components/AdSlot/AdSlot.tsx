import { useEffect } from 'react';
import { ADSENSE_CLIENT_ID, ADSENSE_CONTENT_SLOT, adsEnabled } from '@/config/monetization';

// Singleton: the AdSense library is requested at most once per page load,
// and only when the browser is idle so first paint is never blocked.
let loadPromise: Promise<void> | null = null;

function loadAdsense(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();
  if (document.querySelector('script[data-adsense]')) return Promise.resolve();
  if (!loadPromise) {
    loadPromise = new Promise((resolve) => {
      const inject = () => {
        try {
          const s = document.createElement('script');
          s.async = true;
          s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
          s.crossOrigin = 'anonymous';
          s.setAttribute('data-adsense', 'true');
          s.onload = () => resolve();
          s.onerror = () => resolve(); // ads must never break the page
          document.head.appendChild(s);
        } catch {
          resolve();
        }
      };
      const idle = (
        window as unknown as {
          requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void;
        }
      ).requestIdleCallback;
      if (typeof idle === 'function') {
        idle(() => inject(), { timeout: 3000 });
      } else {
        window.setTimeout(inject, 1500);
      }
    });
  }
  return loadPromise;
}

export interface AdSlotProps {
  /** Ad unit ID. Defaults to the site-wide content slot. */
  slot?: string;
  /** Accessible label for the reserved region. */
  label?: string;
}

/**
 * Reserved display-ad slot. The container keeps a fixed minimum size so
 * loading an ad can never shift layout (no CLS). Renders nothing until
 * real AdSense IDs are configured — except a dashed stand-in in dev.
 */
export function AdSlot({ slot = ADSENSE_CONTENT_SLOT, label = 'Advertisement' }: AdSlotProps) {
  useEffect(() => {
    if (!adsEnabled) return;
    let cancelled = false;
    loadAdsense().then(() => {
      if (cancelled) return;
      try {
        const w = window as unknown as { adsbygoogle?: unknown[] };
        w.adsbygoogle = w.adsbygoogle || [];
        w.adsbygoogle.push({});
      } catch {
        // Ads must never break the page.
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slot]);

  if (!adsEnabled) {
    const isDev =
      typeof import.meta !== 'undefined' &&
      (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true;
    if (!isDev) return null;
    return (
      <div
        aria-hidden="true"
        style={{ minHeight: 110 }}
        className="flex items-center justify-center rounded border border-dashed border-panel-border text-[11px] text-gray-600"
      >
        Ad slot (configure AdSense IDs to go live)
      </div>
    );
  }

  return (
    <div
      role="complementary"
      aria-label={label}
      style={{ minHeight: 110 }}
      className="flex items-center justify-center overflow-hidden"
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: 110 }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
