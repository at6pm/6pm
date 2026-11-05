import { Platform, type TextStyle } from 'react-native';

import type { Language } from '@6pm/i18n';

import { axesOf, familyOf, withAxes } from './font-axes';
import { faceOf, variableFamily, type Face } from './faces';
import { FONT_METRICS } from './font-metrics.generated';

/** Family names as the font files register them (tools/fonts/build_fonts.py); see `variableFamily`. */
export const families = {
  display: variableFamily('BricolageGrotesque'),
  body: Platform.select({ ios: undefined, default: 'BeVietnamPro-Regular' }),
  bodyMedium: Platform.select({ ios: undefined, default: 'BeVietnamPro-Medium' }),
  bodySemiBold: Platform.select({ ios: undefined, default: 'BeVietnamPro-SemiBold' }),
  bodyBold: Platform.select({ ios: undefined, default: 'BeVietnamPro-Bold' }),
  mono: 'IBMPlexMono-Regular',
  monoMedium: 'IBMPlexMono-Medium',
  monoSemiBold: 'IBMPlexMono-SemiBold',
  hand: 'PatrickHand-Regular',
  symbols: variableFamily('MaterialSymbolsRounded'),
} as const;

/**
 * Text set on the face's own ascent and descent, as iOS sets it. Android pads a text's box by how
 * far the face's tallest glyph rises above its ascent (Vietnamese stacked marks: a fifth of an em
 * in Be Vietnam Pro, 0.4 em in Grandstander), which drops text below the middle of a pill or row.
 */
export const UNPADDED = { includeFontPadding: false } as const satisfies TextStyle;

const BRICOLAGE_CSS = "'Bricolage Grotesque', ui-rounded, system-ui, sans-serif";
const SYSTEM_CSS = '-apple-system';

let currentDisplay: Face = faceOf(BRICOLAGE_CSS, 'display');
let currentUi: Face = faceOf(SYSTEM_CSS, 'ui');

/**
 * The line height in ems a language's script needs whatever face draws it. Thai stacks a tone mark
 * over a vowel above the letter (นี้), higher than a Latin face's line reaches, and iOS cuts it off
 * when a heading is set tighter than that, as `leading` describes; every other script fits the
 * face's own line.
 */
const SCRIPT_LINE_HEIGHT: { readonly [L in Language]?: number } = { th: 1.4 };

/**
 * The tightest a heading's lines may sit, in ems, for scripts whose letters fill the whole em:
 * Chinese, Japanese and Korean set at a Latin heading's tight leading touch the line above.
 */
const SCRIPT_MIN_LEADING: { readonly [L in Language]?: number } = {
  'zh-Hans': 1.15,
  ja: 1.15,
  ko: 1.15,
  th: 1.25,
};

let scriptLineHeight = 0;
let scriptMinLeading = 0;

/** Sets the interface language's script, for `leading`. The language provider calls it as it renders. */
export function setScriptLanguage(language: Language) {
  scriptLineHeight = SCRIPT_LINE_HEIGHT[language] ?? 0;
  scriptMinLeading = SCRIPT_MIN_LEADING[language] ?? 0;
}

/**
 * Sets the display face to the look's (`palette.dispFont`). The theme calls it as it renders, so
 * every display text drawn after a look change uses the new face.
 */
export function setDisplayFont(cssFont: string) {
  currentDisplay = faceOf(cssFont, 'display');
}

/** How much the look's display face closes up its tabular figures, in em (0 for most faces). */
export function figureTracking(): number {
  return currentDisplay.kind === 'variable' ? (currentDisplay.figureTracking ?? 0) : 0;
}

/**
 * Sets the interface face to the look's (`palette.uiFont`): SF Pro for the looks that keep the
 * system's type (Basic, Golden Hour, serious mode), the look's own text face for the rest.
 */
export function setUiFont(cssFont: string) {
  currentUi = faceOf(cssFont, 'ui');
}

/** The numeric `fontWeight` iOS takes, rounded to a hundred as the system face is drawn. */
function systemWeight(weight: number): TextStyle['fontWeight'] {
  return String(
    Math.min(900, Math.max(100, Math.round(weight / 100) * 100)),
  ) as TextStyle['fontWeight'];
}

