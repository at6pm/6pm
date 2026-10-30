import type { SpendDirection, SpendSource, SpendStatus } from '../spend/spend';

/**
 * Money moved between the person's own accounts tells 6pm twice, by alerts from two of their
 * banks or wallets: one says it went out, the other that it came in, the same amount within a
 * minute. That is neither spending nor money in. Names are never compared: whether a transfer
 * went to the person's own name cannot be known without theirs.
 */

/** The two alerts of one transfer between the person's own accounts arrive this close. */
export const OWN_TRANSFER_WINDOW_MS = 60_000;

/** An alert as caught: its way, its amount at home, and the bank or wallet that sent it. */
export interface AlertMovement {
  readonly source: SpendSource;
  /** When it happened, ISO 8601. */
  readonly at: string;
  /** In the home currency. */
  readonly amount: number;
  /** The bank or wallet that told 6pm. */
  readonly detail?: string | null | undefined;
  /** `in` for money that came in; absent or `out` for money that went out. */
  readonly direction?: SpendDirection | null | undefined;
  /** Set when it was paid in another currency: a transfer at home is in one currency. */
  readonly foreignAmount?: unknown;
}

/** A spend an alert became, still waiting for the close or answered. */
export interface SavedAlert extends AlertMovement {
  readonly id: string;
  readonly status: SpendStatus;
}

const bankOf = (alert: AlertMovement) => (alert.detail ?? '').trim().toLowerCase();
const wayOf = (alert: AlertMovement) => alert.direction ?? 'out';

/**
 * The other half of a transfer between the person's own accounts, for an alert just caught: an
 * alert still waiting for the close (never one the user answered) that went the other way, for
 * the same amount in the home currency, from another bank or wallet, at most
 * `OWN_TRANSFER_WINDOW_MS` before or after it. The nearest in time wins; null when there is none.
 */
export function ownTransferPair<T extends SavedAlert>(
  incoming: AlertMovement,
  existing: readonly T[],
): T | null {
  const at = Date.parse(incoming.at);
  if (incoming.source !== 'alert' || Number.isNaN(at) || !(incoming.amount > 0)) return null;
  if (incoming.foreignAmount || bankOf(incoming) === '') return null;
  let best: T | null = null;
  let bestGap = Infinity;
  for (const alert of existing) {
    if (alert.source !== 'alert' || alert.status !== 'caught' || alert.foreignAmount) continue;
    if (alert.amount !== incoming.amount || wayOf(alert) === wayOf(incoming)) continue;
    const bank = bankOf(alert);
    if (bank === '' || bank === bankOf(incoming)) continue;
    const gap = Math.abs(Date.parse(alert.at) - at);
    if (gap <= OWN_TRANSFER_WINDOW_MS && gap < bestGap) {
      best = alert;
      bestGap = gap;
    }
  }
  return best;
}
