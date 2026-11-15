import type { CardJar, ShareInks } from '@6pm/theme';

import type { ArtBox } from './card-size';

/** A jar's lid and body as the split card draws them at 56 pt wide; other widths scale. */
const LID_INSET = 14 / 56;
const LID_H = 9;
const BODY_TOP = 7;

/**
 * One jar in the look's material at (x, y), w × h: the lid, the body with its edge and glow, the
 * fill up to `level` of the body (masked to the body's own shape, so a vase or a lantern fills as
 * its outline does), the fill's top line and, where the look draws one, the glass's highlight.
 */
export function jarBoxes(
  inks: ShareInks,
  jar: CardJar,
  box: { readonly x: number; readonly y: number; readonly w: number; readonly h: number },
  level = 0.84,
): ArtBox[] {
  const { x, y, w, h } = box;
  const k = w / 56;
  const lidInset = w * LID_INSET;
  const bodyTop = y + BODY_TOP * k;
  const bodyH = h - BODY_TOP * k;
  const body = { l: x + 1, t: bodyTop, w: w - 2, h: bodyH, r: inks.jarShape.body };
  const empty = Math.round((1 - level) * 1000) / 10;
  const out: ArtBox[] = [
    {
      l: x + lidInset,
      t: y,
      w: w - lidInset * 2,
      h: LID_H * k,
      r: inks.jarShape.lid,
      bg: jar.lid,
      sh: inks.jarShape.lidGlow,
    },
    {
      ...body,
      bg: jar.body,
      sh: jar.glow,
      ...(jar.edge === 'none' ? {} : { bd: jar.edge }),
    },
    {
      ...body,
      bg: jar.fill,
      mk: `linear-gradient(180deg, transparent ${empty}%, #000000 ${empty}%)`,
    },
  ];
  const top = /^([\d.]+)px solid (.+)$/.exec(jar.top);
  if (top?.[1] && top[2]) {
    const edge = Number(top[1]);
    out.push({
      l: body.l + edge,
      t: bodyTop + (bodyH * empty) / 100,
      w: body.w - edge * 2,
      h: edge,
      bg: top[2],
    });
  }
  if (jar.glyph !== null) {
    out.push({
      l: x + 8 * k,
      t: bodyTop + 10 * k,
      w: 5 * k,
      h: bodyH * 0.4,
      r: `${5 * k}px`,
      bg: 'rgba(255,255,255,.22)',
    });
  }
  return out;
}
