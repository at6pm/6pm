import { z } from 'zod';

import type { SpendSource } from '../spend/spend';
import { addDays, diffDays, localDateOf, type LocalDate } from '../time/local-date';

/** Days each way's heartbeat shows in Settings, today last. */
export const HEARTBEAT_DAYS = 14;

/** Empty days after which a busy way that runs by itself counts as quiet. */
export const QUIET_AFTER_DAYS = 3;

/** Catches in the 14 days up to a way's last one that make it a busy way, worth a hint. */
export const QUIET_MIN_CATCHES = 5;

/**
 * The ways that run by themselves once set up outside 6pm (the bank alert and Wallet automations,
 * forwarded email): only these can stop without the person knowing, so only these go quiet.
 */
export const SELF_RUNNING_SOURCES: readonly SpendSource[] = ['alert', 'applePay', 'email'];

export function isSelfRunningSource(source: SpendSource): boolean {
  return SELF_RUNNING_SOURCES.includes(source);
}

/**
 * The sources that are spending caught on its own (a shared receipt, a Wallet tap, a bank alert,
 * a forwarded email, a scanned code): any one of them prints as onboarding's first receipt. Typed
 * and spoken spends are not. Only one from a way that runs by itself ends Today's reminder.
 */
export const CAUGHT_SOURCES: readonly SpendSource[] = [
  'shared',
  'applePay',
  'alert',
  'email',
  'qr',
];

export function isCaughtSource(source: SpendSource): boolean {
  return CAUGHT_SOURCES.includes(source);
}

/** Catches a day for the last `HEARTBEAT_DAYS` days ending on `today`, oldest first. */
export function heartbeat(days: readonly LocalDate[], today: LocalDate): readonly number[] {
  const first = addDays(today, -(HEARTBEAT_DAYS - 1));
  const counts = Array.from({ length: HEARTBEAT_DAYS }, () => 0);
  for (const day of days) {
    if (day < first || day > today) continue;
    const at = diffDays(day, first);
    counts[at] = (counts[at] ?? 0) + 1;
  }
  return counts;
}

/** A busy way gone quiet: for how many days, after how many catches. */
export interface WayQuiet {
  readonly days: number;
  readonly catches: number;
}

/**
 * Whether a way went quiet: nothing from it for `QUIET_AFTER_DAYS` days or more, after
 * `QUIET_MIN_CATCHES` or more catches in the 14 days up to its last one. `seen` is the last day
 * the way was seen running without catching anything (a bank alert the shortcut read and
 * skipped): that says it still works. A way that never caught, or caught only now and then, is
 * never quiet. Days after `today` are not counted.
 */
export function wayQuiet(
  catches: readonly LocalDate[],
  today: LocalDate,
  seen: LocalDate | null = null,
): WayQuiet | null {
  const past = catches.filter((day) => day <= today);
  const last = past.reduce<LocalDate | null>(
    (max, day) => (max === null || day > max ? day : max),
    null,
  );
  if (last === null) return null;
  const active = seen !== null && seen <= today && seen > last ? seen : last;
  const days = diffDays(today, active);
  if (days < QUIET_AFTER_DAYS) return null;
  const from = addDays(last, -(HEARTBEAT_DAYS - 1));
  const before = past.filter((day) => day >= from).length;
  return before >= QUIET_MIN_CATCHES ? { days, catches: before } : null;
}

/** Where onboarding's first catch stands, kept on the phone. */
export const firstCatchStateSchema = z.discriminatedUnion('state', [
  /** The catching step was left with nothing caught: the day, when, and the ways walked by then. */
  z.object({
    state: z.literal('later'),
    day: z.string(),
    at: z.string(),
    ways: z.array(z.string()).optional(),
  }),
  /**
   * A real catch landed: what caught it, the day the catching step ended and the ways walked. One
   * kept before sources were told apart has only `at`, and the spends say what caught it.
   */
  z.object({
    state: z.literal('caught'),
    at: z.string(),
    source: z.string().optional(),
    day: z.string().optional(),
    ways: z.array(z.string()).optional(),
  }),
]);
export type FirstCatchState = z.infer<typeof firstCatchStateSchema>;

