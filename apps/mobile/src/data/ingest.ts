import {
  ALERT_REPEAT_WINDOW_MS,
  isRepeatTap,
  isSameReceipt,
  receiptDetail,
  repeatsAlert,
  sightingOfSpend,
  type AlertSighting,
  type CaptureSighting,
  type InboxHeard,
  type InboxSpend,
  type IngestStep,
  type SpendRow,
  type SpendSource,
} from '@6pm/domain';

import { homeCurrencyOf } from '../money/use-money-format';

import type { CaptureLog } from './capture-log';
import type { capturing } from './capture-match';
import type { Capture, NewSpend } from './money-actions';
import type { MoneyStore } from './money-store';

/**
 * One way in for every payment. Whatever caught it (a bank's alert, a mail, a shared receipt, a
 * Wallet tap, a code scanned, a spend typed or said), a capture arrives as a sighting with the
 * words it was read from and the spend it would become, and `ingest` decides, step by step, what
 * it is: a message already saved, a repeat of one, another witness of a payment already there, one
 * half of money moved between the person's own accounts, or a new row. It says which step decided,
 * and the capture log (when it is on) keeps that with the sighting and the row it touched.
 */

/** A capture as it reaches `ingest`. */
export interface Arrival {
  /** What its witness said, read from what was handed in. */
  readonly sighting: CaptureSighting;
  /** What was handed in, as it reached the app: an inbox file, a mail's reading, typed values. */
  readonly handed: unknown;
  /**
   * The spend it becomes when nothing holds it already. A function when making it costs something
   * (naming a shared receipt asks the server): it runs only once the message is known to be new.
   */
  readonly spend: NewSpend | (() => Promise<NewSpend>);
  /** The message's own id, when it has one: a message already saved is not saved again. */
  readonly message?: { readonly id: string; readonly source: SpendSource; readonly at: string };
  /**
   * A file from the inbox: the repeat checks only it gets (Wallet's second report of a tap, a
   * receipt shared again, a bank notification caught again), after `ready` has run, and the own
   * transfer it may be half of.
   */
  readonly inbox?: { readonly item: InboxSpend; readonly ready?: () => Promise<void> };
}

/** What `ingest` decided: the step, and what the capture did (null when it was a repeat). */
export interface Ingested {
  readonly step: IngestStep;
  readonly capture: Capture | null;
}

/**
 * Whether a capture was saved before: its id is a spend's, or it was merged into a payment seen
 * another way and its sighting carries its id. A sighting written before sightings kept their
 * capture is known by its source and time.
 */