/**
 * A face at a size and weight, set the way the browser sets it: a variable face takes the exact
 * weight on its axis and, where it has one, the optical size of the font size
 * (`font-optical-sizing: auto`); a static family picks its nearest cut; the system face (SF Pro)
 * takes the weight natively, an in-between weight (550, 650) on its axis.
 */
function setIn(face: Face, size: number, weight: number): TextStyle {
  switch (face.kind) {
    case 'system': {
      if (Platform.OS !== 'ios')
        return { fontFamily: families.body, fontWeight: systemWeight(weight) };
      const between = weight % 100 !== 0;
      return {
        fontWeight: systemWeight(weight),
        ...(between ? { fontVariationSettings: `'wght' ${weight}` } : {}),
      };
    }
    case 'static':
      return { fontFamily: face.byWeight(weight) };
    case 'variable': {
      const wght = Math.min(face.wght[1], Math.max(face.wght[0], weight));
      const opsz = face.opsz ? Math.min(face.opsz[1], Math.max(face.opsz[0], size)) : null;
      return withAxes(
        face.family,
        opsz === null ? `'wght' ${wght}` : `'opsz' ${opsz}, 'wght' ${wght}`,
      );
    }
  }
}

/**
 * The look's display face at a size and weight. Letter spacing is in em, as the prototype writes
 * it. `cssFont` draws in another look's face (a look's preview card).
 */
export function display(
  size: number,
  weight = 500,
  letterSpacingEm = 0,
  cssFont?: string,
): TextStyle {
  const face = cssFont === undefined ? currentDisplay : faceOf(cssFont, 'display');
  return {
    ...setIn(face, size, weight),
    ...UNPADDED,
    fontSize: size,
    letterSpacing: letterSpacingEm * size,
  };
}

type BodyWeight = 400 | 500 | 550 | 600 | 650 | 700 | 800;

/**
 * The look's interface face: SF Pro on iOS (the prototype's -apple-system) unless the look names
 * its own text face, Be Vietnam Pro elsewhere. `cssFont` sets another look's face (a preview).
 */
export function body(
  size: number,
  weight: BodyWeight = 400,
  letterSpacingEm = 0,
  cssFont?: string,
): TextStyle {
  const face = cssFont === undefined ? currentUi : faceOf(cssFont, 'ui');
  if (face.kind === 'system' && Platform.OS !== 'ios') {
    const family =
      weight >= 700
        ? families.bodyBold
        : weight >= 600
          ? families.bodySemiBold
          : weight >= 500
            ? families.bodyMedium
            : families.body;
    return {
      fontFamily: family,
      ...UNPADDED,
      fontSize: size,
      letterSpacing: letterSpacingEm * size,
    };
  }
  return {
    ...setIn(face, size, weight),
    ...UNPADDED,
    fontSize: size,
    letterSpacing: letterSpacingEm * size,
  };
}

/**
 * A display style with its optical size pinned (a look's `heroVar: 'opsz' 22`, so a hairline
 * serif keeps its weight at hero size). Faces without the axis, and `null`, are left alone.
 */
export function withOpticalSize(style: TextStyle, opsz: number | null): TextStyle {
  const axes = axesOf(style);
  const family = familyOf(style);
  if (opsz === null || !family || !axes?.includes("'opsz'")) return style;
  return { ...style, ...withAxes(family, axes.replace(/'opsz' [\d.]+/, `'opsz' ${opsz}`)) };
}

/** SF Pro's line height in ems, as `UIFont.systemFont(ofSize:).lineHeight` gives it. */
const SYSTEM_LINE_HEIGHT = 1.1934;

/** The line height in ems iOS sets a style's face in, SF Pro's for the system face. */
function faceEm(style: TextStyle): number {
  const family = familyOf(style);
  return (family === undefined ? undefined : FONT_METRICS[family]?.line) ?? SYSTEM_LINE_HEIGHT;
}

