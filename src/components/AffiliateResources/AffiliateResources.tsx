import { ExternalLink, HeartHandshake } from 'lucide-react';
import { AFFILIATE_RESOURCES } from '@/content/affiliates';

/**
 * "Support / Recommended resources" footer section for content pages.
 * Placeholder cards are clearly marked until real affiliate URLs land.
 */
export function AffiliateResources() {
  return (
    <section aria-label="Recommended resources" className="mt-8">
      <h2 className="text-lg font-bold text-gray-200 mb-1 flex items-center gap-2">
        <HeartHandshake size={18} className="text-accent-green" /> Support the lab, go deeper
      </h2>
      <p className="text-[12px] text-gray-500 mb-4">
        Hand-picked resources that pair well with this guide. Some links may be affiliate links — they
        support the lab at no extra cost to you.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {AFFILIATE_RESOURCES.map((item) => {
          const isPlaceholder = item.url === '#';
          return (
            <article key={item.name} className="glass-panel p-3 flex flex-col">
              <h3 className="text-[13px] font-semibold text-gray-200 mb-1">{item.name}</h3>
              <p className="text-[12px] text-gray-400 leading-relaxed flex-1">{item.blurb}</p>
              {isPlaceholder ? (
                <span className="mt-3 inline-flex items-center gap-1 text-[12px] text-gray-600">
                  {item.cta} <span className="text-[10px] px-1 rounded bg-panel-surface border border-panel-border">soon</span>
                </span>
              ) : (
                <a
                  href={item.url}
                  target="_blank"
                  rel="sponsored nofollow noopener"
                  className="mt-3 inline-flex items-center gap-1 text-[12px] text-accent-blue hover:underline"
                >
                  {item.cta} <ExternalLink size={12} />
                </a>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
