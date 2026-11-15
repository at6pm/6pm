import type { LookId } from './look-types';
import { oklchSrgbHex } from './oklch';
import {
  cafe,
  expo,
  glaze,
  lacquer,
  lantern,
  monsoon,
  neon,
  paper,
  riso,
} from './share-inks-looks';
import { byIndex, glow, PAPER, rule, seeded, type ShareInks } from './share-inks-types';

export type {
  CardBand,
  CardGlow,
  CardJar,
  CardRule,
  ShareInks,
  SunMotion,
} from './share-inks-types';

const SKIES = [
  ['#33427f', '#e0607a', '#ffad45'],
  ['#1a2456', '#b8336a', '#ff6b35'],
  ['#4a1f2e', '#a8382f', '#f08a2c'],
  ['#232a4a', '#6a4a7a', '#d47a8a'],
  ['#202b60', '#c23e6e', '#ff7b39'],
  ['#2c2758', '#7a3f72', '#e0855a'],
  ['#3b1d4a', '#d0507a', '#ffc45a'],
  ['#162048', '#8e2a58', '#ff5470'],
] as const;

const goldenSun = 'radial-gradient(circle at 50% 38%, #fff4dc 0%, #ffc46b 48%, #ffc83e 100%)';

const golden: ShareInks = {
  bg: 'linear-gradient(180deg, #202b60 0%, #79284b 52%, #733825 100%)',
  tex: 'none',
  frame: 'none',
  base: '#170914',
  ink: '#fbf4ec',
  soft: 'rgba(251,244,236,.75)',
  accent: '#ffd36e',
  kickers: 'mono',
  titleSize: 40,
  titleWeight: 500,
  lineWeight: 500,
  tracking: -0.03,
  glow: null,
  rule: rule(1, 'rgba(251,244,236,.3)', true),
  qr: { tile: '#fffdf9', ink: '#1b1e2e', ring: 'none' },
  sun: {
    full: goldenSun,
    half: 'linear-gradient(180deg, #ffc46b 50%, rgba(255,196,107,.25) 50%)',
    miss: 'inset 0 0 0 1.5px rgba(251,244,236,.4)',
    lit: '0 0 10px 1px #ff438244',
    halfLit: 'none',
    radius: '50%',
  },
  band: (i, seed) => {
    const r = seeded(seed * 31 + i * 7 + 23);
    const p = byIndex(SKIES, Math.floor(r() * SKIES.length));
    const q = byIndex(SKIES, Math.floor(r() * SKIES.length));
    return {
      bg: `linear-gradient(90deg, ${p[0]} 0%, ${p[1]} ${Math.round(40 + r() * 25)}%, ${q[2]} 100%)`,
      sh: 'none',
      txt: 'rgba(255,248,236,.92)',
    };
  },
  bandGlow: glow(0, 1, 2, 'rgba(40,10,30,.4)'),
  bands: { gap: 4, pad: 8, side: 8, r: 10 },
  bigSun: {
    bg: goldenSun,
    sh: '0 0 0 10px #ffc83e22, 0 0 70px 24px #ff438266',
    border: 'none',
    sink: 46,
    motion: 'sink',
  },
  horizon: rule(1, 'rgba(255,200,120,.55)'),
  jar: (_i, hue) => ({
    lid: oklchSrgbHex(0.55, 0.08, hue),
    body: `${oklchSrgbHex(0.86, 0.06, hue)}33`,
    edge: '1px solid rgba(255,255,255,.2)',
    fill: oklchSrgbHex(0.8, 0.12, hue),
    top: 'none',
    glow: 'inset 0 -10px 16px rgba(0,0,0,.12)',
    glyph: oklchSrgbHex(0.34, 0.09, hue),
  }),
  jarShape: { lid: '4px', body: '16px 16px 18px 18px', lidGlow: 'none' },
  shelf: { bg: 'linear-gradient(180deg, #8a5a3a, #5a3622)', sh: '0 8px 14px rgba(0,0,0,.35)' },
  receipt: { ...PAPER, best: 'rgba(255,133,82,.22)' },
};

const BASIC_BANDS = ['#0a84ff', '#5e5ce6', '#bf5af2', '#ff375f', '#ff9f0a', '#ffd60a', '#30d158'];

