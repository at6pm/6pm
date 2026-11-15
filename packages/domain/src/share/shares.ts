/**
 * Whole percents of a total that add up to exactly 100, by the largest-remainder method: each part
 * takes the floor of its exact share, and the points left go one each to the parts with the
 * largest remainders (the earlier part first on a tie). A part at or below zero, or not a finite
 * number, holds nothing and gets 0. When nothing holds anything every part is 0.
 */
export function wholePercents(amounts: readonly number[]): number[] {
  const held = amounts.map((a) => (Number.isFinite(a) && a > 0 ? a : 0));
  const total = held.reduce((sum, a) => sum + a, 0);
  if (total <= 0) return held.map(() => 0);
  const exact = held.map((a) => (a * 100) / total);
  const out = exact.map((e) => Math.floor(e));
  let left = 100 - out.reduce((sum, p) => sum + p, 0);
  const order = exact
    .map((e, i) => ({ i, rest: e - Math.floor(e), held: (held[i] ?? 0) > 0 }))
    .filter((r) => r.held)
    .sort((a, b) => b.rest - a.rest || a.i - b.i);
  for (let k = 0; left > 0 && order.length > 0; k = (k + 1) % order.length, left--) {
    const at = order[k]?.i ?? 0;
    out[at] = (out[at] ?? 0) + 1;
  }
  return out;
}

/** One part of the pay on the split card: what it is and what it takes each payday. */
export interface SplitShare<K extends string = string> {
  readonly key: K;
  readonly amount: number;
  /** Whole percent of the parts' total; the shares add up to 100. */
  readonly percent: number;
}

/** The parts with their whole percents (`wholePercents`), in the order given. */
export function splitShares<K extends string>(
  parts: readonly { readonly key: K; readonly amount: number }[],
): SplitShare<K>[] {
  const percents = wholePercents(parts.map((p) => p.amount));
  return parts.map((p, i) => ({
    key: p.key,
    amount: Math.max(0, Number.isFinite(p.amount) ? p.amount : 0),
    percent: percents[i] ?? 0,
  }));
}
