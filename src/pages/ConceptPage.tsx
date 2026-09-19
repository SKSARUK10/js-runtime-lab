import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FlaskConical, ListChecks } from 'lucide-react';
import { SEO } from '@/components/SEO/SEO';
import { Breadcrumbs, ContentHeader } from '@/components/ContentChrome/ContentChrome';
import { LEARN_PAGES, getLearnPage } from '@/content/learnPages';
import { learnArticleJsonLd, breadcrumbJsonLd } from '@/seo/structuredData';
import { AdSlot } from '@/components/AdSlot/AdSlot';
import { AffiliateResources } from '@/components/AffiliateResources/AffiliateResources';
import LabPage from '@/pages/LabPage';
import NotFound from '@/pages/NotFound';

/**
 * /learn/:slug — generic concept page. Renders SEO meta, the article as
 * real semantic HTML (h1/p/ul/pre), then the existing visualizer
 * pre-loaded with the page's example. Unknown slugs fall back to 404.
 */
export default function ConceptPage() {
  const { slug } = useParams();
  const page = slug ? getLearnPage(slug) : undefined;

  if (!page) return <NotFound />;

  const path = `/learn/${page.slug}`;
  const index = LEARN_PAGES.findIndex((p) => p.slug === page.slug);
  const prev = index > 0 ? LEARN_PAGES[index - 1] : undefined;
  const next = index < LEARN_PAGES.length - 1 ? LEARN_PAGES[index + 1] : undefined;
  const related = LEARN_PAGES.filter((p) => p.slug !== page.slug);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-300">
      <SEO
        title={page.title}
        description={page.metaDescription}
        canonical={path}
        ogImage={`/og/learn-${page.slug}.svg`}
        ogType="article"
        jsonLd={[
          learnArticleJsonLd(page, path),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Learn', path: '/learn' },
            { name: page.h1 },
          ]),
        ]}
      />
      <ContentHeader backTo="/learn" backLabel="All guides" />

      <main className="max-w-3xl mx-auto px-4 pb-10">
        <Breadcrumbs
          items={[{ label: 'Home', to: '/' }, { label: 'Learn', to: '/learn' }, { label: page.h1 }]}
        />

        <article>
          <h1 className="text-2xl font-bold text-gray-100 mb-4">{page.h1}</h1>

          {page.introText.map((paragraph, i) => (
            <p key={i} className="text-[14px] text-gray-300 leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}

          <h2 className="text-lg font-bold text-gray-200 mt-6 mb-2 flex items-center gap-2">
            <ListChecks size={18} className="text-accent-green" /> Key takeaways
          </h2>
          <ul className="list-disc list-outside ml-5 space-y-1.5 mb-6">
            {page.keyTakeaways.map((point) => (
              <li key={point} className="text-[13px] text-gray-300 leading-relaxed">
                {point}
              </li>
            ))}
          </ul>

          <h2 className="text-lg font-bold text-gray-200 mt-6 mb-2 flex items-center gap-2">
            <FlaskConical size={18} className="text-accent-blue" /> Try it live
          </h2>
          <p className="text-[14px] text-gray-300 leading-relaxed mb-3">
            The visualizer below is pre-loaded with this lesson&apos;s example. Press play (or step with{' '}
            <kbd className="px-1 py-0.5 text-[11px] rounded bg-panel-surface border border-panel-border font-mono">S</kbd>)
            and watch the call stack, queues, and console. It prints:
          </p>
          <pre className="font-mono text-[12px] text-accent-green bg-panel-surface p-3 rounded border border-panel-border overflow-auto leading-relaxed mb-3">
            {page.preloadedOutput.join('\n')}
          </pre>
          <p className="text-[13px] text-gray-500 mb-2">
            The exact code running below (<a href="#visualizer" className="text-accent-blue hover:underline">jump to the demo</a>):
          </p>
          <pre className="font-mono text-[12px] text-gray-300 bg-panel-surface p-3 rounded border border-panel-border overflow-auto leading-relaxed">
            {page.preloadedExample}
          </pre>
        </article>

        {/* Prev / next + related guides: breadcrumb-style internal links. */}
        <nav aria-label="More guides" className="mt-8">
          <div className="flex items-center justify-between gap-2 mb-4">
            {prev ? (
              <Link
                to={`/learn/${prev.slug}`}
                className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-200 transition-colors"
              >
                <ArrowLeft size={12} /> {prev.h1}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                to={`/learn/${next.slug}`}
                className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-200 transition-colors"
              >
                {next.h1} <ArrowRight size={12} />
              </Link>
            )}
          </div>
          <h2 className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">Keep learning</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {related.map((rel) => (
              <li key={rel.slug} className="glass-panel p-3">
                <Link
                  to={`/learn/${rel.slug}`}
                  className="text-[13px] font-semibold text-gray-200 hover:text-accent-green transition-colors"
                >
                  {rel.h1}
                </Link>
                <p className="text-[12px] text-gray-500 leading-relaxed mt-1">{rel.metaDescription}</p>
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-gray-500 mt-4">
            Or <Link to="/" className="text-accent-blue hover:underline">open the full visualizer</Link> and
            experiment with your own code.
          </p>
        </nav>

        {/* Below-the-fold ad slot (content pages only — never the tool). */}
        <div className="mt-8">
          <AdSlot />
        </div>

        <AffiliateResources />
      </main>

      {/* Embedded interactive visualizer, pre-loaded with this page's example. */}
      <section id="visualizer" aria-label={`Interactive demo: ${page.h1}`} className="border-t border-[#1e2433]">
        <LabPage key={page.slug} initialCode={page.preloadedExample} seo={null} startWithWelcome={false} />
      </section>
    </div>
  );
}
