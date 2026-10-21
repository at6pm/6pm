import type { APIRoute } from 'astro';

import { allPosts, authorPath, blogPath, modifiedOf, translationOf } from '../data/blog';
import { legalPath, legalSlugs } from '../data/legal';
import { homePath } from '../data/site/copy';
import { absolute } from '../data/structured-data';

/** One page and, when it has a translation, both languages plus the English default. */
interface Entry {
  path: string;
  lastmod?: Date;
  pair?: { en: string; vi: string };
}

/** When each legal document was last changed, from its front matter. */
const legalUpdated = Object.fromEntries(
  Object.entries(
    import.meta.glob<{ frontmatter: { updated: string } }>('../legal/*.md', { eager: true }),
  ).map(([file, doc]) => [file.replace(/^.*\/|\.md$/g, ''), new Date(doc.frontmatter.updated)]),
);

function url({ path, lastmod, pair }: Entry): string {
  const alternates = pair
    ? [
        `<xhtml:link rel="alternate" hreflang="en" href="${absolute(pair.en)}"/>`,
        `<xhtml:link rel="alternate" hreflang="vi" href="${absolute(pair.vi)}"/>`,
        `<xhtml:link rel="alternate" hreflang="x-default" href="${absolute(pair.en)}"/>`,
      ].join('')
    : '';
  const changed = lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : '';
  return `<url><loc>${absolute(path)}</loc>${changed}${alternates}</url>`;
}

function both(pair: { en: string; vi: string }, lastmod?: Record<'en' | 'vi', Date>): Entry[] {
  return (['en', 'vi'] as const).map((lang) => ({
    path: pair[lang],
    pair,
    ...(lastmod ? { lastmod: lastmod[lang] } : {}),
  }));
}

/** Every page the site serves, so search engines find the articles and pair each translation. */
export const GET: APIRoute = async () => {
  const posts = await allPosts();
  const latest = (lang: 'en' | 'vi') =>
    new Date(
      Math.max(...posts.filter((p) => p.data.lang === lang).map((p) => modifiedOf(p).valueOf())),
    );

  const entries: Entry[] = [
    ...both({ en: homePath.en, vi: homePath.vi }),
    ...legalSlugs.flatMap((slug) => {
      const en = legalUpdated[`${slug}.en`];
      const vi = legalUpdated[`${slug}.vi`];
      return both(
        { en: legalPath('en', slug), vi: legalPath('vi', slug) },
        en && vi ? { en, vi } : undefined,
      );
    }),
    ...both({ en: blogPath('en'), vi: blogPath('vi') }, { en: latest('en'), vi: latest('vi') }),
    ...both({ en: authorPath('en'), vi: authorPath('vi') }),
    ...posts.map((post): Entry => {
      const twin = translationOf(post, posts);
      const path = blogPath(post.data.lang, post.data.slug);
      const pair =
        twin === undefined
          ? undefined
          : post.data.lang === 'en'
            ? { en: path, vi: blogPath('vi', twin.data.slug) }
            : { en: blogPath('en', twin.data.slug), vi: path };
      return { path, lastmod: modifiedOf(post), ...(pair ? { pair } : {}) };
    }),
  ];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries.map(url),
    '</urlset>',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
