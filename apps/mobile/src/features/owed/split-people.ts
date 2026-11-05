import { splitByAmount, splitEqually, type Currency, type OwedRow, type Split } from '@6pm/domain';

/** Someone on the split sheet besides the user: in the split or left out, and their typed share. */
export interface SplitPerson {
  readonly key: string;
  /** The first name typed, or null for someone not named. */
  readonly name: string | null;
  readonly on: boolean;
  /** Their share as typed by amount; null takes the even share. */
  readonly typed: number | null;
}

export type SplitMode = 'equal' | 'amount';

/** The split sheet's people from a spend's open lines, and whether they were split evenly. */
export function peopleFromLines(
  lines: readonly OwedRow[],
  total: number,
  currency: Currency,
): { readonly people: SplitPerson[]; readonly mode: SplitMode } {
  const even = splitEqually(total, lines.length + 1, currency).others;
  const mode = lines.every((line, i) => line.amount === even[i]) ? 'equal' : 'amount';
  return {
    people: lines.map((line) => ({
      key: line.id,
      name: line.name,
      on: true,
      typed: mode === 'amount' ? line.amount : null,
    })),
    mode,
  };
}

/**
 * What the sheet would tear: equal shares rounded to a step with the rest on the user, or the
 * shares typed (each untyped one the even share) with the user taking what is left. Null when
 * the typed shares come to more than the bill.
 */
export function splitOf(
  total: number,
  people: readonly SplitPerson[],
  mode: SplitMode,
  currency: Currency,
): Split | null {
  const on = people.filter((p) => p.on);
  const even = splitEqually(total, on.length + 1, currency);
  if (mode === 'equal') return even;
  return splitByAmount(
    total,
    on.map((p, i) => p.typed ?? even.others[i] ?? 0),
  );
}