/** Basic: just the system. Light and dark follow the phone, as the look does. */
function basic(dark: boolean): ShareInks {
  const ink = dark ? '#ffffff' : '#000000';
  const accent = dark ? '#409cff' : '#0040dd';
  const hair = dark ? 'rgba(84,84,88,.6)' : 'rgba(60,60,67,.29)';
  const card = dark ? '#1c1c1e' : '#ffffff';
  const ground = dark ? '#000000' : '#f2f2f7';
  return {
    bg: card,
    tex: 'none',
    frame: 'none',
    base: ground,
    ink,
    soft: dark ? '#98989f' : '#6c6c70',
    accent,
    kickers: 'ui',
    titleSize: 33.5,
    titleWeight: 700,
    lineWeight: 600,
    tracking: -0.02,
    glow: null,
    rule: rule(0.5, hair),
    qr: {
      tile: '#ffffff',
      ink: '#000000',
      ring: dark ? 'none' : 'inset 0 0 0 1px rgba(60,60,67,.29)',
    },
    sun: {
      full: accent,
      half: `linear-gradient(180deg, ${accent} 50%, ${dark ? 'rgba(64,156,255,.2)' : 'rgba(0,64,221,.15)'} 50%)`,
      miss: `inset 0 0 0 1.2px ${dark ? 'rgba(84,84,88,.8)' : 'rgba(60,60,67,.3)'}`,
      lit: 'none',
      radius: '50%',
    },
    band: (i) => ({
      bg: byIndex(BASIC_BANDS, i),
      sh: 'none',
      txt: i % 7 >= 4 ? '#000000' : '#ffffff',
    }),
    bandGlow: null,
    bands: { gap: 5, pad: 12, side: 12, r: 12 },
    bigSun: {
      bg: '#ffffff',
      sh: '0 4px 14px rgba(0,0,0,.15)',
      border: '0.5px solid rgba(60,60,67,.2)',
      sink: 46,
      motion: 'none',
    },
    horizon: rule(0.5, hair),
    jar: (i) => ({
      lid: dark ? '#48484a' : '#c7c7cc',
      body: dark ? '#2c2c2e' : '#f2f2f7',
      edge: `0.5px solid ${hair}`,
      fill: byIndex(['#8e8e93', '#30d158', '#0a84ff', '#ff375f', accent], i),
      top: 'none',
      glow: 'none',
      glyph: null,
    }),
    jarShape: { lid: '3px', body: '12px 12px 14px 14px', lidGlow: 'none' },
    shelf: null,
    receipt: { ...PAPER, best: dark ? 'rgba(64,156,255,.2)' : 'rgba(0,64,221,.12)' },
  };
}

const SLATE = ['#3a3f4a', '#4a505c', '#5a606c', '#6a707c', '#7a808b', '#8a909a', '#9aa0a8'];
const slateSun = 'radial-gradient(circle at 50% 38%, #f4f1ea 0%, #d9d5cd 60%, #c4c0b8 100%)';

/** Serious mode: the same cards in the slate palette, every colour taken out. */
const serious: ShareInks = {
  bg: 'linear-gradient(180deg, #2b2f37 0%, #353a44 52%, #40454f 100%)',
  tex: 'none',
  frame: 'none',
  base: '#23262d',
  ink: '#fbf4ec',
  soft: 'rgba(251,244,236,.72)',
  accent: '#d9d5cd',
  kickers: 'mono',
  titleSize: 40,
  titleWeight: 500,
  lineWeight: 500,
  tracking: -0.03,
  glow: null,
  rule: rule(1, 'rgba(251,244,236,.25)', true),
  qr: { tile: '#fbf4ec', ink: '#23262d', ring: 'none' },
  sun: {
    full: slateSun,
    half: 'linear-gradient(180deg, #d9d5cd 50%, rgba(217,213,205,.22) 50%)',
    miss: 'inset 0 0 0 1.5px rgba(251,244,236,.35)',
    lit: 'none',
    radius: '50%',
  },
  band: (i) => ({
    bg: `linear-gradient(90deg, ${byIndex(SLATE, i)} 0%, ${byIndex(SLATE, i + 2)} 60%, ${byIndex(SLATE, i + 4)} 100%)`,
    sh: 'none',
    txt: 'rgba(251,244,236,.9)',
  }),
  bandGlow: null,
  bands: { gap: 4, pad: 8, side: 8, r: 10 },
  bigSun: {
    bg: slateSun,
    sh: '0 0 40px 8px rgba(251,244,236,.12)',
    border: 'none',
    sink: 46,
    motion: 'none',
  },
  horizon: rule(1, 'rgba(251,244,236,.4)'),
  jar: (i) => ({
    lid: '#8a909a',
    body: 'rgba(251,244,236,.1)',
    edge: '1px solid rgba(255,255,255,.2)',
    fill: byIndex(['#9aa0a8', '#c4c0b8', '#7a808b', '#b0aca4', '#d9d5cd'], i),
    top: 'none',
    glow: 'inset 0 -10px 16px rgba(0,0,0,.12)',
    glyph: '#2b2f37',
  }),
  jarShape: { lid: '4px', body: '16px 16px 18px 18px', lidGlow: 'none' },
  shelf: { bg: 'linear-gradient(180deg, #6a707c, #4a505c)', sh: '0 8px 14px rgba(0,0,0,.35)' },
  receipt: { ...PAPER, best: 'rgba(43,37,48,.1)' },
};

const BY_LOOK: Readonly<Record<Exclude<LookId, 'basic'>, ShareInks>> = {
  golden,
  lacquer,
  glaze,
  riso,
  monsoon,
  cafe,
  neon,
  expo,
  paper,
  lantern,
};

/**
 * A look's share-card inks. Serious mode is the slate card with no colour; Basic follows the
 * phone's light or dark (`dark`, the look's own palette at this hour).
 */
export function shareInksFor(input: {
  readonly look: LookId;
  readonly serious: boolean;
  readonly dark: boolean;
}): ShareInks {
  if (input.serious) return serious;
  if (input.look === 'basic') return basic(input.dark);
  return BY_LOOK[input.look];
}
