/**
 * Draws the website's social cards (1200×630): one per blog article, one per blog index and one
 * per home page. Each shows the title in the site's own type and colours beside the app itself:
 * the article's hero screens (`hero` in its front matter), framed as an iPhone.
 *
 * A card's file name carries a hash of the image (`/og/en/home.3f9a1c2b7e.jpg`), so a changed card
 * gets a new URL and X, Facebook and Zalo fetch it fresh instead of a copy they cached. The script
 * writes the list the site reads (`apps/web/src/data/og-images.json`), removes cards no page uses,
 * and keeps the first, unversioned paths (`/og/en/home.jpg`) answering with a redirect in
 * `apps/web/public/_redirects`, for links already shared. Run it on a Mac after adding an article,
 * changing a title or hero, or switching `ctaMode`, then commit the images:
 *
 *   pnpm exec tsx tools/scripts/og-images.ts
 *
 * Google Chrome renders each card (headless) and macOS `sips` turns it into a JPEG. Set `CHROME`
 * to use another Chrome binary.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { blogCopy, type BlogLang } from '../../apps/web/src/data/blog-copy';
import { lowFocus, shots, type ShotId } from '../../apps/web/src/data/blog-media';
import { ctaMode } from '../../apps/web/src/data/site/config';
import { siteCopy } from '../../apps/web/src/data/site/copy';

const here = path.dirname(fileURLToPath(import.meta.url));
const web = path.resolve(here, '../../apps/web');
const contentDir = path.join(web, 'src/content/blog');
const assetsDir = path.join(web, 'src/assets/blog');
const outDir = path.join(web, 'public/og');
const manifestFile = path.join(web, 'src/data/og-images.json');
const redirectsFile = path.join(web, 'public/_redirects');
const chrome =
  process.env['CHROME'] ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

interface Card {
  lang: BlogLang;
  name: string;
  kicker: string;
  title: string;
  /** One or two app screens. */
  screens: readonly ShotId[];
}

function field(markdown: string, key: string): string {
  const match = new RegExp(`^${key}: (.+)$`, 'm').exec(markdown);
  if (match?.[1] === undefined) throw new Error(`front matter has no ${key}`);
  return match[1].trim().replace(/^"(.*)"$/, '$1');
}

function screensOf(markdown: string): ShotId[] {
  const ids = field(markdown, 'hero')
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((id) => id.trim());
  return ids.map((id) => {
    if (!(id in shots)) throw new Error(`hero names an unknown screen: ${id}`);
    return id as ShotId;
  });
}

function cards(): Card[] {
  const list: Card[] = [];
  for (const lang of ['en', 'vi'] as const) {
    const t = blogCopy[lang];
    const hero = siteCopy[lang].hero;
    const kicker = ctaMode === 'store' ? hero.kickStore : hero.kickWait;
    list.push({
      lang,
      name: 'home',
      kicker,
      title: `${hero.a} ${hero.b}`,
      screens: ['today', 'close-receipt'],
    });
    list.push({
      lang,
      name: 'blog',
      kicker: t.name,
      title: t.indexLede,
      screens: ['close-caught', 'today'],
    });
    for (const file of readdirSync(path.join(contentDir, lang)).filter((f) => f.endsWith('.md'))) {
      const markdown = readFileSync(path.join(contentDir, lang, file), 'utf8');
      const engineering = field(markdown, 'tags').includes('engineering');
      list.push({
        lang,
        name: field(markdown, 'slug'),
        kicker: `${t.name} · ${engineering ? t.engineering : t.guides}`,
        title: field(markdown, 'title'),
        screens: screensOf(markdown),
      });
    }
  }
  return list;
}

const escape = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function screenUrl(id: ShotId, lang: BlogLang): string {
  return pathToFileURL(path.join(assetsDir, `${shots[id].src[lang]}.jpg`)).href;
}