export async function alreadyImported(
  store: MoneyStore,
  item: { readonly id: string; readonly source: SpendSource; readonly at: string },
): Promise<boolean> {
  if (await store.tables.spends.get(item.id)) return true;
  const seen = await store.db.getAllAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM spend_sightings
      WHERE capture_id = ? OR (capture_id IS NULL AND source = ? AND seen_at = ?)`,
    [item.id, item.source, new Date(item.at).toISOString()],
  );
  return (seen[0]?.n ?? 0) > 0;
}

/**
 * A bank notification caught a second time (`repeatsAlert`): the same as an alert saved as a
 * spend, or as a sighting on a payment seen another way first.
 */
async function repeatsSavedAlert(
  store: MoneyStore,
  incoming: InboxSpend,
  recent: readonly SpendRow[],
): Promise<boolean> {
  if (incoming.source !== 'alert') return false;
  const arriving: AlertSighting = {
    source: incoming.source,
    id: incoming.id,
    at: incoming.at,
    detail: receiptDetail(incoming.receipt),
    amount: incoming.amount,
  };
  if (recent.some((s) => repeatsAlert(arriving, s))) return true;
  const at = Date.parse(incoming.at);
  if (Number.isNaN(at)) return false;
  const around = (ms: number) => new Date(at + ms).toISOString();
  const seen = await store.db.getAllAsync<{
    capture_id: string | null;
    seen_at: string;
    detail: string | null;
  }>(
    `SELECT s.capture_id, s.seen_at, s.detail FROM spend_sightings s
      JOIN spends p ON p.id = s.spend_id
      WHERE s.source = 'alert' AND p.status != 'deleted' AND s.seen_at BETWEEN ? AND ?`,
    [around(-ALERT_REPEAT_WINDOW_MS), around(ALERT_REPEAT_WINDOW_MS)],
  );
  return seen.some((row) =>
    repeatsAlert(arriving, {
      source: 'alert',
      id: row.capture_id,
      at: row.seen_at,
      detail: row.detail,
    }),
  );
}

export interface IngestDeps {
  readonly store: MoneyStore;
  /** Runs a task in the store's turn. */
  readonly inTurn: <T>(task: () => Promise<T>) => Promise<T>;
  readonly decideNow: ReturnType<typeof capturing>['decideNow'];
  readonly log: CaptureLog;
}

/** `ingest`, and `ingestNow` for a capture already inside the store's turn. */
export function ingestion({ store, inTurn, decideNow, log }: IngestDeps) {
  const record = (
    arrival: Pick<Arrival, 'sighting' | 'handed'>,
    step: IngestStep,
    capture: Capture | null,
  ) => {
    // Kept beside the capture, never in its way: a log that cannot be written changes nothing.
    void log.record({
      loggedAt: new Date().toISOString(),
      channel: arrival.sighting.channel,
      handed: arrival.handed,
      sighting: arrival.sighting,
      step,
      row: capture
        ? { id: capture.row.id, at: capture.row.at, merchant: capture.row.merchant }
        : null,
    });
    return { step, capture };
  };

  /**
   * A spend the app captured from its own screens, inside the store's turn: the matcher, else a
   * new row. Its sighting is read from the spend unless the caller read it from its message.
   */
  const ingestNow = async (
    input: NewSpend,
    seen?: Pick<Arrival, 'sighting' | 'handed'>,
  ): Promise<Capture> => {
    const arrival = seen ?? {
      sighting: sightingOfSpend(input, homeCurrencyOf(store.getSnapshot().plan).code),
      handed: input,
    };
    const { step, capture } = await decideNow(input, arrival.sighting);
    record(arrival, step, capture);
    // A spend from the app's own screens is a payment or money in: it always lands somewhere.
    if (!capture) throw new Error('A spend captured on the phone made nothing');
    return capture;
  };

  /**
   * Every capture, in this order: the same message again; for an inbox file, Wallet's repeat of
   * a tap, the same receipt shared again, the same bank notification again; then, in the store's
   * turn (`capturing`), what the message is (a failed charge, a reversal, an own transfer), a row
   * the person answered, the bank's own code, another witness by amount and time, else a new row.
   */
  const ingest = async (arrival: Arrival): Promise<Ingested> => {
    if (arrival.message && (await alreadyImported(store, arrival.message))) {
      return record(arrival, 'sameMessage', null);
    }
    const inbox = arrival.inbox;
    if (inbox) {
      await inbox.ready?.();
      const snap = store.getSnapshot();
      const recent = [...snap.cycleSpends, ...snap.waitingBefore].filter(
        (s) => s.status !== 'deleted',
      );
      if (recent.some((s) => isRepeatTap(inbox.item, s))) return record(arrival, 'repeatTap', null);
      if (recent.some((s) => isSameReceipt(inbox.item, s))) {
        return record(arrival, 'sameReceipt', null);
      }
      if (await repeatsSavedAlert(store, inbox.item, recent)) {
        return record(arrival, 'repeatAlert', null);
      }
    }
    const input = typeof arrival.spend === 'function' ? await arrival.spend() : arrival.spend;
    const { step, capture } = await inTurn(() => decideNow(input, arrival.sighting));
    return record(arrival, step, capture);
  };

  /**
   * A bank alert that moved no money, handed in only while the log is on: it is logged with why,
   * and nothing else is done with it.
   */
  const hear = (heard: InboxHeard): void => {
    void log.record({
      loggedAt: new Date().toISOString(),
      channel: 'alert',
      handed: heard,
      sighting: null,
      step: 'notAPayment',
      row: null,
      skipped: heard.skipped,
    });
  };

  return { ingest, ingestNow, hear };
}
