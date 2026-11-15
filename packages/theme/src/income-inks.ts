/**
 * Money that reaches you on its own rhythm (the Money Reaches You canvas). "In hand" is drawn in
 * the tab bar's indigo wherever it is a part of the pay; its days are cream dots on it. The ruler
 * under Today's meter ticks the days the money covers: in the look's ink up to the day it lasts
 * to, in a lavender of that indigo beyond it.
 */
export const incomeInk = {
  inHand: '#2e2d55',
  inHandInk: '#fbf4ec',
  inHandDot: '#fbf4ec',
  inHandDotOld: 'rgba(251,244,236,.45)',
  rulerInHand: { dark: '#b3addf', light: '#5b5796' },
  /** A slice of a bill: what this pay covers of a gap, hatched warm on the paper. */
  gap: { a: 'rgba(214,148,92,.55)', b: 'rgba(214,148,92,.18)', width: 4 },
  gapInk: '#7a4a24',
} as const;
