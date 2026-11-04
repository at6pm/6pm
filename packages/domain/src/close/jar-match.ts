import type { PotRow } from '../contracts/local-rows';
import type { Vnd } from '../money/format';
import { isTripJar } from '../plan/jar-presets';
import { FUTURE_YOU_POT_ID } from '../plan/pots';
import type { LocalDate } from '../time/local-date';

export type MatchableJar = Pick<
  PotRow,
  'id' | 'kind' | 'icon' | 'goal' | 'neededBy' | 'paused' | 'archivedAt'
>;

export interface JarMatchSpend {
  readonly day: LocalDate;
  readonly amount: Vnd;
  readonly direction?: 'out' | 'in' | null | undefined;
  readonly forWork?: boolean | null | undefined;
  readonly paysBill?: string | null | undefined;
  readonly fromPot?: string | null | undefined;
}

/**
 * The dated jar a spend falls due in, for the close's "From your {jar}?" (M13), or null. A jar is
 * due in its own month; a trip jar also while Travel mode is on. Future you and jars with no date
 * are never asked about: they are spent from by choice, in Details or Quick add. An empty jar,
 * a paused or deleted one, money in, work, a bill's payment or a spend already from a jar are
 * never asked. When two are due, the one in its own month and able to cover it all goes first.
 */
export function dueJarFor<T extends MatchableJar>(
  spend: JarMatchSpend,
  jars: readonly T[],
  saved: Readonly<Record<string, Vnd>>,
  options: { readonly travelling: boolean },
): T | null {
  if (spend.direction === 'in' || spend.forWork === true) return null;
  if (spend.paysBill != null || spend.fromPot != null || spend.amount <= 0) return null;
  const month = spend.day.slice(0, 7);
  let best: { jar: T; score: number } | null = null;
  for (const jar of jars) {
    if (jar.id === FUTURE_YOU_POT_ID || jar.neededBy === null) continue;
    if (jar.archivedAt !== null || jar.paused) continue;
    const held = saved[jar.id] ?? 0;
    if (held <= 0) continue;
    const inMonth = jar.neededBy === month;
    const trip = options.travelling && isTripJar(jar) && month <= jar.neededBy;
    if (!inMonth && !trip) continue;
    const score = (inMonth ? 2 : 0) + (held >= spend.amount ? 1 : 0);
    if (best === null || score > best.score) best = { jar, score };
  }
  return best?.jar ?? null;
}

/** Why a jar is ready: full, or its month has come. */
export type JarReadyReason = 'full' | 'date';

/** The key a ready moment is remembered by on the phone: once per jar and reason. */
export function readyKey(jarId: string, reason: JarReadyReason): string {
  return `${jarId}:${reason}`;
}

/**
 * The jar the close celebrates tonight, or null: one that is full (a target, reached) or whose
 * month has come, never Future you, and never one already celebrated for that reason (`shown`,
 * kept on the phone). Full goes before its month; the first jar made goes first.
 */
export function readyJarFor<T extends MatchableJar>(
  jars: readonly T[],
  saved: Readonly<Record<string, Vnd>>,
  today: LocalDate,
  shown: ReadonlySet<string>,
): { readonly jar: T; readonly reason: JarReadyReason } | null {
  const month = today.slice(0, 7);
  for (const reason of ['full', 'date'] as const) {
    for (const jar of jars) {
      if (jar.id === FUTURE_YOU_POT_ID || jar.archivedAt !== null) continue;
      if (shown.has(readyKey(jar.id, reason))) continue;
      const held = saved[jar.id] ?? 0;
      const full = jar.goal > 0 && held >= jar.goal;
      if (reason === 'full' && full) return { jar, reason };
      if (reason === 'date' && !full && held > 0 && jar.neededBy === month) {
        return { jar, reason };
      }
    }
  }
  return null;
}

/**
 * The close's "From your {jar}?" questions for a night's spends: each due jar asks once, about
 * its largest spend (as the work question asks about the largest), so a coffee in the jar's month
 * is never asked about beside the hotel. Returns spend id → jar id.
 */
export function jarQuestionsFor<T extends MatchableJar>(
  spends: readonly (JarMatchSpend & { readonly id: string })[],
  jars: readonly T[],
  saved: Readonly<Record<string, Vnd>>,
  options: { readonly travelling: boolean },
): Map<string, string> {
  const largest = new Map<string, { id: string; amount: Vnd }>();
  for (const spend of spends) {
    const jar = dueJarFor(spend, jars, saved, options);
    if (jar === null) continue;
    const best = largest.get(jar.id);
    if (best === undefined || spend.amount > best.amount) {
      largest.set(jar.id, { id: spend.id, amount: spend.amount });
    }
  }
  return new Map([...largest].map(([jarId, s]) => [s.id, jarId]));
}
