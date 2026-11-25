import type { APIRoute } from 'astro';

import { allPosts, authorPath, blogPath, modifiedOf, translationOf } from '../data/blog';
import { legalPath, legalSlugs } from '../data/legal';
import { homePath } from '../data/site/copy';
import { siteLangs, type SiteLang } from '../data/site/langs';
import { absolute } from '../data/structured-data';

/** The same page in each language it has, as site paths. */
type Alternates = Partial<Record<SiteLang, string>>;

/** One page and, when it has translations, every language plus the English default. */
interface Entry {
  path: string;
  lastmod?: Date;
  pair?: Alternates;
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
        ...siteLangs.flatMap((lang) => {
          const href = pair[lang];
          return href === undefined
            ? []
            : [`<xhtml:link rel="alternate" hreflang="${lang}" href="${absolute(href)}"/>`];
        }),
        ...(pair.en === undefined
          ? []
          : [`<xhtml:link rel="alternate" hreflang="x-default" href="${absolute(pair.en)}"/>`]),
      ].join('')
    : '';
  const changed = lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : '';
  return `<url><loc>${absolute(path)}</loc>${changed}${alternates}</url>`;
}

/** One entry per language of a page, each listing all of them. */
function each(pair: Alternates, lastmod?: Partial<Record<SiteLang, Date>>): Entry[] {
  return siteLangs.flatMap((lang) => {
    const path = pair[lang];
    const changed = lastmod?.[lang];
    return path === undefined ? [] : [{ path, pair, ...(changed ? { lastmod: changed } : {}) }];
  });
}

/** A page in all ten languages. */
const everyLang = (path: (lang: SiteLang) => string): Alternates =>
  Object.fromEntries(siteLangs.map((lang) => [lang, path(lang)]));

/** Every page the site serves, so search engines find the articles and pair each translation. */
export const GET: APIRoute = async () => {
  const posts = await allPosts();
  const latest = (lang: 'en' | 'vi') =>
    new Date(
      Math.max(...posts.filter((p) => p.data.lang === lang).map((p) => modifiedOf(p).valueOf())),
    );

  const entries: Entry[] = [
    ...each(homePath),
    ...legalSlugs.flatMap((slug) =>
      each(
        everyLang((lang) => legalPath(lang, slug)),
        Object.fromEntries(siteLangs.map((lang) => [lang, legalUpdated[`${slug}.${lang}`]])),
      ),
    ),
    ...each({ en: blogPath('en'), vi: blogPath('vi') }, { en: latest('en'), vi: latest('vi') }),
    ...each({ en: authorPath('en'), vi: authorPath('vi') }),
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
