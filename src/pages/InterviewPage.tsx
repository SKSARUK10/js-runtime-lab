import { Link } from 'react-router-dom';
import { Brain, ChevronDown, Play, BookOpen } from 'lucide-react';
import { SEO } from '@/components/SEO/SEO';
import { Breadcrumbs, ContentHeader } from '@/components/ContentChrome/ContentChrome';
import { InterviewMode } from '@/components/InterviewMode/InterviewMode';
import { INTERVIEW_QUESTIONS } from '@/content/interviewQuestions';
import { getLearnPage } from '@/content/learnPages';
import { interviewFaqJsonLd } from '@/seo/structuredData';
import { AdSlot } from '@/components/AdSlot/AdSlot';
import { AffiliateResources } from '@/components/AffiliateResources/AffiliateResources';
import { trackEvent } from '@/lib/analytics';

const difficultyStyle = (difficulty: string) =>
  difficulty === 'Easy'
    ? 'bg-accent-green/20 text-accent-green'
    : difficulty === 'Medium'
      ? 'bg-accent-amber/20 text-accent-amber'
      : 'bg-accent-red/20 text-accent-red';

/**
 * /interview — curated "predict the output" event-loop questions.
 * Every question is static, crawlable HTML (<details>/<summary> with the
 * code, answer, and explanation in the DOM — no client state required to
 * read it), each launchable into the visualizer with one click (/?q=<id>).
 */
export default function InterviewPage() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-300">
      <SEO
        title="JavaScript Event Loop Interview Questions"
        description="18 event-loop interview questions: predict the output of setTimeout, promises and async/await — then verify each answer live in the visualizer."
        canonical="/interview"
        ogImage="/og/interview.svg"
        jsonLd={interviewFaqJsonLd}
      />
      <ContentHeader />

      <main className="max-w-3xl mx-auto px-4 pb-12">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Interview questions' }]} />

        <article>
          <h1 className="text-2xl font-bold text-gray-100 mb-3 flex items-center gap-2">
            <Brain size={22} className="text-accent-violet" /> Event loop interview questions
          </h1>
          <p className="text-[14px] text-gray-400 leading-relaxed mb-2">
            The fastest way to learn the event loop is to predict outputs and be wrong. Below are 18 classic
            &ldquo;what does this print?&rdquo; questions covering timers, promises, the microtask queue,
            async/await, the call stack, and errors. Expand any question to see the answer and why — or launch
            it straight into the visualizer to watch the queues drain step by step.
          </p>
          <p className="text-[14px] text-gray-400 leading-relaxed mb-6">
            Need the theory first? Start with{' '}
            <Link to="/learn/microtask-vs-macrotask-queue" className="text-accent-blue hover:underline">
              microtasks vs macrotasks
            </Link>{' '}
            and <Link to="/learn" className="text-accent-blue hover:underline">all the guides</Link>.
          </p>
        </article>

        <section aria-label="Interactive quiz" className="mb-8">
          <InterviewMode embedded />
        </section>

        <section aria-label="All interview questions">
          <h2 className="text-lg font-bold text-gray-200 mb-1">
            All {INTERVIEW_QUESTIONS.length} questions
          </h2>
          <p className="text-[12px] text-gray-500 mb-4">
            Every answer matches the visualizer output exactly — expand, read, then verify live.
          </p>
          <div className="space-y-3">
            {INTERVIEW_QUESTIONS.map((q, i) => {
              const related = q.relatedLearnSlug ? getLearnPage(q.relatedLearnSlug) : undefined;
              return (
                <details key={q.id} id={q.id} className="glass-panel overflow-hidden group">
                  <summary className="flex items-center gap-2 p-3 cursor-pointer list-none hover:bg-panel-hover transition-colors">
                    <span className="text-[11px] font-mono text-gray-600 w-6 flex-shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[13px] font-semibold text-gray-200 flex-1">{q.title}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${difficultyStyle(q.difficulty)}`}
                    >
                      {q.difficulty}
                    </span>
                    <ChevronDown
                      size={14}
                      className="text-gray-500 flex-shrink-0 transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <div className="px-3 pb-3 space-y-3 border-t border-panel-border pt-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Code</div>
                      <pre className="font-mono text-[12px] text-gray-300 bg-panel-surface p-2 rounded border border-panel-border overflow-auto leading-relaxed">
                        {q.code}
                      </pre>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                        Expected output
                      </div>
                      <pre className="font-mono text-[12px] text-accent-green bg-panel-surface p-2 rounded border border-panel-border overflow-auto leading-relaxed">
                        {q.expectedOutput.join('\n')}
                      </pre>
                    </div>
                    <p className="text-[12px] text-gray-300 leading-relaxed">{q.explanation}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        to={`/?q=${q.id}`}
                        onClick={() => trackEvent('interview_launch', { question: q.id })}
                        className="inline-flex items-center gap-1 text-[12px] text-accent-green hover:underline"
                      >
                        <Play size={12} /> Open in visualizer
                      </Link>
                      {related && (
                        <Link
                          to={`/learn/${related.slug}`}
                          className="inline-flex items-center gap-1 text-[12px] text-accent-blue hover:underline"
                        >
                          <BookOpen size={12} /> Learn: {related.h1}
                        </Link>
                      )}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </section>

        {/* Below-the-fold ad slot (content pages only — never the tool). */}
        <div className="mt-8">
          <AdSlot />
        </div>

        <AffiliateResources />
      </main>
    </div>
  );
}
