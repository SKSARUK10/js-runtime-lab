import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { SEO } from '@/components/SEO/SEO';
import { Breadcrumbs, ContentHeader } from '@/components/ContentChrome/ContentChrome';
import { AdSlot } from '@/components/AdSlot/AdSlot';
import { LEARN_PAGES } from '@/content/learnPages';

/** /learn — index of all concept guides (internal-linking hub). */
export default function LearnIndex() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-300">
      <SEO
        title="Learn the JavaScript Event Loop"
        description="Plain-English guides to the call stack, Web APIs, microtasks, promises, async/await, and closures — each with a live visualizer demo."
        canonical="/learn"
        ogImage="/og/learn-index.svg"
      />
      <ContentHeader />

      <main className="max-w-3xl mx-auto px-4 pb-12">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Learn' }]} />

        <article>
          <h1 className="text-2xl font-bold text-gray-100 mb-3 flex items-center gap-2">
            <BookOpen size={22} className="text-accent-green" /> Learn the event loop
          </h1>
          <p className="text-[14px] text-gray-400 leading-relaxed mb-2">
            Short, plain-English guides to the ideas behind JavaScript&apos;s runtime: the call stack that runs
            your code, the Web APIs that wait in the background, and the queues that decide what runs next.
            Every guide ends with the interactive visualizer pre-loaded with that lesson&apos;s example, so you
            can watch the concept happen instead of just reading about it.
          </p>
          <p className="text-[14px] text-gray-400 leading-relaxed mb-6">
            New to this? Start with <Link to="/learn/what-is-the-call-stack" className="text-accent-blue hover:underline">what the call stack is</Link>,
            then continue to <Link to="/learn/web-apis-explained" className="text-accent-blue hover:underline">Web APIs</Link> and{' '}
            <Link to="/learn/microtask-vs-macrotask-queue" className="text-accent-blue hover:underline">microtasks vs macrotasks</Link>.
          </p>

          <h2 className="text-lg font-bold text-gray-200 mb-3">All guides</h2>
          <div className="space-y-3">
            {LEARN_PAGES.map((page) => (
              <article key={page.slug} className="glass-panel p-4">
                <h3 className="text-[15px] font-semibold text-gray-100 mb-1">
                  <Link to={`/learn/${page.slug}`} className="hover:text-accent-green transition-colors">
                    {page.h1}
                  </Link>
                </h3>
                <p className="text-[13px] text-gray-400 leading-relaxed mb-3">{page.metaDescription}</p>
                <Link
                  to={`/learn/${page.slug}`}
                  className="inline-flex items-center gap-1 text-[12px] text-accent-blue hover:underline"
                >
                  Read the guide <ArrowRight size={12} />
                </Link>
              </article>
            ))}
          </div>

          <p className="text-[13px] text-gray-500 mt-6">
            Ready to experiment? <Link to="/" className="text-accent-blue hover:underline">Open the full visualizer</Link> with
            any code you like, or test yourself on the{' '}
            <Link to="/interview" className="text-accent-blue hover:underline">interview questions</Link>.
          </p>

          {/* Below-the-fold ad slot (content pages only — never the tool). */}
          <div className="mt-8">
            <AdSlot />
          </div>
        </article>
      </main>
    </div>
  );
}
