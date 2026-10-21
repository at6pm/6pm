/**
 * A few drawing words for the articles' diagrams: inline SVG, 400 units wide so it reads at phone
 * width without shrinking, coloured by the reading pages' tokens (`blog-media.css`), so it follows
 * light and dark with the page.
 */

export const W = 400;

/** What a diagram says to a screen reader, and the line under it. */
export interface DiagramText {
  readonly title: string;
  readonly desc: string;
  readonly caption: string;
}

export interface Diagram {
  readonly text: DiagramText;
  readonly height: number;
  readonly body: string;
}

const escape = (text: string): string =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

type Tone = 'card' | 'accent' | 'soft' | 'line' | 'track' | 'ink';

/** A rounded box. */
export function box(
  x: number,
  y: number,
  w: number,
  h: number,
  tone: Tone = 'card',
  r = 12,
): string {
  return `<rect class="dg-${tone}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
}

interface TextOptions {
  /** `label` (body text), `strong`, `mono` (small caps label), `big` (display number), `on` (on the accent). */
  cls?: 'label' | 'strong' | 'mono' | 'big' | 'on' | 'faint' | 'num';
  anchor?: 'start' | 'middle' | 'end';
  size?: number;
}

/** One line of text; an array draws lines 1.3 em apart. */
export function text(
  x: number,
  y: number,
  words: string | readonly string[],
  options: TextOptions = {},
): string {
  const { cls = 'label', anchor = 'start', size } = options;
  const lines = typeof words === 'string' ? [words] : words;
  const style = size === undefined ? '' : ` style="font-size:${size}px"`;
  const tspans = lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : '1.4em'}">${escape(line)}</tspan>`)
    .join('');
  return `<text class="dg-${cls}" x="${x}" y="${y}" text-anchor="${anchor}"${style}>${tspans}</text>`;
}

/** The head of an arrow ending at (x, y), pointing along (dx, dy). */
function head(x: number, y: number, dx: number, dy: number): string {
  const length = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / length, dy / length];
  const [bx, by] = [x - ux * 8, y - uy * 8];
  const [px, py] = [-uy * 4.5, ux * 4.5];
  const points = [
    [x, y],
    [bx + px, by + py],
    [bx - px, by - py],
  ]
    .map(([a = 0, b = 0]) => `${a.toFixed(1)},${b.toFixed(1)}`)
    .join(' ');
  return `<polygon class="dg-head" points="${points}"/>`;
}

/** A straight arrow. */
export function arrow(x1: number, y1: number, x2: number, y2: number): string {
  return `<path class="dg-arrow" d="M${x1} ${y1}L${x2} ${y2}"/>${head(x2, y2, x2 - x1, y2 - y1)}`;
}

/** An arrow along straight segments through the given points. */
export function route(points: readonly (readonly [number, number])[]): string {
  const d = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join('');
  const [x2, y2] = points.at(-1) ?? [0, 0];
  const [x1, y1] = points.at(-2) ?? [0, 0];
  return `<path class="dg-arrow" d="${d}"/>${head(x2, y2, x2 - x1, y2 - y1)}`;
}

/** A filled bar. */
export function bar(x: number, y: number, w: number, h: number, tone: Tone = 'accent'): string {
  return `<rect class="dg-${tone}" x="${x}" y="${y}" width="${Math.max(0, w)}" height="${h}" rx="${h / 2}"/>`;
}

/** Wraps a diagram's parts into an accessible `<svg>`. */
export function svg(id: string, diagram: Diagram): string {
  const { title, desc } = diagram.text;
  return `<svg class="dg" viewBox="0 0 ${W} ${diagram.height}" width="${W}" height="${diagram.height}" role="img" aria-labelledby="${id}-t ${id}-d"><title id="${id}-t">${escape(title)}</title><desc id="${id}-d">${escape(desc)}</desc>${diagram.body}</svg>`;
}
