import { designAmount, VND, type Currency } from '../money/currency';
import type { PotRow } from '../contracts/local-rows';
import type { Vnd } from '../money/format';
import type { LocalDate } from '../time/local-date';
import { cycleMonth, payCycleOn, type PayCycle, type Payday } from './pay-cycle';
import { goalMonthly, monthsBetween, potMonthlyNeed } from './plan-river';

/**
 * Jars only count: 6pm never moves money. Each pay cycle writes one `setAside` move per jar, what
 * goes in that payday, so the jar fills as the months go by. An `opening` move is what the jar
 * already held before 6pm ("Already saved"): one per jar at most, it counts in what the jar holds
 * and never in a cycle's top-ups, so it never lowers the daily number. A `spent` move is a spend
 * taken from the jar (M13): positive, and taken away from what the jar holds.
 */
export type PotMoveKind = 'setAside' | 'topUp' | 'spent' | 'opening';

export interface PotMove {
  readonly potId: string;
  readonly kind: PotMoveKind;
  /** The payday of the cycle the move belongs to (`PayCycle.start`). */
  readonly cycle: LocalDate;
  readonly amount: Vnd;
}

/** Future you's jar: on every phone, pinned first, never deleted (M4). */
export const FUTURE_YOU_POT_ID = 'futureYou';

export function isFutureYouPot(pot: Pick<PotRow, 'id'> | string): boolean {
  return (typeof pot === 'string' ? pot : pot.id) === FUTURE_YOU_POT_ID;
}

/**
 * Future you's jar as a row. Its name is never shown as written: screens say "Future you" in the
 * phone's language. No target (`goal` 0) and no date; it fills from the Future you slice.
 */
export function futureYouPotRow(createdAt: string): PotRow {
  return {
    id: FUTURE_YOU_POT_ID,
    kind: 'goal',
    name: 'Future you',
    icon: 'wb_sunny',
    hue: 70,
    goal: 0,
    neededBy: null,
    share: null,
    monthly: null,
    paused: false,
    createdAt,
    archivedAt: null,
  };
}

/**
 * A goal from 2.1 that has not been told how to fill since: it keeps its share of the Future you
 * slice, so nobody's daily number moves on update. Renaming it, or changing its icon, colour or
 * target, keeps it so; only choosing "By a date" or "Each payday" makes it an ordinary jar.
 */
export function isLegacyGoal(pot: Pick<PotRow, 'id' | 'kind'>): boolean {
  return pot.kind === 'goal' && pot.id !== FUTURE_YOU_POT_ID;
}

/** How a jar fills each payday. */
export type JarFill = 'futureYou' | 'slice' | 'date' | 'steady' | 'byHand';

export function jarFillOf(pot: Pick<PotRow, 'id' | 'kind' | 'neededBy' | 'monthly'>): JarFill {
  if (pot.id === FUTURE_YOU_POT_ID) return 'futureYou';
  if (pot.kind === 'goal') return 'slice';
  if (pot.neededBy !== null) return 'date';
  return pot.monthly != null && pot.monthly > 0 ? 'steady' : 'byHand';
}

/** What a jar's set-aside depends on. */
export type PotTerms = Pick<PotRow, 'kind' | 'goal' | 'neededBy' | 'share' | 'paused'> &
  Partial<Pick<PotRow, 'id' | 'monthly'>>;

/** The most cycles one catch-up writes: a damaged clock must not fill the database. */
const MAX_CYCLES = 240;

/** Months from the cycle to a pot's month, at least one; null for a pot with no date. */
export function potMonthsLeft(cycle: PayCycle, neededBy: string | null): number | null {
  return neededBy === null ? null : monthsBetween(cycleMonth(cycle), neededBy);
}

/**
 * What a jar sets aside in one cycle, given what it held when the cycle began.
 * - Future you's jar takes `futureYou`: the slice, less what 2.1 goals still take of it.
 * - A 2.1 goal takes its share of the slice, until it is full.
 * - A dated jar spreads what is left over the months to its date (ceil to 50.000₫, never more than
 *   is left), and stops once that month has gone by.
 * - A jar with no date puts in its steady amount, up to its target when it has one.
 * - A paused or full jar sets nothing aside; neither does one filled only by hand.
 */
