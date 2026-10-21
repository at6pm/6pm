/**
 * Turns the media an article names into markup: `<picture>` with AVIF and WebP made by Astro's
 * image pipeline (JPEG as the fallback), muted loops with a poster, and inline SVG diagrams. Every
 * image carries its size, so nothing shifts as it loads.
 */
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';

import type { BlogLang } from './blog-copy';
import { diagrams, svg, type DiagramId } from './blog-diagrams';
import { clips, shots, type ClipId, type MediaText, type ShotId } from './blog-media';

const images = import.meta.glob<ImageMetadata>('../assets/blog/*/*.jpg', {
  eager: true,
  import: 'default',
});

function asset(source: string): ImageMetadata {
  const meta = images[`../assets/blog/${source}.jpg`];
  if (meta === undefined) throw new Error(`blog media: no image at src/assets/blog/${source}.jpg`);
  return meta;
}

const escape = (text: string): string =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

export interface PictureOptions {
  alt: string;
  /** Rendered widths in pixels, smallest first. */
  widths: readonly number[];
  sizes: string;
  /** The hero: fetched first, never lazily. */
  priority?: boolean;
  className?: string;
}

/** A `<picture>`: AVIF, then WebP, then JPEG, each at every width. */
export async function picture(meta: ImageMetadata, options: PictureOptions): Promise<string> {
  const { alt, sizes, priority = false, className } = options;
  const widths = options.widths.filter((w) => w <= meta.width);
  const [avif, webp, jpg] = await Promise.all(
    (['avif', 'webp', 'jpg'] as const).map((format) =>
      getImage({ src: meta, format, widths, sizes, quality: format === 'avif' ? 60 : 78 }),
    ),
  );
  const base = widths[0] ?? meta.width;
  const height = Math.round((meta.height / meta.width) * base);
  const fallback = await getImage({
    src: meta,
    format: 'jpg',
    width: widths.at(-1) ?? base,
    quality: 78,
  });
  const loading = priority
    ? 'loading="eager" fetchpriority="high"'
    : 'loading="lazy" fetchpriority="auto"';
  return [
    `<picture${className === undefined ? '' : ` class="${className}"`}>`,
    `<source type="image/avif" srcset="${avif?.srcSet.attribute ?? ''}" sizes="${sizes}">`,
    `<source type="image/webp" srcset="${webp?.srcSet.attribute ?? ''}" sizes="${sizes}">`,
    `<img src="${fallback.src}" srcset="${jpg?.srcSet.attribute ?? ''}" sizes="${sizes}" width="${base}" height="${height}" alt="${escape(alt)}" ${loading} decoding="async">`,
    '</picture>',
  ].join('');
}

/** A capture of the app, as a phone screen. */
export function shotImage(id: ShotId, lang: BlogLang): { meta: ImageMetadata; text: MediaText } {
  const shot = shots[id];
  return { meta: asset(shot.src[lang]), text: shot.text[lang] };
}

const phoneSizes = '(min-width: 760px) 300px, 64vw';
const phoneWidths = [300, 600, 900];

async function shotFigure(ids: readonly ShotId[], lang: BlogLang): Promise<string> {
  const pictures = await Promise.all(
    ids.map((id) => {
      const { meta, text } = shotImage(id, lang);
      return picture(meta, {
        alt: text.alt,
        widths: phoneWidths,
        sizes: ids.length > 1 ? '(min-width: 760px) 260px, 44vw' : phoneSizes,
        className: 'phone',
      });
    }),
  );
  const caption = ids.map((id) => shotImage(id, lang).text.caption).join(' ');
  const kind = ids.length > 1 ? 'media-pair' : 'media-shot';
  return `<figure class="media ${kind}"><div class="media-row">${pictures.join('')}</div><figcaption>${escape(caption)}</figcaption></figure>`;
}

async function clipFigure(id: ClipId, lang: BlogLang): Promise<string> {
  const clip = clips[id];
  const source = clip.src[lang];
  const { alt, caption } = clip.text[lang];
  const poster = asset(`${source}-clip`);
  const wide = poster.width > poster.height;
  const posterWidth = Math.min(poster.width, wide ? 1120 : 600);
  const still = await getImage({ src: poster, format: 'webp', width: posterWidth, quality: 74 });
  const width = wide ? 560 : 300;
  const height = Math.round((poster.height / poster.width) * width);
  return [
    `<figure class="media ${wide ? 'media-wide' : 'media-shot'}">`,
    `<div class="media-row"><video class="clip${wide ? '' : ' phone'}" width="${width}" height="${height}" poster="${still.src}" muted loop playsinline preload="none" disablepictureinpicture aria-label="${escape(alt)}" data-loop>`,
    `<source src="/blog/clips/${source}.webm" type="video/webm">`,
    `<source src="/blog/clips/${source}.mp4" type="video/mp4">`,
    '</video></div>',
    `<figcaption>${escape(caption)}</figcaption></figure>`,
  ].join('');
}

function diagramFigure(id: DiagramId, lang: BlogLang): string {
  const diagram = diagrams[id](lang);
  return `<figure class="media media-diagram">${svg(id, diagram)}<figcaption>${escape(diagram.text.caption)}</figcaption></figure>`;
}

const isShot = (id: string): id is ShotId => id in shots;
const isClip = (id: string): id is ClipId => id in clips;
const isDiagram = (id: string): id is DiagramId => id in diagrams;

/** One `<!-- media: … -->` line's figure. An unknown id fails the build. */
export async function figure(ids: readonly string[], lang: BlogLang): Promise<string> {
  const [first] = ids;
  if (first === undefined) throw new Error('blog media: an empty media line');
  if (ids.every(isShot)) return shotFigure(ids, lang);
  if (ids.length === 1 && isClip(first)) return clipFigure(first, lang);
  if (ids.length === 1 && isDiagram(first)) return diagramFigure(first, lang);
  throw new Error(`blog media: unknown media "${ids.join(' ')}"`);
}

const marker = /<!--\s*media:\s*([a-z0-9 -]+?)\s*-->/g;

/** The rendered article with each media line replaced by its figure. */
export async function withMedia(html: string, lang: BlogLang): Promise<string> {
  const found = [...html.matchAll(marker)];
  const figures = await Promise.all(
    found.map((match) => figure((match[1] ?? '').split(/\s+/), lang)),
  );
  let i = 0;
  return html.replace(marker, () => figures[i++] ?? '');
}
