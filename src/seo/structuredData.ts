// ===== JSON-LD structured data =====
// SoftwareApplication for the main tool page, FAQPage for /interview
// (built from the curated interview questions), TechArticle for /learn/*
// concept pages. Structured data is always derived from the same content
// files that render on-page, so markup and visible text cannot drift apart.

import { examples } from '@/data/examples';
import { INTERVIEW_QUESTIONS } from '@/content/interviewQuestions';
import type { LearnPage } from '@/content/learnPages';
import { SITE_URL, SITE_DEFAULTS } from './site';

export const softwareApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'JS Runtime Lab — Event Loop Visualizer',
  description: SITE_DEFAULTS.description,
  url: `${SITE_URL}/`,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: 0,
    priceCurrency: 'USD',
  },
};

export interface FaqItem {
  question: string;
  answer: string;
}

/** Legacy FAQ derived from runnable examples (kept for compatibility). */
export const INTERVIEW_FAQ_ITEMS: FaqItem[] = examples
  .filter((e) => e.explanation && e.expectedOutput && e.expectedOutput.length > 0)
  .map((e) => ({
    question: `What is the output of this JavaScript (${e.name})?`,
    answer: `Expected output, one line per console.log: ${e.expectedOutput!.join(', ')}. ${e.explanation}`,
  }));

/** Curated interview Q&A: mirrors the static /interview question index. */
export const INTERVIEW_QUESTION_FAQ_ITEMS: FaqItem[] = INTERVIEW_QUESTIONS.map((q) => ({
  question: `JavaScript event loop interview: ${q.title}`,
  answer: `Code:\n${q.code}\nExpected output, one line per console.log: ${q.expectedOutput.join(', ')}. ${q.explanation}`,
}));

export const interviewFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: INTERVIEW_QUESTION_FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

/** TechArticle markup for a /learn/* concept page. */
export function learnArticleJsonLd(page: LearnPage, path: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: page.h1,
    description: page.metaDescription,
    url: `${SITE_URL}${path}`,
    author: {
      '@type': 'Organization',
      name: 'JS Runtime Lab',
    },
    proficiencyLevel: 'Beginner',
    dependencies: page.preloadedExample,
  };
}

/** BreadcrumbList markup matching the on-page breadcrumb trail. */
export function breadcrumbJsonLd(items: { name: string; path?: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: `${SITE_URL}${item.path}` } : {}),
    })),
  };
}
