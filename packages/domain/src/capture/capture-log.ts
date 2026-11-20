import type { BankAlertSkip } from './bank-alert';
import type { CaptureSighting, SightingChannel } from './sighting';

/**
 * What decided a capture's fate, in the order the steps run:
 * - `sameMessage`: the message was saved before (its id is a spend's or a sighting's).
 * - `repeatTap`: Wallet reported the same tap again.
 * - `sameReceipt`: the same bank receipt was shared again.
 * - `repeatAlert`: the same bank notification was caught again.
 * - `notAPayment`: a bank alert that moved no money (a code, a failed payment, an offer), heard
 *   only for the log.
 * - `failed`: a charge that did not go through; it voided the payment it tells of, if any.
 * - `reversal`: a payment the bank took back; it voided the original, if found.
 * - `tombstone`: another sighting of a payment the person answered "Not mine" or deleted; it is
 *   kept with that row and brings nothing back.
 * - `reference`: the bank's own code for a payment already saved, on the same account and way.
 * - `samePayment`: another witness of a payment already saved, by amount and time.
 * - `ownTransfer`: a side of money moved between the person's own accounts, kept with one row
 *   that counts as nothing.
 * - `newRow`: nothing held it; it became a row of its own.
 */
export type IngestStep =
  | 'sameMessage'
  | 'repeatTap'
  | 'sameReceipt'
  | 'repeatAlert'
  | 'notAPayment'
  | 'failed'
  | 'reversal'
  | 'tombstone'
  | 'reference'
  | 'samePayment'
  | 'ownTransfer'
  | 'newRow';

export const INGEST_STEPS: readonly IngestStep[] = [
  'sameMessage',
  'repeatTap',
  'sameReceipt',
  'repeatAlert',
  'notAPayment',
  'failed',
  'reversal',
  'tombstone',
  'reference',
  'samePayment',
  'ownTransfer',
  'newRow',
];

/** How long the capture log keeps an event. Older ones are dropped. */
export const CAPTURE_LOG_DAYS = 14;
const KEEP_MS = CAPTURE_LOG_DAYS * 24 * 60 * 60_000;

/** The row an event touched, as the log names it. */
export interface LoggedRow {
  readonly id: string;
  /** When the row says the payment happened, ISO 8601. */
  readonly at: string;
  readonly merchant: string;
}

/**
 * What became of a bank alert's second reading (the server's, after the phone's), as the log
 * says it. A code and never a word of the alert:
 * - `changed`: it answered, and its reading took the place of the phone's.
 * - `same`: it answered, and read what the phone read.
 * - `none`: it answered that no money moved.
 * - `device`: 6pm's AI runs on this phone, so nothing was asked.
 * - `no-amount`: the alert prints no amount to point at, so nothing was asked.
 * - `late`: the import's wait ran out before an answer came.
 * - `stopped`: a failure every alert would meet had stopped the asking before its turn.
 * - `failed:…`: the call failed, with how (`failed:network`, `failed:timeout`, `failed:invalid`).
 */
export type SecondReadOutcome =
  'changed' | 'same' | 'none' | 'device' | 'no-amount' | 'late' | 'stopped' | `failed:${string}`;

/** One capture as the log keeps it. */
export interface CaptureLogEvent {
  /** When the capture was decided, ISO 8601. */
  readonly loggedAt: string;
  readonly channel: SightingChannel;
  /** The words handed in, as they reached the app. */
  readonly handed: unknown;
  /** What 6pm read from them; null for an alert that moved no money. */
  readonly sighting: CaptureSighting | null;
  /** Why an alert moved no money, for `notAPayment`. */
  readonly skipped?: BankAlertSkip;
  /** The step that decided. */
  readonly step: IngestStep;
  /** The row it made or joined; null when it was dropped as a repeat. */
  readonly row: LoggedRow | null;
  /** A bank alert's second reading, when one was asked for; absent for every other capture. */
  readonly secondRead?: SecondReadOutcome;
}

/** The file's first line: what it is and since when it has been kept. */
interface CaptureLogHead {
  readonly log: 'capture';
  readonly v: 1;
  readonly since: string;
}

