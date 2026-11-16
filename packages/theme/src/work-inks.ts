import { oklchSrgbHex } from './oklch';

/**
 * The work mark's inks (the Money Reaches You canvas, boards 1e, 5 and 6), the same in every
 * look: an indigo stamp on paper, and a lavender of it on the look's dark sheets, where work is
 * counted apart from the person's own money.
 */
export const workInk = {
  /** The WORK stamp on paper: the close's receipts, onboarding's slip, Quick add's ticket. */
  paper: oklchSrgbHex(0.42, 0.13, 275),
  /** The stamp, the Work chip and the kept figure on a dark sheet (Today, the Diary, Plan). */
  onDark: oklchSrgbHex(0.84, 0.08, 275),
  /** The words on the Diary's Work chip, picked, on a dark sheet. */
  chipInk: '#1f1a3a',
  /** The "For work" row's tile on Today. */
  tile: oklchSrgbHex(0.66, 0.13, 275),
  /** The empty box a bank answered "never" shows on paper, where its stamp would be. */
  blankOnPaper: 'rgba(43,37,48,.14)',
  /** The same box on a dark sheet. */
  blankOnDark: 'rgba(251,244,236,.18)',
  /** Onboarding's slip of banks, answered with their stamps: its paper, inks and rules. */
  slip: '#fbf7ef',
  slipInk: '#2b2530',
  slipSoft: 'rgba(43,37,48,.55)',
  slipRule: 'rgba(43,37,48,.35)',
  slipRuleSoft: 'rgba(43,37,48,.25)',
  slipShadow: '0 12px 20px rgba(70,45,30,.16)',
  /** Today's takings: the slip's shadow on the sheet, the cash line being typed and its caret. */
  takingsShadow: '0 16px 24px rgba(20,10,30,.3)',
  slipField: 'rgba(43,37,48,.07)',
  caret: '#ff8552',
  /** What work spent, hatched in the Work card's bar: on a dark sheet, and on a light one. */
  hatchA: 'rgba(251,244,236,.34)',
  hatchB: 'rgba(251,244,236,.12)',
  hatchALight: 'rgba(27,30,46,.28)',
  hatchBLight: 'rgba(27,30,46,.1)',
  /** The money a "How work pays you" card draws: bars of what lands. */
  bars: oklchSrgbHex(0.78, 0.13, 150),
} as const;
