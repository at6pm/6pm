import type { Vnd } from '../money/format';

/**
 * Each jar's part of what the month has set aside so far (`IncomePeriod.jars`), from what each
 * sets aside in the whole month (`setAside`, by jar; `whole` in all): in proportion, in whole
 * units, what rounding leaves going to the jar that sets aside most. A jar never has more than
 * its month's set-aside; with everything set aside, each has all of it.
 */
export function setAsideSoFar(
  setAside: Readonly<Record<string, Vnd>>,
  sofar: Vnd,
  whole: Vnd,
): Record<string, Vnd> {
  const out: Record<string, Vnd> = { ...setAside };
  if (whole <= 0 || sofar >= whole) return out;
  const share = Math.max(0, sofar) / whole;
  let largest: string | null = null;
  let given = 0;
  let total = 0;
  for (const [id, amount] of Object.entries(setAside)) {
    const part = Math.floor(Math.max(0, amount) * share);
    out[id] = part;
    given += part;
    total += Math.max(0, amount);
    if (largest === null || amount > (setAside[largest] ?? 0)) largest = id;
  }
  const rest = Math.round(Math.max(0, total) * share) - given;
  if (largest !== null && rest > 0) {
    out[largest] = Math.min(setAside[largest] ?? 0, (out[largest] ?? 0) + rest);
  }
  return out;
}
