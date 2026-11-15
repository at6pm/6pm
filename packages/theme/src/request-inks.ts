import { oklchSrgbHex } from './oklch';
import { owedInk } from './owed-inks';
import { moneyInInk } from './paper-inks';

const lavender = oklchSrgbHex(0.84, 0.08, 275);

/**
 * Asking to be paid and the work year (the Money Reaches You canvas, boards 4c, 7 and 8), the
 * same in every look: the request's code on a lavender chip, the certificate's green stamp, and
 * the year's line and month bars on the look's dark sky (`onLight` where its sheet is light).
 */
export const requestInk = {
  /** The code in a transfer note, on paper: indigo on lavender at 55%. */
  codeChip: `${lavender}8c`,
  codeInk: oklchSrgbHex(0.42, 0.13, 275),
  /** The certificate stamp, dashed while it waits, solid once inked. */
  certificate: owedInk.stamp,
  /** The year's line: its track, quarter ticks and the fill of what came in. */
  track: 'rgba(255,255,255,.1)',
  tick: 'rgba(251,244,236,.25)',
  fill: lavender,
  /** Month bars: the months that made the year, this month in work ink, months to come dashed. */
  bar: 'rgba(251,244,236,.5)',
  barNow: lavender,
  barToCome: 'rgba(251,244,236,.3)',
  barLabel: 'rgba(251,244,236,.6)',
  /** The line and month bars where the look's sheet is light: the same parts in ink. */
  onLight: {
    track: 'rgba(43,37,48,.08)',
    tick: 'rgba(43,37,48,.22)',
    bar: 'rgba(43,37,48,.22)',
    barToCome: 'rgba(43,37,48,.25)',
    barLabel: 'rgba(43,37,48,.5)',
  },
  /** The receipt held-back lines are printed on. */
  paper: '#f7f2e8',
  paperInk: '#2b2530',
  paperSoft: 'rgba(43,37,48,.55)',
  paperRule: 'rgba(43,37,48,.25)',
  /** Money that landed, green on paper. */
  landed: moneyInInk.paper,
} as const;