/** Whether a way that runs by itself has caught something: the reminder is over for good. */
export function firstCatchEnded(state: FirstCatchState | null): boolean {
  return (
    state?.state === 'caught' &&
    state.source !== undefined &&
    SELF_RUNNING_SOURCES.some((source) => source === state.source)
  );
}

/** The day the catching step ended, as far as the state says. */
function firstCatchDay(state: FirstCatchState): LocalDate | null {
  if (state.day !== undefined) return state.day;
  const at = new Date(state.at);
  return Number.isNaN(at.getTime()) ? null : localDateOf(at);
}

function waysWith(state: FirstCatchState | null, ways: readonly string[] | undefined): string[] {
  return [...new Set([...(state?.ways ?? []), ...(ways ?? [])])];
}

/** A catch that landed while 6pm waited for one: what caught it, when, and the ways walked. */
export interface FirstCatchLanded {
  readonly source: SpendSource;
  readonly at: string;
  /** The money day it landed on. */
  readonly day: LocalDate;
  readonly ways?: readonly string[];
}

/**
 * Folds a catch into where the first catch stands. One from a way that runs by itself (a bank
 * alert, a Wallet tap, a forwarded email) ends the reminder for good. A shared receipt or a
 * scanned code is kept only as the catching step's own catch, in onboarding: afterwards it leaves
 * the state as it was, so the reminder goes on from the day it had.
 */
export function foldFirstCatch(
  state: FirstCatchState | null,
  landed: FirstCatchLanded,
): FirstCatchState {
  if (state !== null && firstCatchEnded(state)) return state;
  const ways = waysWith(state, landed.ways);
  if (state !== null && !isSelfRunningSource(landed.source)) return { ...state, ways };
  return {
    state: 'caught',
    at: landed.at,
    source: landed.source,
    day: (state === null ? null : firstCatchDay(state)) ?? landed.day,
    ways,
  };
}

/**
 * The catching step left with no way running by itself yet ("Skip for now"): kept with the day
 * and the ways walked, unless such a way has already caught something.
 */
export function leaveFirstCatch(
  state: FirstCatchState | null,
  left: { readonly day: LocalDate; readonly at: string; readonly ways?: readonly string[] },
): FirstCatchState {
  if (state !== null && firstCatchEnded(state)) return state;
  return { state: 'later', day: left.day, at: left.at, ways: waysWith(state, left.ways) };
}

/** Days Today's reminder stays away after "Not now". */
export const FIRST_CATCH_AWAY_DAYS = 7;

/** Times the reminder can be put away before it stays away. */
export const FIRST_CATCH_AWAY_TIMES = 3;

/** How often Today's reminder was put away, and the day of the last time; kept on the phone. */
export const firstCatchAwaySchema = z.object({
  times: z.number().int().positive(),
  day: z.string(),
});
export type FirstCatchAway = z.infer<typeof firstCatchAwaySchema>;

/** "Not now" on Today's reminder: one more time put away, today. */
export function putFirstCatchAway(away: FirstCatchAway | null, today: LocalDate): FirstCatchAway {
  return { times: (away?.times ?? 0) + 1, day: today };
}

/**
 * What Today's reminder says: `notSetUp` while no way that runs by itself is set up, `waiting`
 * once one is and nothing has come from it yet.
 */
export type FirstCatchReminder = 'notSetUp' | 'waiting';

export interface FirstCatchReminderInput {
  /** Where the first catch stands; fold a catch found among the spends in first. */
  readonly state: FirstCatchState | null;
  readonly today: LocalDate;
  /** The day 6pm was set up, for a phone that kept no state (set up before 6pm kept one). */
  readonly started?: LocalDate | null;
  /** Whether a way that runs by itself is set up, as far as the phone can tell. */
  readonly setUp: boolean;
  readonly away?: FirstCatchAway | null;
}

/**
 * Today's reminder to let spending log itself: from the morning after the catching step ended,
 * for anyone no bank alert, Wallet tap or forwarded email has reached yet, whether they skipped
 * the step, walked a way that has not delivered, or caught something by sharing or scanning. It
 * ends for good with the first such catch. Put away, it stays away for `FIRST_CATCH_AWAY_DAYS`
 * days, and for good once put away `FIRST_CATCH_AWAY_TIMES` times.
 */