/**
 * A text style set at `lineHeight`, drawn where the browser draws it. Below the face's own line
 * height iOS sits each line's baseline at the bottom of the line and cuts off what rises above the
 * text's box, where the browser centres the line and lets it overflow. The text gets that room
 * back and its margins hold the box where it was (adding to any the style already sets). Text
 * that wraps takes the room as top padding, so its lines stay `lineHeight` apart; `oneLine` text
 * is set at the face's own line height instead, so a row aligned on baselines still finds its
 * baseline (iOS leaves padding out of it).
 *
 * iOS also draws nothing outside a text's box, and a face's tallest letters (a figure in a
 * Didone, Vietnamese stacked marks: Ẳ, Ỗ) and lowest (ỵ) reach past its own ascent and descent.
 * The box grows by that much as padding, and its margins take the same back, so the text and
 * everything around it stay where they were and only the ink that was cut off is drawn.
 */
export function leading(style: TextStyle, designed: number, oneLine = false): TextStyle {
  const size = style.fontSize ?? 14;
  const lineHeight = Math.max(designed, size * scriptMinLeading);
  const natural = size * Math.max(faceEm(style), scriptLineHeight);
  const lost = natural - lineHeight;
  if (Platform.OS !== 'ios') return { ...style, lineHeight };
  const set = lost <= 0 ? lineHeight : oneLine ? natural : lineHeight;
  const padTop = lost > 0 && !oneLine ? lost : 0;
  const ink = inkRoom(style, set, padTop);
  const top = padTop + ink.top;
  const shift = lost > 0 ? lost / 2 : 0;
  return {
    ...style,
    lineHeight: set,
    ...(top > 0 || shift > 0
      ? {
          marginTop: num(style.marginTop) - shift - ink.top,
          paddingTop: num(style.paddingTop) + top,
        }
      : {}),
    ...(ink.bottom > 0 || shift > 0
      ? {
          marginBottom: num(style.marginBottom) - shift - ink.bottom,
          ...(ink.bottom > 0 ? { paddingBottom: num(style.paddingBottom) + ink.bottom } : {}),
        }
      : {}),
  };
}

/**
 * How far, in points, a style's face draws above its box and below it on iOS, set at
 * `lineHeight` under `padTop` of padding: a line at least the face's own height is centred on it
 * (React Native lifts the text by half the difference), a shorter one sits its baseline a descent
 * above the line's foot. The system face, whose metrics the app does not ship, draws within its
 * line.
 */
function inkRoom(
  style: TextStyle,
  lineHeight: number,
  padTop: number,
): { top: number; bottom: number } {
  const family = familyOf(style);
  const face = family === undefined ? undefined : FONT_METRICS[family];
  if (!face) return { top: 0, bottom: 0 };
  const size = style.fontSize ?? 14;
  const own = face.line * size;
  const half = Math.max(0, (lineHeight - own) / 2);
  const above =
    padTop + (lineHeight >= own ? face.ascent * size + half : lineHeight - face.descent * size);
  const below = face.descent * size + half;
  return {
    top: Math.max(0, Math.ceil(face.inkTop * size - above)),
    bottom: Math.max(0, Math.ceil(face.inkBottom * size - below)),
  };
}

/**
 * The line a style's face draws at its size, in points: what iOS gives a line of it when no line
 * height is set, taller for a script with marks above and below. A row that must hold one line of
 * it (an odometer's digits) is this tall, so a tall serif's figures are never cut off.
 */
export function faceLineHeight(style: TextStyle): number {
  return Math.ceil((style.fontSize ?? 14) * Math.max(faceEm(style), scriptLineHeight));
}

/** A margin or padding the style sets in points, 0 when it sets none. */
function num(value: TextStyle['marginTop']): number {
  return typeof value === 'number' ? value : 0;
}

/** IBM Plex Mono for kickers, receipts and stamps, usually uppercase and letter-spaced. */
export function mono(size: number, weight: 400 | 500 | 600 = 500, letterSpacingEm = 0): TextStyle {
  return {
    fontFamily:
      weight >= 600 ? families.monoSemiBold : weight >= 500 ? families.monoMedium : families.mono,
    fontSize: size,
    letterSpacing: letterSpacingEm * size,
  };
}

/** Tabular figures for amounts that change in place. */
export const tabular: TextStyle = { fontVariant: ['tabular-nums'] };
