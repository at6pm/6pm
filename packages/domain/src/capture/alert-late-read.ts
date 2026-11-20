import { z } from 'zod';

import { heardWordsSchema } from '../contracts/heard';
import type { InboxSpend } from '../contracts/surfaces';
import type { SecondReadOutcome } from './capture-log';
import { namesNoPayee } from './payee-names';

/**
 * A caught bank alert whose second reading got no answer when it was brought in (slow, offline,
 * refused): its row was saved as the phone read it, and the server is asked again until it
 * answers or the alert is two days old. The alert's words wait on the phone for that asking and
 * nowhere else; they are dropped with the entry.
 */
export const alertReadWaitingSchema = z.object({
  /** The row the alert was saved as, or the payment seen another way that it joined. */
  spendId: z.string().min(1),
  /** The alert's own id: its sighting on that row carries it. */
  captureId: z.string().min(1),
  /** When the alert came, ISO 8601. */
  at: z.string().min(20),
  /** The alert's own words, for the asking. */
  words: heardWordsSchema,
  /** What the phone read from it. */
  read: z.object({
    direction: z.enum(['out', 'in']),
    amount: z.number().int().nullable(),
    foreign: z
      .object({ currency: z.string(), amount: z.string(), rate: z.string().optional() })
      .optional(),
    merchant: z.string(),
  }),
  /** The name and the category its row was saved with. */
  saved: z.object({ merchant: z.string(), categoryId: z.string() }),
});
export type AlertReadWaiting = z.infer<typeof alertReadWaitingSchema>;

/** Whether an alert's second reading is asked for again: it was asked, or due to be, and no answer came. */
export function waitsForLateRead(outcome: SecondReadOutcome | undefined): boolean {
  return outcome === 'late' || outcome === 'stopped' || outcome?.startsWith('failed:') === true;
}

/** The entries still young enough to ask about: one whose alert came `waitMs` ago or more goes. */
export function alertReadsStillWaiting(
  entries: readonly AlertReadWaiting[],
  now: number,
  waitMs: number,
): AlertReadWaiting[] {
  return entries.filter((entry) => {
    const at = Date.parse(entry.at);
    return !Number.isNaN(at) && now - at < waitMs;
  });
}

/** The phone's reading as the item the second reader lays its own over (`withAlertReading`). */
export function waitingAlertItem(entry: AlertReadWaiting): InboxSpend {
  return {
    v: 1,
    id: entry.captureId,
    kind: 'spend',
    source: 'alert',
    status: 'caught',
    at: entry.at,
    amount: entry.read.amount,
    merchant: entry.read.merchant,
    categoryId: null,
    ...(entry.read.foreign ? { foreign: entry.read.foreign } : {}),
    direction: entry.read.direction,
  };
}

/** The row a late reading may change, as it is now. */
export interface LateReadRow {
  readonly id: string;
  readonly source: string;
  readonly status: string;
  /** `in` for money that came in; anything else is spending. */
  readonly direction?: 'out' | 'in' | null | undefined;
  readonly merchant: string;
  readonly categoryId: string;
}

/** What a late reading came to, once names and rules have been looked up. */
export interface LateReading {
  /** The alert as the server read it (`withAlertReading` over `waitingAlertItem`). */
  readonly reread: InboxSpend;
  /** The name the row would carry: the person's own earlier name for this payee, else the server's. */
  readonly merchant: string;
  /** Where that name is filed (the person's rule, their earlier filing, the server's category); null when nothing says. */
  readonly categoryId: string | null;
}

const nameless = (name: string) => name.trim() === '' || namesNoPayee(name);

/** Whether the server read the same money the phone did: its way and its amount. */
export function lateReadAgrees(entry: AlertReadWaiting, reread: InboxSpend): boolean {
  return (
    reread.direction === entry.read.direction &&
    reread.amount === entry.read.amount &&
    reread.foreign?.amount === entry.read.foreign?.amount &&
    reread.foreign?.currency === entry.read.foreign?.currency
  );
}

/**
 * What a late reading changes on the row, if anything. Nothing when the row is gone, deleted or
 * skipped, when it no longer goes the way the alert said, or when the server read other money
 * than the phone did: the row stays as it was saved. Otherwise the name is set while the row
 * still carries the name it was saved with, and that name is the phone's own reading or none: a
 * name the person gave the payee before stays, a payment the alert only joined is named only if
 * it had no name, and a shared receipt keeps its own (a change to it counts as a correction of
 * the receipt's reading). The category comes with the name, for money out, while the row still has
 * the category it was saved with and the person has not kept it: a row they renamed or kept is
 * filed where they left it.
 */
export function lateReadPatch(
  entry: AlertReadWaiting,
  row: LateReadRow | null,
  reading: LateReading,
): { readonly merchant?: string; readonly categoryId?: string } {
  if (row === null || row.status === 'deleted' || row.status === 'skipped') return {};
  if ((row.direction === 'in') !== (entry.read.direction === 'in')) return {};
  if (!lateReadAgrees(entry, reading.reread)) return {};
  if (row.source === 'shared') return {};
  const joined = row.id !== entry.captureId;
  // The name is the server's to give only where the phone's own reading, or nothing, stands: a
  // name the person gave this payee before, or another witness's, is not the alert's to change.
  const untouched =
    row.merchant === entry.saved.merchant &&
    (nameless(row.merchant) || (!joined && row.merchant === entry.read.merchant));
  const name = reading.merchant.trim();
  // Whatever name the server gives is taken, as at the first reading; only none at all is not.
  if (!untouched || name === '') return {};
  const renamed = name !== row.merchant;
  const refiled =
    entry.read.direction === 'out' &&
    row.status !== 'kept' &&
    reading.categoryId !== null &&
    row.categoryId === entry.saved.categoryId &&
    reading.categoryId !== row.categoryId;
  return {
    ...(renamed ? { merchant: name } : {}),
    ...(refiled && reading.categoryId !== null ? { categoryId: reading.categoryId } : {}),
  };
}