export function firstCatchReminder(input: FirstCatchReminderInput): FirstCatchReminder | null {
  const { state, today } = input;
  if (state !== null && firstCatchEnded(state)) return null;
  const ended = state === null ? (input.started ?? null) : firstCatchDay(state);
  if (ended !== null && today <= ended) return null;
  const away = input.away ?? null;
  if (away !== null) {
    if (away.times >= FIRST_CATCH_AWAY_TIMES) return null;
    if (today < addDays(away.day, FIRST_CATCH_AWAY_DAYS)) return null;
  }
  return input.setUp ? 'waiting' : 'notSetUp';
}

/** A field read on a receipt and changed by hand afterwards: what was read, what it became. */
const changedAmount = z.object({ from: z.number().int().nullable(), to: z.number().int() });
const changedName = z.object({ from: z.string(), to: z.string() });

/**
 * A receipt the person corrected: its amount or its shop, never its category alone. `day` is the
 * spend's own day, for the card that shows the fix.
 */
export const captureFixSchema = z.object({
  id: z.string().min(1),
  day: z.string(),
  amount: changedAmount.optional(),
  merchant: changedName.optional(),
});
export type CaptureFix = z.infer<typeof captureFixSchema>;

interface Read {
  readonly amount: number | null;
  readonly merchant: string;
}

/**
 * Folds an edit into what is known of a receipt's fixes: the first reading is kept as what was
 * read, the newest value as what it became, and a field put back the way it was read is no
 * longer a fix. Only the amount and the shop count; a category, a note or a status change
 * leaves the receipt read right. Returns null when nothing is left fixed.
 */
export function foldCaptureFix(
  fix: CaptureFix | null,
  spend: { readonly id: string; readonly day: LocalDate } & Read,
  patch: { readonly amount?: number | undefined; readonly merchant?: string | undefined },
): CaptureFix | null {
  const readAmount = fix?.amount ? fix.amount.from : spend.amount;
  const readName = fix?.merchant ? fix.merchant.from : spend.merchant.trim();
  const amountNow = patch.amount ?? fix?.amount?.to ?? spend.amount;
  const nameNow = (patch.merchant ?? fix?.merchant?.to ?? spend.merchant).trim();
  const amount =
    amountNow !== null && amountNow !== readAmount ? { from: readAmount, to: amountNow } : null;
  // A name typed where none was read is a name added, not one read wrong.
  const merchant = readName !== '' && nameNow !== readName ? { from: readName, to: nameNow } : null;
  if (amount === null && merchant === null) return null;
  return {
    id: spend.id,
    day: spend.day,
    ...(amount ? { amount } : {}),
    ...(merchant ? { merchant } : {}),
  };
}

/** How the month's receipts were read on the phone. */
export interface CaptureAccuracy {
  /** Receipts read this month. */
  readonly total: number;
  /** Read right the first time: neither the amount nor the shop changed by hand. */
  readonly right: number;
  /** Sent once for a closer look (only the photo, never kept). */
  readonly looked: number;
  /** This month's fixes, newest receipt first. */
  readonly fixes: readonly CaptureFix[];
}

/**
 * The month's count for Settings › Your data, from the receipts read this month (by the day they
 * arrived, so an old receipt shared today counts today) and what is known of each: a fix to a
 * receipt from another month never counts here.
 */
export function captureAccuracy(
  reads: readonly { readonly id: string; readonly looked: boolean }[],
  fixes: readonly CaptureFix[],
): CaptureAccuracy {
  const ids = new Set(reads.map((read) => read.id));
  const counted = fixes.filter((fix) => ids.has(fix.id));
  const order = new Map(reads.map((read, n) => [read.id, n] as const));
  return {
    total: reads.length,
    right: reads.length - new Set(counted.map((fix) => fix.id)).size,
    looked: reads.filter((read) => read.looked).length,
    fixes: [...counted].sort((a, b) => (order.get(b.id) ?? 0) - (order.get(a.id) ?? 0)),
  };
}
