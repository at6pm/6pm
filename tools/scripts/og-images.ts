/**
 * Draws the website's social cards (1200×630): one per blog article, one per blog index and one
 * per home page, in the site's own type and colours, and writes them to `apps/web/public/og`.
 * Run it on a Mac after adding an article, changing a title or switching `ctaMode`, then commit
 * the images:
 *
 *   pnpm exec tsx tools/scripts/og-images.ts
 *
 * Google Chrome renders each card (headless) and macOS `sips` turns it into a JPEG. Set `CHROME`
 * to use another Chrome binary.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { blogCopy, type BlogLang } from '../../apps/web/src/data/blog-copy';
import { ctaMode } from '../../apps/web/src/data/site/config';
import { siteCopy } from '../../apps/web/src/data/site/copy';

const here = path.dirname(fileURLToPath(import.meta.url));
const web = path.resolve(here, '../../apps/web');
const contentDir = path.join(web, 'src/content/blog');
const outDir = path.join(web, 'public/og');
const chrome =
  process.env['CHROME'] ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

interface Card {
  lang: BlogLang;
  name: string;
  kicker: string;
  title: string;
}

function field(markdown: string, key: string): string {
  const match = new RegExp(`^${key}: (.+)$`, 'm').exec(markdown);
  if (match?.[1] === undefined) throw new Error(`front matter has no ${key}`);
  return match[1].trim().replace(/^"(.*)"$/, '$1');
}

function cards(): Card[] {
  const list: Card[] = [];
  for (const lang of ['en', 'vi'] as const) {
    const t = blogCopy[lang];
    const hero = siteCopy[lang].hero;
    const kicker = ctaMode === 'store' ? hero.kickStore : hero.kickWait;
    list.push({ lang, name: 'home', kicker, title: `${hero.a} ${hero.b}` });
    list.push({ lang, name: 'blog', kicker: t.name, title: t.indexLede });
    for (const file of readdirSync(path.join(contentDir, lang)).filter((f) => f.endsWith('.md'))) {
      const markdown = readFileSync(path.join(contentDir, lang, file), 'utf8');
      const engineering = field(markdown, 'tags').includes('engineering');
      list.push({
        lang,
        name: field(markdown, 'slug'),
        kicker: `${t.name} · ${engineering ? t.engineering : t.guides}`,
        title: field(markdown, 'title'),
      });
    }
  }
  return list;
}

const escape = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function page(card: Card, fontsCss: string): string {
  const long = card.title.length > 44;
  const size = card.name === 'blog' ? 58 : long ? 70 : 84;
  return `<!doctype html><html lang="${card.lang}"><head><meta charset="utf-8"><style>
${fontsCss}
html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{position:relative;background:#0b0716;color:#fbf4ec;font-family:'Be Vietnam Pro',sans-serif;-webkit-font-smoothing:antialiased}
.glow{position:absolute;inset:0;background:radial-gradient(70% 90% at 100% 100%,rgba(255,133,82,.42),rgba(255,133,82,0) 70%),radial-gradient(50% 60% at 0% 0%,rgba(143,208,198,.16),rgba(143,208,198,0) 70%)}
.sun{position:absolute;right:-120px;bottom:-200px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#ffb08a,#ff8552 55%,#c9481e)}
.horizon{position:absolute;left:0;right:0;bottom:118px;height:1px;background:rgba(251,244,236,.16)}
.top{position:absolute;left:72px;top:60px;display:flex;align-items:baseline;gap:22px}
.brand{font-family:'Bricolage Grotesque';font-weight:800;font-size:54px;letter-spacing:-.05em;line-height:1}
.kicker{font-family:'IBM Plex Mono';font-weight:500;font-size:20px;letter-spacing:.14em;text-transform:uppercase;color:rgba(251,244,236,.62)}
h1{position:absolute;left:72px;right:300px;top:168px;margin:0;font-family:'Bricolage Grotesque';font-weight:700;font-variation-settings:'wdth' 80,'opsz' 96;font-size:${size}px;line-height:1.02;letter-spacing:-.012em;text-wrap:balance}
.foot{position:absolute;left:72px;right:72px;bottom:50px;display:flex;justify-content:space-between;align-items:baseline}
.tag{font-size:26px;font-weight:600;color:rgba(251,244,236,.86)}
.url{font-family:'IBM Plex Mono';font-weight:500;font-size:22px;letter-spacing:.06em;color:#1a0f0a}
</style></head><body>
<div class="glow"></div><div class="sun"></div><div class="horizon"></div>
<div class="top"><span class="brand">6pm</span><span class="kicker">${escape(card.kicker)}</span></div>
<h1>${escape(card.title)}</h1>
<div class="foot"><span class="tag">${escape(blogCopy[card.lang].tagline)}</span><span class="url">at6pm.app</span></div>
</body></html>`;
}

const fontsCss = readFileSync(path.join(web, 'src/styles/fonts.css'), 'utf8').replaceAll(
  "url('/fonts/",
  `url('${pathToFileURL(path.join(web, 'public/fonts')).href}/`,
);
const work = mkdtempSync(path.join(tmpdir(), 'og-'));
try {
  for (const card of cards()) {
    const html = path.join(work, `${card.lang}-${card.name}.html`);
    const png = path.join(work, `${card.lang}-${card.name}.png`);
    const jpg = path.join(outDir, card.lang, `${card.name}.jpg`);
    writeFileSync(html, page(card, fontsCss));
    execFileSync(
      chrome,
      [
        '--headless',
        '--disable-gpu',
        '--hide-scrollbars',
        '--force-device-scale-factor=1',
        '--window-size=1200,630',
        '--virtual-time-budget=3000',
        `--screenshot=${png}`,
        pathToFileURL(html).href,
      ],
      { stdio: 'ignore' },
    );
    mkdirSync(path.dirname(jpg), { recursive: true });
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '84', png, '--out', jpg], {
      stdio: 'ignore',
    });
    console.log(path.relative(web, jpg));
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
