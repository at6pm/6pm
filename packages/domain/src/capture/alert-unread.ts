import { readBankAlert } from './bank-alert';
import { bankOfApp } from './bank-alert-senders';
import type { CaptureLogEvent } from './capture-log';
import { namesNoPayee } from './payee-names';

/**
 * Bank alerts no template read, counted per bank from the capture log: an alert whose amount or
 * way could not be read at all, and one that moved money and said more than the amount (a memo
 * with words in it) without any shape naming who was paid. A bank rewording its alerts shows here
 * first, as a count that climbs.
 */

/** One bank's count. */
export interface UnreadAlerts {
  /** The bank or wallet's catalogue short name ("MB Bank"). */
  readonly bank: string;
  readonly count: number;
}

/** Steps that saw a message already counted. */
const REPEATS: ReadonlySet<string> = new Set([
  'sameMessage',
  'repeatAlert',
  'repeatTap',
  'sameReceipt',
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
const text = (value: unknown): string | null => (typeof value === 'string' ? value : null);

/** A memo that says something, not only how money moved ("CHUYEN TIEN"). */
const saysSomething = (memo: string | null) =>
  memo !== null && /\p{L}{2}/u.test(memo) && !namesNoPayee(memo);

/** The bank an alert event came from, by catalogue name; null when it cannot be told. */
function bankOf(event: CaptureLogEvent, handed: Record<string, unknown>): string | null {
  const words = isRecord(handed.words) ? handed.words : null;
  const receipt = isRecord(handed.receipt) ? handed.receipt : null;
  return (
    event.sighting?.witness.name ??
    text(handed.bank) ??
    text(receipt?.bank) ??
    bankOfApp(text(words?.app))?.shortName ??
    null
  );
}

/** Whether no template read this alert: nothing at all, or no payee from words that name one. */
function unread(event: CaptureLogEvent, handed: Record<string, unknown>): boolean {
  if (event.step === 'notAPayment') return event.skipped === 'unread';
  if (handed.what !== undefined && handed.what !== 'refund') return false;
  const words = isRecord(handed.words) ? handed.words : null;
  if (words) {
    const read = readBankAlert({
      app: text(words.app),
      title: text(words.title),
      subtitle: text(words.subtitle),
      body: text(words.body) ?? '',
    });
    if (read.kind === 'skipped') return read.reason === 'unread';
    return read.counterparty === null && saysSomething(read.memo);
  }
  // Kept without its words: the name it was saved under is its memo, or nothing.
  const receipt = isRecord(handed.receipt) ? handed.receipt : null;
  const memo = text(receipt?.memo);
  const merchant = text(handed.merchant) ?? '';
  return saysSomething(memo) && (merchant === '' || merchant === memo);
}

/** Alerts no template read in the log's events, per bank, the most first. */
export function unreadAlertCounts(events: readonly CaptureLogEvent[]): UnreadAlerts[] {
  const counts = new Map<string, number>();
  for (const event of events) {
    if (event.channel !== 'alert' || REPEATS.has(event.step)) continue;
    const handed = isRecord(event.handed) ? event.handed : {};
    if (!unread(event, handed)) continue;
    const bank = bankOf(event, handed);
    if (bank !== null) counts.set(bank, (counts.get(bank) ?? 0) + 1);
  }
  return [...counts]
    .map(([bank, count]) => ({ bank, count }))
    .sort((a, b) => b.count - a.count || (a.bank < b.bank ? -1 : 1));
}
