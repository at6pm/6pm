import { z } from 'zod';

import type { SpendSource } from '../spend/spend';
import { addDays, diffDays, type LocalDate } from '../time/local-date';

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

/**
 * The sources that are spending caught on its own (a shared receipt, a Wallet tap, a bank alert,
 * a forwarded email, a scanned code): any one of them is a first catch. Typed and spoken spends
 * are not.
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
  /** "I'll do it later": the day it was said, when, and the ways set up by then. */
  z.object({
    state: z.literal('later'),
    day: z.string(),
    at: z.string(),
    ways: z.array(z.string()).optional(),
  }),
  /** A real catch landed (in onboarding or from Today's card). */
  z.object({ state: z.literal('caught'), at: z.string() }),
]);
export type FirstCatchState = z.infer<typeof firstCatchStateSchema>;

/**
 * Today's "Your first receipt goes here" card: from the morning after "I'll do it later" was
 * chosen, until a real catch lands. Never for anyone who did not choose later.
 */
export function firstCatchCardDue(state: FirstCatchState | null, today: LocalDate): boolean {
  return state?.state === 'later' && today > state.day;
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