export function potSetAside(input: {
  readonly pot: PotTerms;
  readonly savedBefore: Vnd;
  readonly futureYou: Vnd;
  readonly cycle: PayCycle;
  /** The home currency; đồng when not given. */
  readonly currency?: Currency;
}): Vnd {
  const { pot, savedBefore, futureYou, cycle, currency = VND } = input;
  if (pot.id === FUTURE_YOU_POT_ID) return Math.max(0, Math.round(futureYou)) || 0;
  if (pot.paused) return 0;
  const left = pot.goal > 0 ? Math.max(0, pot.goal - savedBefore) : Number.POSITIVE_INFINITY;
  if (left === 0) return 0;
  if (pot.kind === 'goal') {
    return pot.goal > 0 ? Math.min(left, goalMonthly(futureYou, pot.share ?? 0)) : 0;
  }
  if (pot.neededBy === null) {
    const steady = pot.monthly != null && pot.monthly > 0 ? Math.round(pot.monthly) : 0;
    return Math.min(left, steady);
  }
  if (cycleMonth(cycle) > pot.neededBy) return 0;
  return potMonthlyNeed(pot.goal, savedBefore, potMonthsLeft(cycle, pot.neededBy), currency);
}

/** A move as it changes what a jar holds: a spend taken from it counts down. */
export function heldBy(move: Pick<PotMove, 'kind' | 'amount'>): Vnd {
  return move.kind === 'spent' ? -Math.abs(move.amount) : move.amount;
}

/**
 * What a jar held when a cycle began: every move filed in an earlier cycle, and what it already
 * held before 6pm, whenever that was typed, so the cycle's set-aside already knows about it. Never
 * below zero.
 */
export function savedBefore(moves: readonly PotMove[], potId: string, cycleStart: LocalDate): Vnd {
  const held = moves.reduce(
    (sum, m) =>
      m.potId === potId && (m.kind === 'opening' || m.cycle < cycleStart) ? sum + heldBy(m) : sum,
    0,
  );
  return Math.max(0, held);
}

/** What a pot already held before 6pm: its opening move, 0 when it has none. */
export function openingOf(moves: readonly PotMove[], potId: string): Vnd {
  return moves.reduce(
    (sum, m) => (m.potId === potId && m.kind === 'opening' ? sum + m.amount : sum),
    0,
  );
}

/** An amount the pot holds, as it would be with `opening` typed in place of its opening move. */
export function withOpening(
  held: Vnd,
  moves: readonly PotMove[],
  potId: string,
  opening: Vnd,
): Vnd {
  return held - openingOf(moves, potId) + Math.max(0, Math.round(opening));
}

export interface SetAsideRecord {
  readonly potId: string;
  readonly cycle: LocalDate;
  readonly amount: Vnd;
}

/**
 * The set-asides still to write, in order: for each jar, one per pay cycle after its last one
 * through the current cycle (from its first cycle when it has none). A cycle that is already
 * recorded is never written twice, a launch that skipped cycles catches up on all of them, and a
 * jar that sets nothing aside still gets a zero so a later edit cannot reach back into the past.
 * Future you's jar takes, each cycle, the slice less what the 2.1 goals took of it that cycle, so
 * the slice is never counted twice and its jar starts in the cycle it was made, never before.
 */
export function dueSetAsides(input: {
  readonly pots: readonly (PotTerms & Pick<PotRow, 'id' | 'createdAt'>)[];
  readonly moves: readonly PotMove[];
  /** Future you's monthly amount: its jar's slice, shared with the 2.1 goals. */
  readonly futureYou: Vnd;
  /**
   * Cycles that start before this day set nothing aside for Future you, as when the person chose
   * to start it at payday (`futureYouStartsOn`). Null or left out: every cycle does.
   */
  readonly futureYouFrom?: LocalDate | null;
  readonly payday: Payday;
  readonly today: LocalDate;
  /** The phone's day an instant falls on; passed in so the domain holds no time zone. */
  readonly dayOf: (instant: string) => LocalDate;
  /** The home currency; đồng when not given. */
  readonly currency?: Currency;
}): SetAsideRecord[] {
  const { moves, payday, today, futureYou, futureYouFrom, currency = VND } = input;
  const current = payCycleOn(today, payday);
  const sliceIn = (cycle: PayCycle) =>
    futureYouFrom != null && cycle.start < futureYouFrom ? 0 : futureYou;
  const goalsTook = new Map<LocalDate, Vnd>();
  for (const m of moves) {
    if (m.kind !== 'setAside') continue;
    const pot = input.pots.find((p) => p.id === m.potId);
    if (pot && isLegacyGoal({ id: pot.id ?? m.potId, kind: pot.kind })) {
      goalsTook.set(m.cycle, (goalsTook.get(m.cycle) ?? 0) + m.amount);
    }
  }
  const byPot = new Map<string, SetAsideRecord[]>();
  const due = (pot: PotTerms & Pick<PotRow, 'id' | 'createdAt'>) => {
    const out: SetAsideRecord[] = [];
    byPot.set(pot.id, out);
    const recorded = moves
      .filter((m) => m.potId === pot.id && m.kind === 'setAside')
      .reduce<LocalDate | null>(
        (last, m) => (last === null || m.cycle > last ? m.cycle : last),
        null,
      );
    let cycle: PayCycle;
    if (recorded === null) {
      const made = input.dayOf(pot.createdAt);
      cycle = payCycleOn(made > today ? today : made, payday);
    } else {
      if (recorded >= current.start) return;
      cycle = payCycleOn(payCycleOn(recorded, payday).payday, payday);
    }
    const legacy = isLegacyGoal(pot);
    const isFutureYou = pot.id === FUTURE_YOU_POT_ID;
    let added = 0;
    for (let n = 0; n < MAX_CYCLES && cycle.start <= current.start; n++) {
      const slice = sliceIn(cycle);
      const amount = potSetAside({
        pot,
        savedBefore: savedBefore(moves, pot.id, cycle.start) + added,
        futureYou: isFutureYou ? Math.max(0, slice - (goalsTook.get(cycle.start) ?? 0)) : slice,
        cycle,
        currency,
      });
      out.push({ potId: pot.id, cycle: cycle.start, amount });
      if (legacy) goalsTook.set(cycle.start, (goalsTook.get(cycle.start) ?? 0) + amount);
      added += amount;
      const next = payCycleOn(cycle.payday, payday);
      if (next.start <= cycle.start) break;
      cycle = next;
    }
  };
  for (const pot of input.pots) if (pot.id !== FUTURE_YOU_POT_ID) due(pot);
  for (const pot of input.pots) if (pot.id === FUTURE_YOU_POT_ID) due(pot);
  return input.pots.flatMap((pot) => byPot.get(pot.id) ?? []);
}

