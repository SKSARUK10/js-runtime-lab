// Pre-deploy check: every route must have a UNIQUE title tag and a meta
// description under 160 characters. Mirrors the SEO component's title
// logic (title ? `${title} | ${SITE_NAME}` : SITE_DEFAULTS.title).
// Run: node scripts/check-meta.mjs (exits non-zero on failure).
import { LEARN_PAGES } from '../src/content/learnPages.ts';
import { INTERVIEW_QUESTIONS } from '../src/content/interviewQuestions.ts';
import { SITE_NAME, SITE_DEFAULTS } from '../src/seo/site.ts';

function fullTitle(title) {
  return title ? `${title} | ${SITE_NAME}` : SITE_DEFAULTS.title;
}

const routes = [
  { path: '/', title: undefined, description: SITE_DEFAULTS.description },
  {
    path: '/learn',
    title: 'Learn the JavaScript Event Loop',
    description:
      'Plain-English guides to the call stack, Web APIs, microtasks, promises, async/await, and closures — each with a live visualizer demo.',
  },
  ...LEARN_PAGES.map((p) => ({
    path: `/learn/${p.slug}`,
    title: p.title,
    description: p.metaDescription,
  })),
  {
    path: '/interview',
    title: 'JavaScript Event Loop Interview Questions',
    description: '18 event-loop interview questions: predict the output of setTimeout, promises and async/await — then verify each answer live in the visualizer.',
  },
  {
    path: '* (404)',
    title: 'Page not found',
    description: 'This page does not exist.',
  },
];

// Cross-check: interview count referenced in copy must match data.
if (INTERVIEW_QUESTIONS.length !== 18) {
  console.log(`WARN: INTERVIEW_QUESTIONS has ${INTERVIEW_QUESTIONS.length} items but copy says 18 — update the copy.`);
}

let failures = 0;
const seenTitles = new Map();
const seenDescriptions = new Map();
for (const r of routes) {
  const t = fullTitle(r.title);
  const d = r.description;
  if (seenTitles.has(t)) {
    console.log(`DUPLICATE TITLE [${r.path}] also used by [${seenTitles.get(t)}]: "${t}"`);
    failures++;
  } else {
    seenTitles.set(t, r.path);
  }
  if (d.length >= 160) {
    console.log(`TOO LONG (${d.length} chars) description [${r.path}]: "${d}"`);
    failures++;
  }
  if (seenDescriptions.has(d)) {
    console.log(`DUPLICATE DESCRIPTION [${r.path}] also used by [${seenDescriptions.get(d)}]`);
    failures++;
  } else {
    seenDescriptions.set(d, r.path);
  }
  console.log(`${r.path}\n  title (${t.length}): ${t}\n  desc (${d.length}): ${d.slice(0, 80)}…`);
}
if (failures > 0) {
  console.log(`\n${failures} META FAILURES`);
  process.exit(1);
}
console.log(`\nMeta check passed for ${routes.length} routes (titles unique, descriptions <160 chars).`);
