/**
 * A history folded where it repeats: consecutive lines that say the same thing (the same kind of
 * move, the same amount) become one run, so five paydays of 500.000₫ read as one line. A line that
 * never folds (a spend, the jar's start) or a different amount breaks the run.
 */
export interface FoldedRun<T> {
  readonly items: readonly T[];
  /** What the run's lines add up to. */
  readonly total: number;
}

/**
 * `items` in order, folded into runs. `keyOf` names what a line says (`payday:500000`), or null for
 * a line that stands alone; consecutive lines with the same key share a run.
 */
export function foldRuns<T extends { readonly amount: number }>(
  items: readonly T[],
  keyOf: (item: T) => string | null,
): FoldedRun<T>[] {
  const runs: { items: T[]; total: number; key: string | null }[] = [];
  for (const item of items) {
    const key = keyOf(item);
    const last = runs.at(-1);
    if (last && key !== null && last.key === key) {
      last.items.push(item);
      last.total += item.amount;
    } else {
      runs.push({ items: [item], total: item.amount, key });
    }
  }
  return runs.map(({ items: held, total }) => ({ items: held, total }));
}