export interface PotTotals {
  /** Held per jar, from all its moves, never below zero. */
  readonly saved: Readonly<Record<string, Vnd>>;
  /** Set aside per jar in the cycle. */
  readonly setAside: Readonly<Record<string, Vnd>>;
  /** Taken from each jar by spends in the cycle. */
  readonly spent: Readonly<Record<string, Vnd>>;
  /** Topped up per jar in the cycle. */
  readonly toppedUp: Readonly<Record<string, Vnd>>;
  /** The cycle's top-ups, every jar together. */
  readonly topUps: Vnd;
}

/** Adds the moves of the jars that still exist. A deleted jar gives its money back to free. */
export function potTotals(
  moves: readonly PotMove[],
  potIds: ReadonlySet<string>,
  cycleStart: LocalDate,
): PotTotals {
  const saved: Record<string, Vnd> = {};
  const setAside: Record<string, Vnd> = {};
  const spent: Record<string, Vnd> = {};
  const toppedUp: Record<string, Vnd> = {};
  let topUps = 0;
  const add = (to: Record<string, Vnd>, id: string, amount: Vnd) => {
    to[id] = (to[id] ?? 0) + amount;
  };
  for (const move of moves) {
    if (!potIds.has(move.potId)) continue;
    add(saved, move.potId, heldBy(move));
    if (move.cycle !== cycleStart) continue;
    if (move.kind === 'topUp') {
      topUps += move.amount;
      add(toppedUp, move.potId, move.amount);
    }
    if (move.kind === 'setAside') add(setAside, move.potId, move.amount);
    if (move.kind === 'spent') add(spent, move.potId, Math.abs(move.amount));
  }
  for (const id of Object.keys(saved)) saved[id] = Math.max(0, saved[id] ?? 0);
  return { saved, setAside, spent, toppedUp, topUps };
}

/**
 * The jars outside Future you's slice in the daily number: what the dated and steady jars set
 * aside this cycle, added up. Future you's jar and the 2.1 goals come out of the slice (`futureYou`
 * in the plan), so they are never counted twice here.
 */
export function occasionsOf(
  pots: readonly Pick<PotRow, 'id' | 'kind'>[],
  setAside: Readonly<Record<string, Vnd>>,
): Vnd {
  return pots.reduce((sum, p) => (p.kind === 'occasion' ? sum + (setAside[p.id] ?? 0) : sum), 0);
}

/**
 * The one line of the plan: what goes into jars this payday, every jar together. The slice (as
 * this cycle counts it) covers Future you's jar and the 2.1 goals; the rest is `occasionsOf`.
 */
export function intoJarsEachPayday(
  slice: Vnd,
  pots: readonly Pick<PotRow, 'id' | 'kind'>[],
  setAside: Readonly<Record<string, Vnd>>,
): Vnd {
  return Math.max(0, slice) + occasionsOf(pots, setAside);
}

