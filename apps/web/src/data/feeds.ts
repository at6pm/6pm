import { blogPath, isEngineering, modifiedOf, postsIn, type BlogLang, type Post } from './blog';
import { blogCopy } from './blog-copy';
import { founder } from './site/config';
import { absolute } from './structured-data';

function escape(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function item(post: Post): string {
  const url = absolute(blogPath(post.data.lang, post.data.slug));
  return [
    '<item>',
    `<title>${escape(post.data.title)}</title>`,
    `<link>${url}</link>`,
    `<guid isPermaLink="true">${url}</guid>`,
    `<description>${escape(post.data.description)}</description>`,
    `<pubDate>${post.data.pubDate.toUTCString()}</pubDate>`,
    `<dc:creator>${escape(founder.name)}</dc:creator>`,
    ...post.data.tags.map((tag) => `<category>${escape(tag)}</category>`),
    '</item>',
  ].join('');
}

/** An RSS 2.0 feed of one language's posts, or of the engineering series alone. */
export async function feed(lang: BlogLang, only?: 'engineering'): Promise<Response> {
  const t = blogCopy[lang];
  const posts = (await postsIn(lang)).filter((post) => only === undefined || isEngineering(post));
  const self = absolute(`${blogPath(lang)}${only === undefined ? '/rss.xml' : '/engineering.xml'}`);
  const built = posts.reduce((latest, post) => Math.max(latest, modifiedOf(post).valueOf()), 0);
  const title = only === undefined ? `6pm ${t.name}` : `6pm ${t.engineering}`;
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    '<channel>',
    `<title>${escape(title)}</title>`,
    `<link>${absolute(blogPath(lang))}</link>`,
    `<description>${escape(only === undefined ? t.indexDescription : t.engineeringLede)}</description>`,
    `<language>${lang === 'vi' ? 'vi-VN' : 'en'}</language>`,
    `<lastBuildDate>${new Date(built).toUTCString()}</lastBuildDate>`,
    `<atom:link href="${self}" rel="self" type="application/rss+xml"/>`,
    ...posts.map(item),
    '</channel>',
    '</rss>',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
