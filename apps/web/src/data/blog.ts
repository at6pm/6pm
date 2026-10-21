import { getCollection, type CollectionEntry } from 'astro:content';

import type { BlogLang } from './blog-copy';

export type { BlogLang };
export type Post = CollectionEntry<'blog'>;

/** English lives at the site root, Vietnamese under `/vi`; links are extensionless, no trailing slash. */
export function blogPath(lang: BlogLang, slug?: string): string {
  return `${lang === 'en' ? '' : '/vi'}/blog${slug === undefined ? '' : `/${slug}`}`;
}

/** The author's page on the blog, in one language. */
export function authorPath(lang: BlogLang): string {
  return `${blogPath(lang)}/author/khanh-quoc`;
}

/** The engineering series, told apart from the money guides on the index and in the feed. */
export function isEngineering(post: Post): boolean {
  return post.data.tags.includes('engineering');
}

/**
 * Published posts in one language, newest first. A draft, or a post whose day has not come, stays
 * off every page, the sitemap and the feeds until the site is built on or after that day.
 */
export async function postsIn(lang: BlogLang, now: Date = new Date()): Promise<Post[]> {
  const posts = await getCollection(
    'blog',
    (post) => post.data.lang === lang && !post.data.draft && post.data.pubDate <= now,
  );
  return posts.sort(
    (a, b) =>
      Number(b.data.featured) - Number(a.data.featured) ||
      b.data.pubDate.valueOf() - a.data.pubDate.valueOf() ||
      Number(isEngineering(a)) - Number(isEngineering(b)) ||
      a.data.title.localeCompare(b.data.title, lang),
  );
}

/** Every published post in both languages. */
export async function allPosts(now: Date = new Date()): Promise<Post[]> {
  const [en, vi] = await Promise.all([postsIn('en', now), postsIn('vi', now)]);
  return [...en, ...vi];
}

/** The same article in the other language, when it is published: its `related` slug found there. */
export function translationOf(post: Post, published: readonly Post[]): Post | undefined {
  const slugs = new Set(post.data.related);
  return published.find((p) => p.data.lang !== post.data.lang && slugs.has(p.data.slug));
}

/** Published same-language posts named in `related`, in their listed order. */
export function relatedOf(post: Post, published: readonly Post[]): Post[] {
  return post.data.related.flatMap((slug) =>
    published.filter((p) => p.data.lang === post.data.lang && p.data.slug === slug),
  );
}

/** The latest of published and updated, for `dateModified`, `lastmod` and the feeds. */
export function modifiedOf(post: Post): Date {
  return post.data.updatedDate ?? post.data.pubDate;
}

/** Whole minutes at a relaxed reading pace; Vietnamese counts syllables, which read faster. */
export function readingMinutes(body: string, lang: BlogLang): number {
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / (lang === 'vi' ? 280 : 230)));
}

/**
 * Links in an article body to a post that is not out yet lose their `<a>` and keep their words,
 * so a link written ahead of its target never 404s; it comes back on the build after the target
 * goes live.
 */
export function unlinkUnpublished(html: string, published: readonly Post[]): string {
  const live = new Set(published.map((p) => blogPath(p.data.lang, p.data.slug)));
  return html.replace(
    /<a href="((?:\/vi)?\/blog\/[a-z0-9-]+)(#[^"]*)?"[^>]*>([\s\S]*?)<\/a>/g,
    (link, path: string, _hash, words: string) => (live.has(path) ? link : words),
  );
}

/** The `##` heading the FAQ sits under, in each language. */
const faqHeading: Readonly<Record<BlogLang, string>> = { en: 'FAQ', vi: 'Câu hỏi thường gặp' };

/** Markdown inline syntax down to plain words, for structured data. */
function plain(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The `###` questions under the FAQ heading, each with the text under it. */
export function faqOf(post: Post): { q: string; a: string }[] {
  const lines = (post.body ?? '').split('\n');
  const start = lines.findIndex((line) => line.trim() === `## ${faqHeading[post.data.lang]}`);
  if (start < 0) return [];
  const end = lines.findIndex((line, i) => i > start && /^## /.test(line));
  const section = lines.slice(start + 1, end < 0 ? undefined : end).join('\n');
  return section
    .split(/^### /m)
    .slice(1)
    .map((block) => {
      const [q = '', ...rest] = block.split('\n');
      return { q: plain(q), a: plain(rest.join(' ')) };
    })
    .filter((item) => item.q !== '' && item.a !== '');
}

/** The first `#` heading in the body: the page's one `<h1>`, often fuller than the short title. */
export function headlineOf(post: Post): string {
  const match = /^# (.+)$/m.exec(post.body ?? '');
  return match?.[1] !== undefined ? plain(match[1]) : post.data.title;
}

/** Where a post's social card lives. */
export function ogImagePath(lang: BlogLang, slug?: string): string {
  return `/og/${lang}/${slug ?? 'blog'}.jpg`;
}
