import type { APIRoute } from 'astro';

import { blogPath, isEngineering, postsIn, type Post } from '../data/blog';
import { appStoreUrl, playTestUrl, maxPrices, repoUrl } from '../data/site/config';
import { absolute } from '../data/structured-data';

const line = (post: Post) =>
  `- [${post.data.title}](${absolute(blogPath(post.data.lang, post.data.slug))}): ${post.data.description}`;

/** A plain summary of 6pm and an index of the articles, for language models that read the site. */
export const GET: APIRoute = async () => {
  const [en, vi] = await Promise.all([postsIn('en'), postsIn('vi')]);
  const body = [
    '# 6pm',
    '',
    '> 6pm is an iPhone app for a daily money ritual. Spends are caught through the day (Apple Pay via a Shortcuts automation, VietQR scans, receipt photos, forwarded bank and receipt emails, voice, a keypad), and at a close time (6pm by default) the day is swiped through in about a minute. The next morning starts with one number: safe to spend today.',
    '',
    '- Made by Odd Eggs, a small studio in Saigon, Vietnam. Open source (Apache 2.0): ' + repoUrl,
    '- English and Vietnamese. Works in any currency; VietQR payments in Vietnam hand off to the bank app.',
    '- 6pm never asks for a bank login and never moves money; it only counts. Transactions live on the phone, encrypted.',
    '- Capture, the daily close and privacy are free. 6pm Max (US $' +
      `${maxPrices.en.month}/month or $${maxPrices.en.year}/year; Vietnam ${maxPrices.vi.month.toLocaleString('vi-VN')}₫/month or ${maxPrices.vi.year.toLocaleString('vi-VN')}₫/year, 7 days free) adds every look, unlimited Ask and pots, Travel mode, and encrypted backup and export.`,
    '- On the App Store: ' + appStoreUrl,
    '- On Android: a closed test on Google Play (6pm: Safe to Spend). Testers leave their Google account on the home page and are added by hand, then opt in at ' +
      playTestUrl,
    '',
    '## Guides (English)',
    '',
    ...en.filter((post) => !isEngineering(post)).map(line),
    '',
    '## Hướng dẫn (Tiếng Việt)',
    '',
    ...vi.map(line),
    '',
    '## Engineering',
    '',
    ...en.filter(isEngineering).map(line),
    '',
    '## Pages',
    '',
    `- [Home](${absolute('/')}), [Trang chủ](${absolute('/vi')})`,
    `- [Privacy](${absolute('/privacy')}), [Terms](${absolute('/terms')})`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