function page(card: Card, fontsCss: string): string {
  const length = card.title.length;
  const size = card.name === 'blog' ? 56 : length > 48 ? 70 : length > 34 ? 80 : 90;
  const [front, back] = card.screens;
  const phone = (id: ShotId, cls: string) =>
    `<div class="phone ${cls}${lowFocus(id) ? ' low' : ''}"><img src="${screenUrl(id, card.lang)}" alt=""></div>`;
  return `<!doctype html><html lang="${card.lang}"><head><meta charset="utf-8"><style>
${fontsCss}
html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{position:relative;background:#0b0716;color:#fbf4ec;font-family:'Be Vietnam Pro',sans-serif;-webkit-font-smoothing:antialiased}
.glow{position:absolute;inset:0;background:radial-gradient(60% 90% at 100% 100%,rgba(255,133,82,.5),rgba(255,133,82,0) 70%),radial-gradient(50% 60% at 0% 0%,rgba(143,208,198,.16),rgba(143,208,198,0) 70%)}
.sun{position:absolute;right:-90px;bottom:-210px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#ffb08a,#ff8552 55%,#c9481e)}
.top{position:absolute;left:68px;top:56px;display:flex;align-items:baseline;gap:20px}
.brand{font-family:'Bricolage Grotesque';font-weight:800;font-size:52px;letter-spacing:-.05em;line-height:1}
.kicker{font-family:'IBM Plex Mono';font-weight:500;font-size:18px;letter-spacing:.14em;text-transform:uppercase;color:rgba(251,244,236,.62)}
h1{position:absolute;left:68px;width:620px;top:146px;margin:0;font-family:'Bricolage Grotesque';font-weight:700;font-variation-settings:'wdth' 80,'opsz' 96;font-size:${size}px;line-height:1.03;letter-spacing:-.012em;text-wrap:balance}
.foot{position:absolute;left:68px;bottom:50px;display:flex;align-items:center;gap:18px}
.tag{font-size:24px;font-weight:600;color:rgba(251,244,236,.86)}
.url{font-family:'IBM Plex Mono';font-weight:500;font-size:19px;letter-spacing:.06em;color:#1a0f0a;background:#ff8552;border-radius:99px;padding:7px 16px}
.phone{position:absolute;width:290px;border-radius:44px;padding:9px;background:#120c1d;box-shadow:0 0 0 1.5px rgba(251,244,236,.22),0 30px 70px rgba(11,7,22,.6)}
.phone img{display:block;width:100%;border-radius:36px}
.front{left:${back === undefined ? 802 : 742}px;top:62px;transform:rotate(-3deg)}
.back{left:930px;top:120px;width:250px;transform:rotate(5deg);opacity:.96}
.front.low{top:14px}
</style></head><body>
<div class="glow"></div><div class="sun"></div>
${back === undefined ? '' : phone(back, 'back')}${front === undefined ? '' : phone(front, 'front')}
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
const manifest: Record<string, string> = {};
try {
  for (const card of cards()) {
    const key = `${card.lang}-${card.name}`;
    const html = path.join(work, `${key}.html`);
    const png = path.join(work, `${key}.png`);
    const jpg = path.join(work, `${key}.jpg`);
    writeFileSync(html, page(card, fontsCss));
    execFileSync(
      chrome,
      [
        '--headless',
        '--disable-gpu',
        '--hide-scrollbars',
        '--allow-file-access-from-files',
        '--force-device-scale-factor=1',
        '--window-size=1200,630',
        '--virtual-time-budget=3000',
        `--screenshot=${png}`,
        pathToFileURL(html).href,
      ],
      { stdio: 'ignore' },
    );
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', png, '--out', jpg], {
      stdio: 'ignore',
    });
    const bytes = readFileSync(jpg);
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 10);
    const name = `${card.name}.${hash}.jpg`;
    mkdirSync(path.join(outDir, card.lang), { recursive: true });
    writeFileSync(path.join(outDir, card.lang, name), bytes);
    manifest[`${card.lang}/${card.name}`] = `/og/${card.lang}/${name}`;
    console.log(`${card.lang}/${name} ${Math.round(bytes.length / 1024)} KB`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

// Cards no page uses any more go; the list and the redirects follow what is left.
const used = new Set(Object.values(manifest));
for (const lang of ['en', 'vi'] as const) {
  for (const file of readdirSync(path.join(outDir, lang))) {
    if (!used.has(`/og/${lang}/${file}`)) rmSync(path.join(outDir, lang, file));
  }
}
const keys = Object.keys(manifest).sort();
writeFileSync(
  manifestFile,
  `${JSON.stringify(Object.fromEntries(keys.map((k) => [k, manifest[k]])), null, 2)}\n`,
);
writeFileSync(
  redirectsFile,
  [
    '# Written by tools/scripts/og-images.ts: the first, unversioned social card paths, kept for',
    '# links already shared, answer with the current card.',
    ...keys.map((k) => `/og/${k}.jpg ${manifest[k]} 302`),
    '',
  ].join('\n'),
);
