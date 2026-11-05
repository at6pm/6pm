import type { LookId } from './look-types';

/**
 * The widgets' materials in each look ("6pm Widgets in Looks"): the same three widgets, grid,
 * 16 pt inner padding and 23 pt corners in every look, which swaps only its sun, its jars, its
 * dots and its type. The sky itself is the look's own for the hour (`paletteFor`). Golden Hour's
 * suns follow the hour as "6pm Widgets" draws them; the other looks keep one sun all day.
 */

/** A gradient stop: a CSS colour at 0 to 1. */
export type WidgetStop = readonly [string, number];

/** A CSS box shadow, in points. A spread with no blur is a halo ring. */
export interface WidgetShadow {
  readonly x: number;
  readonly y: number;
  readonly blur: number;
  readonly spread: number;
  readonly color: string;
}

export interface WidgetFill {
  readonly kind: 'solid' | 'radial' | 'linear' | 'dots' | 'stripes';
  readonly stops: readonly WidgetStop[];
  /** A radial fill's centre, in fractions of the shape. */
  readonly center?: readonly [number, number];
  /** A linear fill's angle, CSS degrees: 180 runs top to bottom, 90 left to right. */
  readonly angle?: number;
}

export interface WidgetSun {
  readonly fill: WidgetFill;
  readonly shadows: readonly WidgetShadow[];
}

/** An inset border round the whole widget, outermost first (Sơn Mài's gold edge, Paper's mount). */
export interface WidgetFrameLine {
  readonly width: number;
  readonly color: string;
}

export interface WidgetLookInk {
  /** A ground worn instead of the sky, day and night (Basic: the system's white and grey). */
  readonly ground: { readonly day: string; readonly night: string } | null;
  readonly suns: {
    readonly day: WidgetSun | null;
    readonly noon: WidgetSun | null;
    readonly dusk: WidgetSun | null;
    readonly night: WidgetSun | null;
  };
  /** The sun's width over its height; 1 is round. */
  readonly sunAspect: number;
  readonly sunRing: { readonly width: number; readonly color: string } | null;
  readonly sunCrease: string | null;
  readonly frame: readonly WidgetFrameLine[];
  readonly dots: {
    readonly full: WidgetFill;
    readonly half: WidgetFill;
    /** A missed evening's ring. */
    readonly ring: string;
    readonly aspect: number;
    /** A ring a whole sun is drawn with (Neon Alley), and its glow. */
    readonly fullRing: { readonly width: number; readonly color: string } | null;
    readonly glow: WidgetShadow | null;
    readonly crease: string | null;
  };
  readonly jar: {
    readonly lid: string | null;
    /** The glass; null for each jar's own tinted glass. */
    readonly body: WidgetFill | null;
    /** Its edge; a null colour is the sky's ink at 18 %. */
    readonly edge: { readonly width: number; readonly color: string | null };
    readonly lidRadius: number;
    readonly radiusTop: number;
    readonly radiusBottom: number;
    readonly lidGlow: WidgetShadow | null;
    readonly glow: WidgetShadow | null;
    /** What each jar holds by its place on the shelf; empty for each jar's own colour. */
    readonly fills: readonly WidgetFill[];
    readonly icon: boolean;
  };
  readonly numberShadows: readonly WidgetShadow[];
  /** A glow the number takes once the sky is dark (Neon Alley's tube, Lantern River's light). */
  readonly numberGlow: readonly WidgetShadow[];
  readonly displayWeight: number;
  readonly numberMedium: number;
  readonly numberSmall: number;
  readonly numberTracking: number;
  readonly mono: boolean;
  readonly streakGround: string;
  readonly streakLine: string;
  readonly streakWord: string;
  readonly hatch: string;
  readonly today: string;
}

