import { Helmet } from 'react-helmet-async';
import { SITE_NAME, SITE_DEFAULTS, canonicalFor } from '@/seo/site';

export interface SEOProps {
  /** Page-specific title. Rendered as "title | Site Name". Omit for the site default. */
  title?: string;
  /** Page-specific meta/OG description. Defaults to the site description. */
  description?: string;
  /** App path (e.g. "/interview") or absolute URL. Defaults to "/". */
  canonical?: string;
  /** Absolute or root-relative OG image. Defaults to the site OG image. */
  ogImage?: string;
  ogType?: 'website' | 'article';
  /** Set true for pages that must not be indexed (e.g. 404). */
  noindex?: boolean;
  /** JSON-LD object(s) injected as application/ld+json script(s). */
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Reusable SEO head manager. Render once per route:
 *   <SEO title="..." description="..." canonical="/interview" jsonLd={...} />
 */
export function SEO({
  title,
  description = SITE_DEFAULTS.description,
  canonical = '/',
  ogImage = SITE_DEFAULTS.ogImage,
  ogType = 'website',
  noindex = false,
  jsonLd,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_DEFAULTS.title;
  const canonicalUrl = canonical.startsWith('http') ? canonical : canonicalFor(canonical);
  const ogImageUrl = ogImage.startsWith('http')
    ? ogImage
    : `${SITE_DEFAULTS.ogImage.split('/').slice(0, 3).join('/')}${ogImage}`;
  const jsonLdList = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImageUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />

      {/* Structured data */}
      {jsonLdList.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}