/** The log as read back. */
export interface CaptureLogContents {
  /** When the log was turned on, ISO 8601. */
  readonly since: string;
  /** Oldest first. */
  readonly events: readonly CaptureLogEvent[];
}

/** The first line of a log turned on at `since`. */
export function captureLogHead(since: Date): string {
  const head: CaptureLogHead = { log: 'capture', v: 1, since: since.toISOString() };
  return `${JSON.stringify(head)}\n`;
}

/** One event as a line of the file (JSON Lines). */
export function captureLogLine(event: CaptureLogEvent): string {
  return `${JSON.stringify(event)}\n`;
}

function parsed(line: string): unknown {
  try {
    return JSON.parse(line) as unknown;
  } catch {
    return null;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function headOf(value: unknown): CaptureLogHead | null {
  if (!isRecord(value) || value.log !== 'capture' || typeof value.since !== 'string') return null;
  return { log: 'capture', v: 1, since: value.since };
}

function eventOf(value: unknown): CaptureLogEvent | null {
  if (!isRecord(value) || typeof value.loggedAt !== 'string' || typeof value.step !== 'string') {
    return null;
  }
  return isRecord(value.sighting) || value.sighting === null
    ? (value as unknown as CaptureLogEvent)
    : null;
}

/**
 * The log a file holds, with every event older than `CAPTURE_LOG_DAYS` before `now` left out; a
 * line that cannot be read is skipped. Null when the text is not a capture log.
 */
export function readCaptureLog(text: string, now: Date): CaptureLogContents | null {
  const lines = text.split('\n').filter((line) => line.trim() !== '');
  const head = headOf(parsed(lines[0] ?? ''));
  if (!head) return null;
  const from = now.getTime() - KEEP_MS;
  const events: CaptureLogEvent[] = [];
  for (const line of lines.slice(1)) {
    const event = eventOf(parsed(line));
    const at = event ? Date.parse(event.loggedAt) : Number.NaN;
    if (event && !Number.isNaN(at) && at >= from) events.push(event);
  }
  return { since: head.since, events };
}

/** The file's text for a log: its head, then each event on its own line. */
export function captureLogText(contents: CaptureLogContents): string {
  return `${captureLogHead(new Date(contents.since))}${contents.events.map(captureLogLine).join('')}`;
}

/** Whether the log holds an event old enough to be dropped, so the file is written again. */
export function captureLogHasExpired(text: string, now: Date): boolean {
  const first = text.split('\n')[1] ?? '';
  const event = eventOf(parsed(first));
  if (!event) return false;
  return Date.parse(event.loggedAt) < now.getTime() - KEEP_MS;
}

/** The events the log holds about one row: any that touched it or a capture it now holds. */
export function eventsOfRow(
  events: readonly CaptureLogEvent[],
  ids: readonly string[],
): CaptureLogEvent[] {
  const held = new Set(ids);
  return events.filter((event) => event.row !== null && held.has(event.row.id));
}

/** What "This is wrong" hands to the share sheet for one row. */
export interface CaptureRowReport {
  /** The row as it stands. */
  readonly row: Readonly<Record<string, unknown>>;
  /** Every sighting the row holds, every field as kept. */
  readonly sightings: readonly Readonly<Record<string, unknown>>[];
  /** What the capture log saw of it, with the words 6pm was handed; empty while the log is off. */
  readonly events: readonly CaptureLogEvent[];
}

/**
 * The file "This is wrong" sends: one line saying what it is and when it was made, then the row,
 * its sightings and the log's events about it, each on its own line (JSON Lines), so it reads
 * like the capture log it comes from. It goes nowhere unless the person picks where in the share
 * sheet.
 */
export function captureRowReportText(report: CaptureRowReport, now: Date): string {
  const lines: unknown[] = [
    { report: 'capture-row', v: 1, at: now.toISOString() },
    { row: report.row },
    ...report.sightings.map((sighting) => ({ sighting })),
    ...report.events,
  ];
  return lines.map((line) => `${JSON.stringify(line)}\n`).join('');
}
