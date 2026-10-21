/**
 * Schema.org JSON-LD for the site, built from the same data the pages print, never typed by hand.
 * Nodes refer to each other by `@id`, so the organisation, the site and the author are described
 * once and every page points at them.
 */
import {
  authorPath,
  blogPath,
  faqOf,
  headlineOf,
  modifiedOf,
  ogImagePath,
  type BlogLang,
  type Post,
} from './blog';
import { blogCopy } from './blog-copy';
import {
  appStoreUrl,
  brandProfiles,
  ctaMode,
  founder,
  maxPrices,
  studioName,
  studioProfiles,
  studioUrl,
} from './site/config';
import { siteCopy } from './site/copy';

export const siteUrl = 'https://at6pm.app';

type Json = Record<string, unknown>;

const ids = {
  organization: `${siteUrl}/#organization`,
  studio: `${studioUrl}/#organization`,
  website: `${siteUrl}/#website`,
  app: `${siteUrl}/#app`,
  founder: `${siteUrl}/#founder`,
} as const;

const inLanguage = (lang: BlogLang): string => (lang === 'vi' ? 'vi-VN' : 'en');

export const absolute = (path: string): string => new URL(path, siteUrl).href;

/** Turns structured data into a `<script type="application/ld+json">` body that cannot close its tag. */
export function ldJson(data: Json): string {
  return JSON.stringify(data).replaceAll('<', '\\u003c');
}

const founderNode: Json = {
  '@type': 'Person',
  '@id': ids.founder,
  name: founder.name,
  url: absolute(authorPath('en')),
  sameAs: [founder.url, ...founder.sameAs],
  jobTitle: 'Founder',
  worksFor: { '@id': ids.studio },
};

const studioNode: Json = {
  '@type': 'Organization',
  '@id': ids.studio,
  name: studioName,
  alternateName: 'Odd Eggs Studio',
  url: studioUrl,
  sameAs: [...studioProfiles],
  founder: { '@id': ids.founder },
  address: { '@type': 'PostalAddress', addressLocality: 'Ho Chi Minh City', addressCountry: 'VN' },
};

const organizationNode: Json = {
  '@type': 'Organization',
  '@id': ids.organization,
  name: '6pm',
  alternateName: ['6pm app', 'at6pm', '6pm: Safe to Spend'],
  url: `${siteUrl}/`,
  logo: { '@type': 'ImageObject', url: absolute('/logo-256.png'), width: 256, height: 256 },
  sameAs: [...brandProfiles],
  parentOrganization: { '@id': ids.studio },
  founder: { '@id': ids.founder },
};

/** The app, as the home page describes it. No rating until the App Store has real ones to quote. */
function appNode(lang: BlogLang): Json {
  const price = maxPrices[lang];
  const currency = lang === 'vi' ? 'VND' : 'USD';
  return {
    '@type': 'MobileApplication',
    '@id': ids.app,
    name: '6pm',
    description: siteCopy[lang].meta.description,
    operatingSystem: 'iOS',
    applicationCategory: 'FinanceApplication',
    url: `${siteUrl}${lang === 'vi' ? '/vi' : '/'}`,
    ...(ctaMode === 'store' ? { downloadUrl: appStoreUrl, installUrl: appStoreUrl } : {}),
    publisher: { '@id': ids.studio },
    offers: [
      { '@type': 'Offer', name: '6pm', price: '0', priceCurrency: currency },
      { '@type': 'Offer', name: '6pm Max', price: String(price.month), priceCurrency: currency },
    ],
  };
}

/** The home page: who makes 6pm, the site, and the app. */
export function homeLd(lang: BlogLang): Json {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode,
      studioNode,
      founderNode,
      {
        '@type': 'WebSite',
        '@id': ids.website,
        name: '6pm',
        url: `${siteUrl}/`,
        inLanguage: ['en', 'vi-VN'],
        publisher: { '@id': ids.organization },
      },
      appNode(lang),
    ],
  };
}

function breadcrumb(trail: readonly (readonly [name: string, path: string])[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: absolute(path),
    })),
  };
}

/** The blog index: a collection page listing every article, with its breadcrumb. */
export function blogIndexLd(lang: BlogLang, posts: readonly Post[]): Json {
  const t = blogCopy[lang];
  const url = absolute(blogPath(lang));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': url,
        url,
        name: t.indexTitle,
        description: t.indexDescription,
        inLanguage: inLanguage(lang),
        isPartOf: { '@id': ids.website },
        publisher: { '@id': ids.organization },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: posts.map((post, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: absolute(blogPath(post.data.lang, post.data.slug)),
            name: post.data.title,
          })),
        },
      },
      breadcrumb([
        [t.home, lang === 'vi' ? '/vi' : '/'],
        [t.name, blogPath(lang)],
      ]),
      organizationNode,
    ],
  };
}

/** The author's page: who writes the articles, and what they wrote. */
export function authorLd(lang: BlogLang, posts: readonly Post[]): Json {
  const t = blogCopy[lang];
  const url = absolute(authorPath(lang));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': url,
        url,
        name: founder.name,
        inLanguage: inLanguage(lang),
        isPartOf: { '@id': ids.website },
        mainEntity: { ...founderNode, description: t.authorBio },
        hasPart: posts.map((post) => ({
          '@type': 'BlogPosting',
          headline: post.data.title,
          url: absolute(blogPath(post.data.lang, post.data.slug)),
          datePublished: post.data.pubDate.toISOString(),
        })),
      },
      breadcrumb([
        [t.home, lang === 'vi' ? '/vi' : '/'],
        [t.name, blogPath(lang)],
        [founder.name, authorPath(lang)],
      ]),
    ],
  };
}

/** One article: the post, its breadcrumb, and the FAQ it answers on the page. */
export function articleLd(post: Post, wordCount: number): Json {
  const { lang, slug } = post.data;
  const t = blogCopy[lang];
  const url = absolute(blogPath(lang, slug));
  const faq = faqOf(post);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        mainEntityOfPage: url,
        url,
        headline: headlineOf(post),
        name: post.data.title,
        description: post.data.description,
        inLanguage: inLanguage(lang),
        datePublished: post.data.pubDate.toISOString(),
        dateModified: modifiedOf(post).toISOString(),
        image: {
          '@type': 'ImageObject',
          url: absolute(ogImagePath(lang, slug)),
          width: 1200,
          height: 630,
        },
        keywords: post.data.tags.join(', '),
        wordCount,
        author: founderNode,
        publisher: organizationNode,
        isPartOf: { '@id': ids.website },
        about: { '@id': ids.app },
      },
      breadcrumb([
        [t.home, lang === 'vi' ? '/vi' : '/'],
        [t.name, blogPath(lang)],
        [post.data.title, blogPath(lang, slug)],
      ]),
      ...(faq.length > 0
        ? [
            {
              '@type': 'FAQPage',
              '@id': `${url}#faq`,
              inLanguage: inLanguage(lang),
              mainEntity: faq.map(({ q, a }) => ({
                '@type': 'Question',
                name: q,
                acceptedAnswer: { '@type': 'Answer', text: a },
              })),
            },
          ]
        : []),
      appNode(lang),
    ],
  };
}
