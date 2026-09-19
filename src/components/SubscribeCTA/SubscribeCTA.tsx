import { useState } from 'react';
import { Youtube, Mail, Check, AlertTriangle } from 'lucide-react';
import { YOUTUBE_CHANNEL_URL } from '@/config/monetization';
import { trackEvent } from '@/lib/analytics';

type FormStatus = 'idle' | 'sending' | 'done' | 'error';

function encodeForm(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

/**
 * Post-session subscribe CTA: YouTube link-out plus a Netlify Forms email
 * capture (no backend needed). Shown after an interview-mode session is
 * finished. Note: Netlify detects the form via the hidden static copy in
 * index.html — required because this SPA renders forms client-side.
 */
export function SubscribeCTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === 'sending') return;
    setStatus('sending');
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm({ 'form-name': 'newsletter', email: email.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('done');
      trackEvent('newsletter_signup');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section aria-label="Keep learning" className="glass-panel p-4 mt-4">
      <h3 className="text-[14px] font-bold text-gray-200 mb-1">Keep learning the event loop</h3>
      <p className="text-[12px] text-gray-400 leading-relaxed mb-3">
        New visual guides and interview drills land regularly — subscribe and don&apos;t miss them.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={YOUTUBE_CHANNEL_URL}
          target="_blank"
          rel="noopener"
          onClick={() => trackEvent('youtube_subscribe_click')}
          className="btn-default inline-flex items-center justify-center gap-2 flex-1"
        >
          <Youtube size={14} className="text-accent-red" /> Subscribe on YouTube
        </a>
        {status === 'done' ? (
          <p className="flex-1 flex items-center justify-center gap-2 text-[13px] text-accent-green bg-panel-surface border border-panel-border rounded px-3 py-2">
            <Check size={14} /> You&apos;re on the list — welcome!
          </p>
        ) : (
          <form
            name="newsletter"
            method="POST"
            data-netlify="true"
            data-netlify-honeypot="bot-field"
            onSubmit={submit}
            className="flex gap-2 flex-[2]"
          >
            <input type="hidden" name="form-name" value="newsletter" />
            <p className="hidden" aria-hidden="true">
              <label>
                Don&apos;t fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" />
              </label>
            </p>
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <div className="relative flex-1">
              <Mail
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
              />
              <input
                id="newsletter-email"
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={status === 'sending'}
                className="w-full bg-panel-surface border border-panel-border rounded pl-8 pr-2 py-2 text-[12px] text-gray-200 outline-none focus:border-accent-green/50 disabled:opacity-60"
              />
            </div>
            <button type="submit" disabled={status === 'sending'} className="btn-primary whitespace-nowrap">
              {status === 'sending' ? 'Joining…' : 'Notify me'}
            </button>
          </form>
        )}
      </div>
      {status === 'error' && (
        <p className="mt-2 flex items-center gap-1.5 text-[12px] text-accent-amber">
          <AlertTriangle size={12} /> Something went wrong — please try again.
        </p>
      )}
    </section>
  );
}
