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

/** A spend the person took from a jar by hand (Details, Quick add, a jar's Spend from it). */
export interface JarHandTake {
  readonly spendId: string;
  readonly jarId: string;
  /** When it was taken: an instant. */
  readonly at: string;
}

/**
 * The jars the close may ask about (M13): armed only by the person. A jar is armed while a spend
 * they took from it by hand still stands from it (not skipped, deleted, undone or moved back to
 * today), taken after the last time they answered No for it in the close. A jar nobody spent from
 * by hand is never asked; a No disarms it until the next spend taken from it by hand.
 */
export function armedJars(input: {
  readonly taken: readonly JarHandTake[];
  readonly spends: readonly {
    readonly id: string;
    readonly fromPot?: string | null | undefined;
    readonly status: string;
  }[];
  /** When the close last heard No for each jar: an instant. */
  readonly declined: Readonly<Record<string, string>>;
}): Set<string> {
  const standing = new Map(
    input.spends
      .filter((s) => s.fromPot != null && s.status !== 'skipped' && s.status !== 'deleted')
      .map((s) => [s.id, s.fromPot]),
  );
  const armed = new Set<string>();
  for (const take of input.taken) {
    if (standing.get(take.spendId) !== take.jarId) continue;
    const no = input.declined[take.jarId];
    if (no === undefined || take.at > no) armed.add(take.jarId);
  }
  return armed;
}

/** When to ask: Travel mode on (trip jars are due up to their month), and the jars armed. */
export interface JarAskOptions {
  readonly travelling: boolean;
  /** The jars the person armed (`armedJars`); no other jar is ever asked about. */
  readonly armed: ReadonlySet<string>;
}

/**
 * The dated jar a spend falls due in, for the close's "From your {jar}?" (M13), or null. Only a
 * jar the person armed by taking a spend from it by hand (`armedJars`). A jar is due in its own
 * month; a trip jar also while Travel mode is on. Future you and jars with no date are never asked
 * about: they are spent from by choice, in Details or Quick add. An empty jar, a paused or deleted
 * one, money in, work, a bill's payment or a spend already from a jar are never asked. When two
 * are due, the one in its own month and able to cover it all goes first.
 */
export function dueJarFor<T extends MatchableJar>(
  spend: JarMatchSpend,
  jars: readonly T[],
  saved: Readonly<Record<string, Vnd>>,
  options: JarAskOptions,
): T | null {
  if (spend.direction === 'in' || spend.forWork === true) return null;
  if (spend.paysBill != null || spend.fromPot != null || spend.amount <= 0) return null;
  const month = spend.day.slice(0, 7);
  let best: { jar: T; score: number } | null = null;
  for (const jar of jars) {
    if (jar.id === FUTURE_YOU_POT_ID || jar.neededBy === null) continue;
    if (jar.archivedAt !== null || jar.paused || !options.armed.has(jar.id)) continue;
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
  options: JarAskOptions,
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
