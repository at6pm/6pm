import { isFutureYouPot, type PotRow } from '@6pm/domain';

/** The jar to take a spend from when "From a jar" is turned on: the first that holds it all. */
export function firstJarFor(
  jars: readonly PotRow[],
  saved: Readonly<Record<string, number>>,
  amount: number,
): string | null {
  return (
    jars.find((j) => (saved[j.id] ?? 0) >= amount && !isFutureYouPot(j))?.id ?? jars[0]?.id ?? null
  );
}
