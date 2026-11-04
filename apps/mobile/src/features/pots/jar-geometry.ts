/**
 * The jar's proportions at each size the Pots canvases draw it (CSS px = pt): the Pots list's
 * 32 × 42, the shelf's 52 × 66, the edge states' and Plan's 72 × 94, New jar's 84 × 110 and a jar's
 * page 140 × 184. A size in between takes the two nearest, so a jar growing into its page never
 * steps.
 */
export interface JarGeometry {
  /** The lid: inset from each side, height. */
  readonly lidInset: number;
  readonly lidH: number;
  /** The glass: top (under the lid's foot), inset from each side, corner radii. */
  readonly bodyTop: number;
  readonly bodyInset: number;
  readonly radiusTop: number;
  readonly radiusBottom: number;
  readonly borderAlpha: number;
  readonly icon: number;
  /** The highlight down the glass's left side; its height is a share of the glass. */
  readonly shineLeft: number;
  readonly shineTop: number;
  readonly shineW: number;
  readonly shineH: number;
  /** The dashed target line near the neck: from the glass's top, inset from each side. */
  readonly lineTop: number;
  readonly lineInset: number;
  /** A badge (the partner's initial, a full jar's check) and how far it sits outside the glass. */
  readonly badge: number;
  readonly badgeOut: number;
}

interface Anchor extends JarGeometry {
  readonly w: number;
  readonly h: number;
}

const ANCHORS: readonly Anchor[] = [
  {
    w: 32,
    h: 42,
    lidInset: 9,
    lidH: 5,
    bodyTop: 4,
    bodyInset: 0,
    radiusTop: 10,
    radiusBottom: 12,
    borderAlpha: 0.14,
    icon: 13,
    shineLeft: 4,
    shineTop: 6,
    shineW: 3,
    shineH: 0.38,
    lineTop: 7,
    lineInset: 5,
    badge: 16,
    badgeOut: 6,
  },
  {
    w: 52,
    h: 66,
    lidInset: 14,
    lidH: 8,
    bodyTop: 6,
    bodyInset: 0,
    radiusTop: 15,
    radiusBottom: 18,
    borderAlpha: 0.14,
    icon: 20,
    shineLeft: 6,
    shineTop: 9,
    shineW: 4,
    shineH: 0.38,
    lineTop: 10,
    lineInset: 6,
    badge: 20,
    badgeOut: 5,
  },
  {
    w: 72,
    h: 94,
    lidInset: 19,
    lidH: 11,
    bodyTop: 9,
    bodyInset: 1,
    radiusTop: 20,
    radiusBottom: 24,
    borderAlpha: 0.14,
    icon: 24,
    shineLeft: 8,
    shineTop: 12,
    shineW: 5,
    shineH: 0.38,
    lineTop: 14,
    lineInset: 8,
    badge: 24,
    badgeOut: 8,
  },
  {
    w: 84,
    h: 110,
    lidInset: 22,
    lidH: 12,
    bodyTop: 10,
    bodyInset: 1,
    radiusTop: 24,
    radiusBottom: 28,
    borderAlpha: 0.18,
    icon: 30,
    shineLeft: 9,
    shineTop: 13,
    shineW: 6,
    shineH: 0.4,
    lineTop: 16,
    lineInset: 9,
    badge: 24,
    badgeOut: 8,
  },
  {
    w: 140,
    h: 184,
    lidInset: 36,
    lidH: 17,
    bodyTop: 14,
    bodyInset: 2,
    radiusTop: 38,
    radiusBottom: 46,
    borderAlpha: 0.18,
    icon: 40,
    shineLeft: 14,
    shineTop: 18,
    shineW: 9,
    shineH: 0.42,
    lineTop: 22,
    lineInset: 12,
    badge: 30,
    badgeOut: 8,
  },
];

const KEYS = Object.keys(ANCHORS[0] ?? {}).filter(
  (k) => k !== 'w' && k !== 'h',
) as (keyof JarGeometry)[];

/** The geometry of a jar `width` × `height`: exact at the canvas sizes, blended in between. */
export function jarGeometry(width: number, height: number): JarGeometry {
  const first = ANCHORS[0] as Anchor;
  const last = ANCHORS[ANCHORS.length - 1] as Anchor;
  let lo = first;
  let hi = last;
  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const a = ANCHORS[i] as Anchor;
    const b = ANCHORS[i + 1] as Anchor;
    if (width >= a.w && width <= b.w) {
      lo = a;
      hi = b;
      break;
    }
  }
  if (width < first.w) hi = lo = first;
  if (width > last.w) hi = lo = last;
  const t = hi.w === lo.w ? 0 : (width - lo.w) / (hi.w - lo.w);
  // Outside the canvas sizes everything scales with the width; vertical sizes follow the height.
  const across = hi === lo ? width / lo.w : 1;
  const tall = height / (lo.h + (hi.h - lo.h) * t) || 1;
  const vertical = new Set<keyof JarGeometry>(['lidH', 'bodyTop', 'shineTop', 'lineTop']);
  const unscaled = new Set<keyof JarGeometry>(['borderAlpha', 'shineH']);
  const out = {} as Record<keyof JarGeometry, number>;
  for (const key of KEYS) {
    const v = lo[key] + (hi[key] - lo[key]) * t;
    out[key] = unscaled.has(key) ? v : v * across * (vertical.has(key) ? tall : 1);
  }
  return out;
}