const solid = (color: string): WidgetFill => ({ kind: 'solid', stops: [[color, 0]] });
const radial = (center: readonly [number, number], ...stops: WidgetStop[]): WidgetFill => ({
  kind: 'radial',
  stops,
  center,
});
const linear = (angle: number, ...stops: WidgetStop[]): WidgetFill => ({
  kind: 'linear',
  stops,
  angle,
});
const halo = (spread: number, color: string): WidgetShadow => ({
  x: 0,
  y: 0,
  blur: 0,
  spread,
  color,
});
const glow = (blur: number, color: string, spread = 0): WidgetShadow => ({
  x: 0,
  y: 0,
  blur,
  spread,
  color,
});
const sun = (fill: WidgetFill, ...shadows: WidgetShadow[]): WidgetSun => ({ fill, shadows });
const allDay = (one: WidgetSun | null) => ({ day: one, noon: one, dusk: one, night: one });
/** Half a sun: the top half lit, the bottom a faint print of it. */
const half = (lit: string, faint: string) =>
  linear(180, [lit, 0], [lit, 0.5], [faint, 0.5], [faint, 1]);

/** Golden Hour's open evening, its today ring and the streak's strata ground. */
const GOLDEN_TODAY = '#ff8552';
const GOLDEN_HATCH = 'rgba(255,255,255,0.08)';

const GOLDEN_DUSK = radial([0.5, 0.38], ['#fff4dc', 0], ['#ffc46b', 0.48], ['#ffc83e', 1]);
const GOLDEN_DAY = radial([0.5, 0.4], ['#fffdf4', 0], ['#fff3c8', 0.7]);

const base = {
  ground: null,
  sunAspect: 1,
  sunRing: null,
  sunCrease: null,
  frame: [],
  numberShadows: [],
  numberGlow: [],
  displayWeight: 500,
  numberMedium: 44,
  numberSmall: 40,
  mono: true,
  hatch: GOLDEN_HATCH,
  today: GOLDEN_TODAY,
} as const;

const dots = (
  full: WidgetFill,
  halfFill: WidgetFill,
  ring: string,
  extra: Partial<WidgetLookInk['dots']> = {},
): WidgetLookInk['dots'] => ({
  full,
  half: halfFill,
  ring,
  aspect: 1,
  fullRing: null,
  glow: null,
  crease: null,
  ...extra,
});

