/**
 * What the "Owed to you" row shows on Today and in the Diary: the people who owe something, or,
 * for someone with work money while nobody owes anything, the row alone, the way into Who owes me
 * and its first "Ask to be paid". Nothing for anyone else while nothing is owed.
 */
export type OwedEntry = 'people' | 'ask' | null;

export function owedEntryOf(people: number, workMoney: boolean): OwedEntry {
  if (people > 0) return 'people';
  return workMoney ? 'ask' : null;
}