/** Jars in shelf order: Future you first, then the others as they were made. */
export function shelfOrder<T extends Pick<PotRow, 'id' | 'createdAt'>>(pots: readonly T[]): T[] {
  return [...pots].sort((a, b) =>
    a.id === FUTURE_YOU_POT_ID
      ? -1
      : b.id === FUTURE_YOU_POT_ID
        ? 1
        : a.createdAt < b.createdAt
          ? -1
          : a.createdAt > b.createdAt
            ? 1
            : 0,
  );
}

/**
 * Splits Future you between its goals so the shares add up to one. `pinned` keeps the share it was
 * given (the goal the user just set) and the others fill the rest in their old proportions, or
 * evenly when they had none. Without `pinned` every share is scaled to fit. Shares are whole
 * percents, each between none and all: the others' percents are rounded down and the points still
 * missing go to those that lost the most in the rounding (the largest remainders).
 */
export function rebalanceShares(
  shares: Readonly<Record<string, number>>,
  pinned?: string,
): Record<string, number> {
  const ids = Object.keys(shares);
  const only = ids[0];
  if (only === undefined) return {};
  if (ids.length === 1) return { [only]: 1 };
  const clamp = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);
  const pin = pinned !== undefined && pinned in shares ? pinned : null;
  const keep = pin === null ? 0 : Math.round(clamp(shares[pin] ?? 0) * 100);
  const others = ids.filter((id) => id !== pin);
  const total = others.reduce((sum, id) => sum + clamp(shares[id] ?? 0), 0);
  const exact = others.map((id) => {
    const part = total > 0 ? clamp(shares[id] ?? 0) / total : 1 / others.length;
    return { id, points: part * (100 - keep) };
  });
  const points: Record<string, number> = {};
  for (const { id, points: p } of exact) points[id] = Math.floor(p);
  let missing = 100 - keep - exact.reduce((sum, e) => sum + (points[e.id] ?? 0), 0);
  const byRemainder = [...exact].sort(
    (a, b) => b.points - Math.floor(b.points) - (a.points - Math.floor(a.points)),
  );
  for (const { id } of byRemainder) {
    if (missing <= 0) break;
    points[id] = (points[id] ?? 0) + 1;
    missing -= 1;
  }
  const out: Record<string, number> = {};
  for (const id of ids) out[id] = (id === pin ? keep : (points[id] ?? 0)) / 100;
  return out;
}

/** The quick top-up's steps, smallest first: 100k for an everyday pot up to 100tr for a home. */
const TOP_UP_STEPS: readonly Vnd[] = [
  100_000, 500_000, 1_000_000, 5_000_000, 10_000_000, 50_000_000, 100_000_000,
];

/**
 * A jar's quick top-up, scaled to its goal: the largest round step that is at most a twentieth of
 * it, never below 100k. A 2tr birthday adds 100k a tap, a 20tr trip 1tr, an 800tr car 10tr and a
 * 2 tỷ home 100tr. Outside đồng the ladder is 1 and 5 times a power of ten.
 */
export function potTopUpStep(goal: Vnd, currency: Currency = VND): Vnd {
  const most = goal / 20;
  const steps = currency.code === 'VND' ? TOP_UP_STEPS : topUpStepsIn(currency);
  return steps.reduce((best, step) => (step <= most ? step : best), steps[0] ?? 0);
}

/**
 * What one tap of a jar's quick top-up adds: the step, or only what is left when that is less, and
 * nothing once the jar is full. A jar with no target always takes the step.
 */
export function potTopUp(goal: Vnd, saved: Vnd, step: Vnd): Vnd {
  if (goal <= 0) return Math.max(0, step);
  return Math.max(0, Math.min(step, goal - saved));
}

/**
 * The same ladder outside đồng: 1 and 5 times a power of ten, from the largest such amount no
 * bigger than the design's 100k worth in the currency ($1, then $5, $10, $50 …), seven rungs.
 */
function topUpStepsIn(currency: Currency): Vnd[] {
  const first = designAmount(100_000, currency);
  const power = 10 ** Math.floor(Math.log10(first));
  let step = first >= 5 * power ? 5 * power : power;
  const steps: Vnd[] = [];
  for (let i = 0; i < 7; i++) {
    steps.push(step);
    step = String(step).startsWith('1') ? step * 5 : step * 2;
  }
  return steps;
}

/** Jars of one's own without Max, beside Future you's. Jars already made are always kept. */
export const FREE_OWN_JARS = 1;

/** Whether a new jar waits behind Max: the free jar is in use and Max is not held. */
export function newJarLocked(pots: readonly Pick<PotRow, 'id'>[], max: boolean): boolean {
  return !max && pots.filter((p) => p.id !== FUTURE_YOU_POT_ID).length >= FREE_OWN_JARS;
}
