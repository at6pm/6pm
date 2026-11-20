import {
  alertReadAsk,
  lateReadAgrees,
  lateReadPatch,
  waitingAlertItem,
  withAlertReading,
  type AlertReadWaiting,
  type LateReadRow,
} from '@6pm/domain';

import type { AlertReadsWaiting } from '../../data/alert-read-waiting';
import { ApiRequestError } from '../api/api-error';
import { readAiMode } from '../privacy/ai-mode';
import {
  askAlertRead,
  STOPS_ASKING,
  type AlertReadAnswer,
  type ReadAlertsDeps,
} from './read-alert';

/** One late asking: nothing waits on it, and the server gives the model 6 s. */
export const LATE_READ_TIMEOUT_MS = 10_000;
/** How many waiting alerts are asked about at once. */
const AT_ONCE = 3;

export interface LateAlertReadsDeps extends Omit<ReadAlertsDeps, 'now'> {
  /** The alerts waiting for their second reading. */
  readonly waiting: AlertReadsWaiting;
  /** The row as it is now; null when it is gone. */
  readonly row: (spendId: string) => Promise<LateReadRow | null>;
  /** The name and category the person gave this payee before, or null (`namedBefore`). */
  readonly namedBefore: (
    payee: string,
  ) => Promise<{ readonly merchant: string; readonly categoryId: string } | null>;
  /** Says again who the alert's sighting on the row names. */
  readonly renameSighting: (spendId: string, captureId: string, payee: string) => Promise<void>;
  /** Changes the row, as any edit does. */
  readonly update: (
    spendId: string,
    patch: { readonly merchant?: string; readonly categoryId?: string },
  ) => Promise<unknown>;
}

/**
 * Asks the server again about the caught bank alerts whose second reading got no answer when
 * they were brought in. Their rows were saved as the phone read them; an answer that reads the
 * same money names the row and files it, as far as the person has not done so themselves
 * (`lateReadPatch`), and the alert's sighting says the new name, so the name is the bank's word
 * and never taken for the person's. An answer that reads other money, or none, changes nothing:
 * a row is never taken away or re-counted after it was shown.
 *
 * Once the server has answered, whatever it said, the alert is let go with its words. A failed
 * asking keeps it for the next one, and a failure every alert would meet ends this round. In
 * on-device mode nothing is asked and everything waiting is let go. One round at a time: a round
 * asked for during another is that one. Resolves with how many alerts still wait.
 */
export function createLateAlertReads(deps: LateAlertReadsDeps) {
  const { waiting } = deps;
  let round: Promise<number> | null = null;

  const named = async (entry: AlertReadWaiting, read: AlertReadAnswer, serverName: string) => {
    const categories = deps.categories();
    const before = await deps.namedBefore(serverName).catch(() => null);
    const merchant = before?.merchant ?? serverName;
    const filedBefore =
      before && categories.some((c) => c.id === before.categoryId) ? before.categoryId : null;
    const chosen =
      read.category === '' ? undefined : categories.find((c) => c.name === read.category);
    // The person's rule for the name files it; then where they filed this payee before; then the
    // server's category. Money in is never filed.
    const ruled = await deps.ruleCategory(merchant).catch(() => null);
    const ruledAsRead =
      merchant === serverName ? null : await deps.ruleCategory(serverName).catch(() => null);
    return {
      merchant,
      categoryId:
        entry.read.direction === 'in'
          ? null
          : (ruled ?? filedBefore ?? ruledAsRead ?? chosen?.id ?? null),
    };
  };

  /**
   * One alert: `done` once the server has answered or there is nothing to ask, `failed` when its
   * own asking failed, `down` when it failed in a way every alert would.
   */
  const one = async (entry: AlertReadWaiting): Promise<'done' | 'failed' | 'down'> => {
    const home = deps.home();
    const asked = alertReadAsk(entry.words, home);
    if (asked === null) return 'done';
    let read: AlertReadAnswer;
    try {
      read = await askAlertRead(deps, asked, home, LATE_READ_TIMEOUT_MS);
    } catch (error) {
      return !(error instanceof ApiRequestError) || STOPS_ASKING.has(error.failure)
        ? 'down'
        : 'failed';
    }
    const item = waitingAlertItem(entry);
    const reread = withAlertReading(item, read, asked, entry.words, home);
    // No money moved, as the server reads it: the row stays the person's to remove.
    if (reread === item || !lateReadAgrees(entry, reread)) return 'done';
    const row = await deps.row(entry.spendId);
    if (row === null || row.status === 'deleted' || row.status === 'skipped') return 'done';
    const serverName = reread.merchant.trim();
    if (serverName === '') return 'done';
    const patch = lateReadPatch(entry, row, { reread, ...(await named(entry, read, serverName)) });
    if (serverName !== entry.read.merchant.trim()) {
      await deps.renameSighting(entry.spendId, entry.captureId, serverName);
    }
    if (patch.merchant !== undefined || patch.categoryId !== undefined) {
      await deps.update(row.id, patch);
    }
    return 'done';
  };

  const run = async (): Promise<number> => {
    if (readAiMode(deps.settings) === 'device') {
      await waiting.clear();
      return 0;
    }
    const entries = [...(await waiting.list())];
    const total = entries.length;
    if (total === 0) return 0;
    const done: string[] = [];
    let down = false;
    const worker = async () => {
      for (let next = entries.shift(); next !== undefined; next = entries.shift()) {
        if (down) return;
        // A row that cannot be read or changed now is asked about again at the next round.
        const went = await one(next).catch(() => 'failed' as const);
        if (went === 'done') done.push(next.captureId);
        else if (went === 'down') down = true;
      }
    };
    await Promise.all(Array.from({ length: Math.min(AT_ONCE, total) }, worker));
    await waiting.drop(done);
    return total - done.length;
  };

  return (): Promise<number> => {
    round ??= run().finally(() => {
      round = null;
    });
    return round;
  };
}
