import { countsTowardDay, jarPartOf, type SpendRow } from '@6pm/domain';

import { countedSpendOf } from '../diary/jar-lines';

/** The words a spend's note gains when it came out of a jar. */
export interface JarNoteWords {
  /** "From Đà Lạt": the jar paid all of it. */
  readonly whole: (potId: string) => string;
  /** "From Đà Lạt: 600.000₫": the jar held less than the spend and paid this much. */
  readonly part: (potId: string, covered: number) => string;
}

/**
 * The spends as the CSV writes them: a spend taken from a jar keeps its full amount (it is
 * spending, M13) and its note says which jar paid, and how much when the jar covered only part.
 */
export function withJarNotes(
  spends: readonly SpendRow[],
  notDaily: ReadonlySet<string>,
  words: JarNoteWords,
): SpendRow[] {
  return spends.map((s) => {
    if (s.fromPot == null) return s;
    const counted = countedSpendOf(s);
    const covered = jarPartOf(counted, notDaily);
    const said =
      countsTowardDay(counted, notDaily) && covered < s.amount
        ? words.part(s.fromPot, covered)
        : words.whole(s.fromPot);
    const note = s.note?.trim() ? `${s.note.trim()} · ${said}` : said;
    return { ...s, note };
  });
}