export const widgetInks: Readonly<Record<LookId, WidgetLookInk>> = {
  golden: {
    ...base,
    suns: {
      day: sun(GOLDEN_DAY, halo(8, '#ffffff33'), glow(50, '#ffe1b0aa', 16)),
      noon: sun(GOLDEN_DAY, halo(8, '#ffffff33'), glow(50, '#fff07a88', 16)),
      dusk: sun(GOLDEN_DUSK, halo(8, '#ffc83e2e'), glow(60, '#ff438266', 26)),
      night: sun(radial([0.4, 0.4], ['#f4f1e6', 0], ['#d8d4c6', 0.7]), glow(30, '#ffffff22', 6)),
    },
    dots: dots(GOLDEN_DUSK, half('#ffc46b', 'rgba(255,196,107,0.22)'), 'rgba(251,244,236,0.35)'),
    jar: {
      lid: null,
      body: null,
      edge: { width: 1, color: null },
      lidRadius: 3,
      radiusTop: 10,
      radiusBottom: 12,
      lidGlow: null,
      glow: null,
      fills: [],
      icon: true,
    },
    numberTracking: -0.03,
    streakGround: '#170914',
    streakLine: 'rgba(255,200,120,0.5)',
    streakWord: '#ffd36e',
  },
  basic: {
    ...base,
    ground: { day: '#ffffff', night: '#1c1c1e' },
    suns: allDay(null),
    dots: dots(solid('#0a84ff'), half('#0a84ff', 'rgba(10,132,255,0.2)'), 'rgba(120,120,128,0.4)'),
    jar: {
      lid: '#c7c7cc',
      body: solid('rgba(120,120,128,0.12)'),
      edge: { width: 0.5, color: 'rgba(120,120,128,0.35)' },
      lidRadius: 3,
      radiusTop: 9,
      radiusBottom: 11,
      lidGlow: null,
      glow: null,
      fills: [solid('#30d158'), solid('#ff375f'), solid('#0a84ff'), solid('#ff9f0a')],
      icon: false,
    },
    displayWeight: 700,
    numberTracking: -0.02,
    mono: false,
    streakGround: '#000000',
    streakLine: 'rgba(10,132,255,0.5)',
    streakWord: '#0a84ff',
    hatch: 'rgba(255,255,255,0.1)',
    today: '#0a84ff',
  },
  lacquer: {
    ...base,
    suns: allDay(
      sun(
        radial([0.35, 0.3], ['#fff1c4', 0], ['#e8c070', 0.35], ['#b8873a', 0.75], ['#8a5a22', 1]),
        glow(30, 'rgba(226,184,99,0.3)', 6),
      ),
    ),
    frame: [{ width: 0.5, color: 'rgba(226,184,99,0.4)' }],
    dots: dots(
      radial([0.35, 0.3], ['#fff1c4', 0], ['#e2b863', 0.5], ['#8a5a22', 1]),
      half('#e2b863', 'rgba(226,184,99,0.18)'),
      'rgba(226,184,99,0.4)',
    ),
    jar: {
      lid: '#e2b863',
      body: solid('rgba(90,26,18,0.4)'),
      edge: { width: 1, color: 'rgba(226,184,99,0.55)' },
      lidRadius: 1,
      radiusTop: 4,
      radiusBottom: 6,
      lidGlow: null,
      glow: null,
      fills: [solid('#e2b863'), solid('#a8281a'), solid('#a8742c'), solid('#5a1a12')],
      icon: false,
    },
    numberMedium: 40,
    numberTracking: -0.01,
    streakGround: '#0c0706',
    streakLine: 'rgba(226,184,99,0.5)',
    streakWord: '#e2b863',
    today: '#e2b863',
  },
  glaze: {
    ...base,
    suns: allDay(
      sun(
        radial(
          [0.45, 0.4],
          ['#3c5cc0', 0],
          ['#1f409c', 0.6],
          ['rgba(31,64,156,0.35)', 0.88],
          ['rgba(31,64,156,0)', 1],
        ),
      ),
    ),
    dots: dots(
      radial([0.45, 0.4], ['#3c5cc0', 0], ['#1f409c', 0.6], ['rgba(31,64,156,0.3)', 0.9]),
      half('#1f409c', 'rgba(31,64,156,0.14)'),
      'rgba(31,64,156,0.35)',
    ),
    jar: {
      lid: '#13296a',
      body: solid('#ffffff'),
      edge: { width: 1.5, color: '#1f409c' },
      lidRadius: 3,
      radiusTop: 13,
      radiusBottom: 15,
      lidGlow: null,
      glow: null,
      fills: [
        solid('rgba(31,64,156,0.85)'),
        solid('rgba(31,64,156,0.6)'),
        solid('rgba(31,64,156,0.4)'),
        solid('rgba(31,64,156,0.7)'),
      ],
      icon: false,
    },
    numberMedium: 40,
    numberTracking: -0.01,
    streakGround: '#101c3a',
    streakLine: 'rgba(185,201,242,0.5)',
    streakWord: '#b9c9f2',
    today: '#2a4fb0',
  },
  riso: {
    ...base,
    suns: allDay(
      sun(solid('#ff4fa8'), { x: 3, y: 2, blur: 0, spread: 0, color: 'rgba(47,76,176,0.75)' }),
    ),
    numberShadows: [{ x: 2, y: 2, blur: 0, spread: 0, color: 'rgba(255,79,168,0.6)' }],
    dots: dots(solid('#ff4fa8'), half('#ff4fa8', 'rgba(255,79,168,0)'), '#2f4cb0'),
    jar: {
      lid: '#2f4cb0',
      body: solid('#f3eee3'),
      edge: { width: 2, color: '#2f4cb0' },
      lidRadius: 1,
      radiusTop: 6,
      radiusBottom: 8,
      lidGlow: null,
      glow: null,
      fills: [
        solid('#ff4fa8'),
        { kind: 'dots', stops: [['#2f4cb0', 0]] },
        solid('#ff4fa8'),
        { kind: 'dots', stops: [['#ff4fa8', 0]] },
      ],
      icon: false,
    },
    displayWeight: 400,
    numberMedium: 30,
    numberSmall: 32,
    numberTracking: 0,
    streakGround: '#1d2b62',
    streakLine: 'rgba(255,79,168,0.6)',
    streakWord: '#ff4fa8',
    today: '#ff4fa8',
  },
  monsoon: {
    ...base,
    suns: allDay(
      sun(
        radial(
          [0.35, 0.3],
          ['#ffffff', 0],
          ['#ffffff', 0.1],
          ['#d6f0ea', 0.22],
          ['#8fd6c8', 0.6],
          ['#4f9a8e', 1],
        ),
        glow(24, 'rgba(143,214,200,0.3)', 4),
      ),
    ),
    dots: dots(
      radial(
        [0.35, 0.3],
        ['#ffffff', 0],
        ['#ffffff', 0.12],
        ['#c8eee6', 0.2],
        ['#8fd6c8', 0.6],
        ['#4f9a8e', 1],
      ),
      linear(
        180,
        ['rgba(143,214,200,0.18)', 0],
        ['rgba(143,214,200,0.18)', 0.5],
        ['#8fd6c8', 0.5],
        ['#8fd6c8', 1],
      ),
      'rgba(238,243,243,0.25)',
    ),
    jar: {
      lid: '#5c707a',
      body: solid('rgba(238,243,243,0.1)'),
      edge: { width: 1, color: 'rgba(238,243,243,0.3)' },
      lidRadius: 3,
      radiusTop: 10,
      radiusBottom: 12,
      lidGlow: null,
      glow: null,
      fills: [solid('#8fd6c8'), solid('#6fb8aa'), solid('#a7c4cc'), solid('#4f9a8e')],
      icon: false,
    },
    displayWeight: 800,
    numberTracking: -0.01,
    streakGround: '#121b20',
    streakLine: 'rgba(143,214,200,0.5)',
    streakWord: '#8fd6c8',
    today: '#8fd6c8',
  },
  cafe: {
    ...base,
    suns: allDay(
      sun(radial([0.35, 0.28], ['#c08850', 0], ['#6a3a1c', 0.7], ['#4a2614', 1]), {
        x: 0,
        y: 4,
        blur: 10,
        spread: 0,
        color: 'rgba(42,23,13,0.4)',
      }),
    ),
    sunAspect: 0.86,
    sunCrease: '#2a170d',
    dots: dots(
      radial([0.35, 0.28], ['#b07a42', 0], ['#6a3a1c', 0.7]),
      radial([0.35, 0.28], ['#d6d0a0', 0], ['#a8a26a', 0.7]),
      'rgba(160,120,80,0.4)',
      { aspect: 0.86, crease: '#2a170d' },
    ),
    jar: {
      lid: '#8a6a40',
      body: linear(90, ['#c9a36a', 0], ['#d9b77e', 0.5], ['#c09558', 1]),
      edge: { width: 1, color: 'rgba(58,34,22,0.3)' },
      lidRadius: 2,
      radiusTop: 5,
      radiusBottom: 3,
      lidGlow: null,
      glow: null,
      fills: [solid('#6a3a1c'), solid('#8a5426'), solid('#4a2614'), solid('#2a170d')],
      icon: false,
    },
    displayWeight: 700,
    numberTracking: -0.01,
    streakGround: '#20130d',
    streakLine: 'rgba(231,163,92,0.5)',
    streakWord: '#e7a35c',
    today: '#e7a35c',
  },
  neon: {
    ...base,
    suns: allDay(sun(solid('rgba(255,176,32,0)'), glow(16, '#ffb020'))),
    sunRing: { width: 3, color: '#ffb020' },
    numberGlow: [glow(2, '#ffffff'), glow(8, '#ff4f9e'), glow(20, 'rgba(255,79,158,0.6)')],
    dots: dots(
      solid('rgba(255,79,158,0)'),
      half('rgba(70,227,234,0.25)', 'rgba(70,227,234,0)'),
      'rgba(150,170,170,0.3)',
      { fullRing: { width: 2, color: '#ff4f9e' }, glow: glow(6, '#ff4f9e') },
    ),
    jar: {
      lid: '#46e3ea',
      body: solid('rgba(0,0,0,0)'),
      edge: { width: 2, color: '#ff4f9e' },
      lidRadius: 3,
      radiusTop: 12,
      radiusBottom: 14,
      lidGlow: glow(8, '#46e3ea'),
      glow: glow(8, 'rgba(255,79,158,0.5)'),
      fills: [
        solid('rgba(255,79,158,0.3)'),
        solid('rgba(70,227,234,0.3)'),
        solid('rgba(255,79,158,0.3)'),
        solid('rgba(70,227,234,0.3)'),
      ],
      icon: false,
    },
    displayWeight: 400,
    numberTracking: 0,
    streakGround: '#070f0e',
    streakLine: 'rgba(255,79,158,0.6)',
    streakWord: '#ff4f9e',
    today: '#ff4f9e',
  },
  expo: {
    ...base,
    suns: allDay(
      sun(
        radial(
          [0.5, 0.5],
          ['#fff7e6', 0],
          ['#ffd8a0', 0.35],
          ['#ffb347', 0.7],
          ['rgba(255,179,71,0)', 1],
        ),
        glow(30, 'rgba(255,179,71,0.3)', 10),
      ),
    ),
    dots: dots(
      radial(
        [0.5, 0.5],
        ['#ffffff', 0],
        ['#ffffff', 0.18],
        ['#ffd8a0', 0.26],
        ['rgba(255,179,71,0.85)', 0.34],
        ['rgba(255,179,71,0)', 0.5],
      ),
      radial([0.5, 0.5], ['#ff2d2d', 0], ['#ff2d2d', 0.18], ['rgba(255,45,45,0)', 0.3]),
      'rgba(243,241,236,0.15)',
    ),
    jar: {
      lid: '#ffb347',
      body: solid('rgba(0,0,0,0)'),
      edge: { width: 1, color: 'rgba(255,179,71,0.65)' },
      lidRadius: 1,
      radiusTop: 5,
      radiusBottom: 7,
      lidGlow: glow(6, '#ffb347'),
      glow: null,
      fills: [
        { kind: 'stripes', stops: [['rgba(255,179,71,0.85)', 0]] },
        { kind: 'stripes', stops: [['rgba(255,45,45,0.75)', 0]] },
        { kind: 'stripes', stops: [['rgba(255,179,71,0.85)', 0]] },
        { kind: 'stripes', stops: [['rgba(255,45,45,0.75)', 0]] },
      ],
      icon: false,
    },
    displayWeight: 600,
    numberTracking: 0,
    streakGround: '#04060f',
    streakLine: 'rgba(255,179,71,0.5)',
    streakWord: '#ffb347',
    today: '#ffb347',
  },
  paper: {
    ...base,
    suns: allDay(
      sun(
        solid('#ffd36e'),
        { x: 0, y: 3, blur: 0, spread: -1, color: '#c9952e' },
        { x: 0, y: 8, blur: 10, spread: 0, color: 'rgba(60,40,20,0.25)' },
      ),
    ),
    frame: [
      { width: 6, color: 'rgba(60,40,20,0.2)' },
      { width: 5, color: '#e9d8bb' },
    ],
    numberShadows: [
      { x: 0, y: 1, blur: 0, spread: 0, color: 'rgba(255,255,255,0.8)' },
      { x: 0, y: 3, blur: 0, spread: 0, color: 'rgba(60,40,20,0.14)' },
    ],
    dots: dots(
      radial([0.5, 0.5], ['#ffd36e', 0], ['#ffd36e', 0.6], ['#f6c453', 0.62]),
      radial([0.5, 1], ['#ffd36e', 0], ['#ffd36e', 0.48], ['rgba(255,211,110,0)', 0.5]),
      'rgba(42,34,28,0.22)',
    ),
    jar: {
      lid: '#c9b89a',
      body: solid('#fffdf8'),
      edge: { width: 0, color: 'rgba(0,0,0,0)' },
      lidRadius: 3,
      radiusTop: 10,
      radiusBottom: 12,
      lidGlow: null,
      glow: null,
      fills: [solid('#ffd36e'), solid('#7fb25a'), solid('#e8845a'), solid('#76a1ae')],
      icon: false,
    },
    displayWeight: 700,
    numberTracking: -0.015,
    streakGround: '#2a221c',
    streakLine: 'rgba(255,211,110,0.5)',
    streakWord: '#ffd36e',
    today: '#e0902e',
  },
  lantern: {
    ...base,
    suns: allDay(
      sun(
        radial([0.5, 0.4], ['#ffd88a', 0], ['#f2a12e', 0.45], ['#e8452c', 0.8], ['#b8231c', 1]),
        glow(30, 'rgba(255,122,47,0.45)', 10),
      ),
    ),
    sunAspect: 0.84,
    numberGlow: [glow(16, 'rgba(255,140,60,0.35)')],
    dots: dots(
      radial([0.5, 0.4], ['#ffc23a', 0], ['#e8452c', 0.62], ['#b8231c', 1]),
      half('#e8452c', 'rgba(232,69,44,0.18)'),
      'rgba(255,220,160,0.3)',
      { aspect: 0.84 },
    ),
    jar: {
      lid: '#3a1a10',
      body: solid('rgba(232,69,44,0.15)'),
      edge: { width: 1, color: 'rgba(255,194,58,0.5)' },
      lidRadius: 3,
      radiusTop: 14,
      radiusBottom: 14,
      lidGlow: glow(6, '#ffc23a'),
      glow: glow(10, 'rgba(255,122,47,0.4)'),
      fills: [
        radial([0.5, 0.3], ['#ffc23a', 0], ['#e8452c', 0.7]),
        radial([0.5, 0.3], ['#ffc23a', 0], ['#f2a12e', 0.7]),
        radial([0.5, 0.3], ['#ffc23a', 0], ['#2e9e8f', 0.7]),
        radial([0.5, 0.3], ['#ffc23a', 0], ['#c81e3a', 0.7]),
      ],
      icon: false,
    },
    numberTracking: -0.01,
    streakGround: '#140810',
    streakLine: 'rgba(255,194,58,0.5)',
    streakWord: '#ffc23a',
    today: '#ffb347',
  },
};

