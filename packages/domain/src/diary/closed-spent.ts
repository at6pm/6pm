import type { Vnd } from '../money/format';
import { sumCounted, type CountedSpend } from '../spend/spend';

/**
 * A closed day's spent as its receipt lists it now: the kept spends of that day that count. The
 * close stores what it saw, but a spend can still land on a closed day afterwards (an email that
 * arrived late and was kept at the next close, a date moved, a category changed); the receipt's
 * lines follow, so its total and the calendar follow too. Days with nothing loaded keep what the
 * close stored.
 */
export function restateClosedDays<T extends { readonly day: string; readonly spent: Vnd }>(
  closed: readonly T[],
  spends: readonly (CountedSpend & { readonly day: string })[],
  notDaily: ReadonlySet<string>,
  loaded: { readonly from: string; readonly to: string },
): T[] {
  const byDay = new Map<string, CountedSpend[]>();
  for (const s of spends) {
    if (s.status !== 'kept') continue;
    const list = byDay.get(s.day);
    if (list) list.push(s);
    else byDay.set(s.day, [s]);
  }
  return closed.map((row) => {
    if (row.day < loaded.from || row.day > loaded.to) return row;
    const spent = sumCounted(byDay.get(row.day) ?? [], notDaily);
    return spent === row.spent ? row : { ...row, spent };
  });
}
