import { describe, expect, it, jest } from '@jest/globals';
import type { TextStyle } from 'react-native';

jest.mock('../../../modules/font-instance', () => ({ fontInstance: null }));

import { FONT_METRICS } from './font-metrics.generated';
import { body, display, leading, setDisplayFont } from './fonts';

const SON_MAI = "'Bodoni Moda', 'Didot', serif";
const GOLDEN = "'Bricolage Grotesque', ui-rounded, system-ui, sans-serif";

const n = (v: TextStyle['marginTop']) => (typeof v === 'number' ? v : 0);

/** The height a one-line text takes in its row: its line and padding, less what its margins take back. */
function outer(style: TextStyle): number {
  return (
    n(style.marginTop) +
    n(style.paddingTop) +
    (style.lineHeight ?? 0) +
    n(style.paddingBottom) +
    n(style.marginBottom)
  );
}

/** Where iOS sets the first baseline, from the top of the text's box. */
function baseline(style: TextStyle): number {
  const face = FONT_METRICS[style.fontFamily ?? '']!;
  const size = style.fontSize!;
  const line = style.lineHeight!;
  const own = face.line * size;
  const inLine = line >= own ? face.ascent * size + (line - own) / 2 : line - face.descent * size;
  return n(style.paddingTop) + inLine;
}

describe('leading on iOS', () => {
  it('draws a Didone masthead whole and keeps it where the design sets it', () => {
    setDisplayFont(SON_MAI);
    const style = leading(display(68, 500, -0.045), 61.2, true);
    const face = FONT_METRICS['Prata-Regular']!;
    expect(outer(style)).toBeCloseTo(61.2);
    expect(baseline(style)).toBeGreaterThanOrEqual(face.inkTop * 68);
    const below =
      style.lineHeight! + n(style.paddingTop) + n(style.paddingBottom) - baseline(style);
    expect(below).toBeGreaterThanOrEqual(face.inkBottom * 68);
  });

  it('gives a figure set tighter than its face room above the line', () => {
    setDisplayFont(SON_MAI);
    const style = leading(display(18, 600), 18, true);
    expect(outer(style)).toBeCloseTo(18);
    expect(baseline(style)).toBeGreaterThanOrEqual(FONT_METRICS['Prata-Regular']!.inkTop * 18);
  });

  it('keeps wrapped lines their designed distance apart', () => {
    setDisplayFont(SON_MAI);
    expect(leading(display(27, 500), 29.7).lineHeight).toBe(29.7);
  });

  it('leaves the default look where it was, only adding room for marks it cut off', () => {
    setDisplayFont(GOLDEN);
    const style = leading(display(68, 500), 61.2, true);
    const lost = 68 * FONT_METRICS.BricolageGrotesque!.line - 61.2;
    // The line, and the baseline from the designed box's top, are what they were.
    expect(style.lineHeight).toBeCloseTo(68 * FONT_METRICS.BricolageGrotesque!.line);
    expect(baseline(style) + n(style.marginTop)).toBeCloseTo(
      68 * FONT_METRICS.BricolageGrotesque!.ascent - lost / 2,
    );
    expect(outer(style)).toBeCloseTo(61.2);
  });

  it('changes nothing for the system face on a line taller than its own', () => {
    expect(leading(body(15), 20)).toEqual({ ...body(15), lineHeight: 20 });
  });
});