/**
 * Where the sun stands at an hour, in fractions of the medium widget (`x`, `y`) and of the small
 * one (`xs`, `ys`): "6pm Widgets" sets it at 07:00, 13:00, 18:00 and 21:00 (the moon), and the
 * hours between take the way between.
 */
const SUN_STOPS: readonly (readonly [number, number, number, number, number])[] = [
  [7, 0.18, 0.706, 0.2, 0.765],
  [13, 0.52, 0.247, 0.55, 0.235],
  [18, 0.84, 0.753, 0.82, 0.812],
  [21, 0.8, 0.235, 0.78, 0.212],
];

export function widgetSunAt(hour: number): {
  readonly x: number;
  readonly y: number;
  readonly xs: number;
  readonly ys: number;
} {
  const first = SUN_STOPS[0];
  const last = SUN_STOPS[SUN_STOPS.length - 1];
  if (!first || !last) return { x: 0.5, y: 0.5, xs: 0.5, ys: 0.5 };
  const at = (s: readonly [number, number, number, number, number]) => ({
    x: s[1],
    y: s[2],
    xs: s[3],
    ys: s[4],
  });
  if (hour <= first[0]) return at(first);
  if (hour >= last[0]) return at(last);
  for (let i = 1; i < SUN_STOPS.length; i += 1) {
    const a = SUN_STOPS[i - 1];
    const b = SUN_STOPS[i];
    if (!a || !b || hour > b[0]) continue;
    const t = (hour - a[0]) / (b[0] - a[0]);
    const mix = (k: 1 | 2 | 3 | 4) => Math.round((a[k] + (b[k] - a[k]) * t) * 1000) / 1000;
    return { x: mix(1), y: mix(2), xs: mix(3), ys: mix(4) };
  }
  return at(last);
}

/** Which of a look's suns an hour wears: the morning's, noon's, the evening's or the moon. */
export function widgetSunKind(hour: number, closeHour: number): 'day' | 'noon' | 'dusk' | 'night' {
  if (hour >= 20.5 || hour < 6) return 'night';
  if (hour >= Math.min(closeHour, 17.5)) return 'dusk';
  if (hour >= 11) return 'noon';
  return 'day';
}

/** The streak's strata in Basic, whose evenings are all one black: the system's own dusk. */
export const BASIC_STRATA: readonly [string, string, string] = ['#0a84ff', '#5e5ce6', '#bf5af2'];

/** The close's Live Activity: the waiting slips' paper. */
export const CLOSE_SLIP = '#fbf7ef';
