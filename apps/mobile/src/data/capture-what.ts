import {
  findDuplicate,
  sameAccount,
  type CaptureSighting,
  type NewSighting,
  type SightedSpend,
  type SpendRow,
} from '@6pm/domain';

import type { Capture, NewSpend } from './money-actions';

/**
 * The steps for a message that tells what became of a payment rather than of a new one, decided
 * before amount and time are matched: a charge that failed, a payment the bank took back, a
 * refund, money moved between the person's own accounts.
 */

/** A spend and the same amount back into the same account this close is a reversal. */
export const REVERSAL_WINDOW_MS = 60_000;
/** The two alerts of one transfer between the person's own accounts arrive this close. */
export const OWN_TRANSFER_WINDOW_MS = 60_000;

/** What these steps need of the matcher's own. */
export interface WhatTools {
  /** Rows from the last 45 days that can be the same payment (any status). */
  readonly recent: (amount: number) => Promise<SpendRow[]>;
  readonly withTrails: (rows: readonly SpendRow[]) => Promise<SightedSpend[]>;
  /** Rows the person answered ("Not mine", deleted), never merged away. */
  readonly tombstonesOf: (rows: readonly SpendRow[]) => Promise<SpendRow[]>;
  /** Rows a sighting with this bank code and account was kept with, either way. */
  readonly byCode: (sighting: CaptureSighting) => Promise<SpendRow[]>;
  /** What each row's sightings said it was (`what`), by row. */
  readonly whatsOf: (ids: readonly string[]) => Promise<ReadonlyMap<string, readonly string[]>>;
  /** Each row's own sighting's account, else the bank its detail or wallet names. */
  readonly accountsOf: (
    rows: readonly SpendRow[],
  ) => Promise<ReadonlyMap<string, { bank: string | null; accountTail: string | null }>>;
  readonly attachTo: (
    row: SpendRow,
    input: NewSpend,
    seenAt: string,
    s: CaptureSighting,
  ) => Promise<Capture>;
  /** Attaches and sets the row's status (the old one kept for undo), and its sightings' `what`. */
  readonly settle: (
    row: SpendRow,
    input: NewSpend,
    seenAt: string,
    s: CaptureSighting,
    status: 'skipped' | 'deleted',
    what: 'failed' | 'reversal' | 'ownTransfer',
  ) => Promise<Capture>;
  readonly newRow: (
    input: NewSpend,
    s: CaptureSighting,
    patch?: Partial<SpendRow>,
  ) => Promise<Capture>;
  readonly patch: (row: SpendRow, patch: Partial<SpendRow>) => Promise<SpendRow>;
}

export type WhatStep = 'failed' | 'reversal' | 'ownTransfer';

export interface WhatDecision {
  readonly step: WhatStep;
  /** What the capture did; null when it voided nothing and made nothing. */
  readonly capture: Capture | null;
}

const live = (row: SpendRow) => row.status !== 'skipped' && row.status !== 'deleted';
const wayOf = (row: Pick<SpendRow, 'direction'>) => row.direction ?? 'out';

export function whatSteps(tools: WhatTools) {
  const arriving = (input: NewSpend, sighting: CaptureSighting, seenAt: string): NewSighting => ({
    amount: Math.round(input.amount),
    source: input.source,
    status: input.status,
    at: seenAt,
    detail: input.detail ?? null,
    foreignAmount: input.foreignAmount ?? null,
    direction: sighting.direction,
    merchant: input.merchant,
    atKind: sighting.atKind ?? null,
    bank: sighting.bank ?? null,
    accountTail: sighting.accountTail ?? null,
  });

  /** The row a matcher finds among `rows`, loosened as `rules` says. */
  const matchAmong = async (
    rows: readonly SpendRow[],
    incoming: NewSighting,
    rules: { anyWitness?: boolean; anyDirection?: boolean },
    asCaught = false,
  ): Promise<SpendRow | null> => {
    const sighted = await tools.withTrails(rows);
    const found = findDuplicate(
      incoming,
      asCaught ? sighted.map((s) => ({ ...s, status: 'caught' as const })) : sighted,
      rules,
    );
    return found ? (rows.find((r) => r.id === found.id) ?? null) : null;
  };

  /**
   * The payment out a refund or a reversal gives back: the one with its bank code, else the same
   * amount from the same account, the nearest at or before it in the last 45 days.
   */
  const originalOf = async (
    input: NewSpend,
    sighting: CaptureSighting,
    seenAt: string,
  ): Promise<SpendRow | null> => {
    const coded = (await tools.byCode(sighting)).filter((r) => live(r) && wayOf(r) === 'out');
    if (coded[0]) return coded[0];
    const amount = Math.round(input.amount);
    const outs = (await tools.recent(amount)).filter(
      (r) => live(r) && wayOf(r) === 'out' && r.amount === amount && r.at <= seenAt,
    );
    const accounts = await tools.accountsOf(outs);
    const same = outs.filter((r) => {
      const account = accounts.get(r.id);
      return account !== undefined && sameAccount(account, sighting);
    });
    return same.sort((a, b) => (a.at < b.at ? 1 : -1))[0] ?? null;
  };

  /**
   * A charge that failed or was called off: the payment it tells of is voided (a row already
   * answered keeps it quietly); with none, nothing is made. The shop's word that a payment did
   * not go through voids the bank's notice of it too.
   */
  const failed = async (
    input: NewSpend,
    sighting: CaptureSighting,
    seenAt: string,
  ): Promise<WhatDecision> => {
    const coded = (await tools.byCode(sighting)).filter((r) => wayOf(r) === 'out');
    const recent = (await tools.recent(Math.round(input.amount))).filter((r) => wayOf(r) === 'out');
    const target =
      coded.find(live) ??
      (await matchAmong(recent.filter(live), arriving(input, sighting, seenAt), {
        anyWitness: true,
      }));
    if (target) {
      return {
        step: 'failed',
        capture: await tools.settle(target, input, seenAt, sighting, 'deleted', 'failed'),
      };
    }
    const graves = await tools.tombstonesOf([...coded, ...recent]);
    const grave =
      graves.find((r) => coded.includes(r)) ??
      (await matchAmong(graves, arriving(input, sighting, seenAt), { anyWitness: true }, true));
    return {
      step: 'failed',
      capture: grave ? await tools.attachTo(grave, input, seenAt, sighting) : null,
    };
  };

  /** A payment the bank took back: the original is voided; with none found, nothing is made. */
  const reversal = async (
    input: NewSpend,
    sighting: CaptureSighting,
    seenAt: string,
  ): Promise<WhatDecision> => {
    const original = await originalOf(input, sighting, seenAt);
    return {
      step: 'reversal',
      capture: original
        ? await tools.settle(original, input, seenAt, sighting, 'deleted', 'reversal')
        : null,
    };
  };

  /**
   * Money moved between the person's own accounts, as a mail tells it: the alert of either side
   * already caught is set aside and keeps it (a row set aside for the transfer before, at once);
   * with none, a row that counts as nothing is made, for the alerts to join when they come.
   */
  const ownTransfer = async (
    input: NewSpend,
    sighting: CaptureSighting,
    seenAt: string,
  ): Promise<WhatDecision> => {
    const incoming = arriving(input, sighting, seenAt);
    const recent = await tools.recent(Math.round(input.amount));
    const kept = await keptTransfer(recent, incoming);
    if (kept)
      return { step: 'ownTransfer', capture: await tools.attachTo(kept, input, seenAt, sighting) };
    const alert = await matchAmong(
      recent.filter((r) => r.status === 'caught'),
      incoming,
      { anyDirection: true },
    );
    if (alert) {
      return {
        step: 'ownTransfer',
        capture: await tools.settle(alert, input, seenAt, sighting, 'skipped', 'ownTransfer'),
      };
    }
    return {
      step: 'ownTransfer',
      capture: await tools.newRow(input, sighting, {
        status: 'skipped',
        previousStatus: input.status,
      }),
    };
  };

  /** A row already set aside as an own transfer that this sighting is another side of. */
  const keptTransfer = async (
    rows: readonly SpendRow[],
    incoming: NewSighting,
  ): Promise<SpendRow | null> => {
    const aside = rows.filter((r) => r.status === 'skipped');
    const whats = await tools.whatsOf(aside.map((r) => r.id));
    const transfers = aside.filter((r) => whats.get(r.id)?.includes('ownTransfer'));
    return matchAmong(transfers, incoming, { anyDirection: true }, true);
  };

  /**
   * Two alerts that move one amount opposite ways within a minute, before amount and time are
   * matched: from one account, the bank took the payment back (a reversal, whatever the words
   * say), and the pair counts as nothing; from two of the person's banks, money moved between
   * their own accounts, and both sides join one row set aside. A row already set aside as an own
   * transfer keeps any later side of it.
   */
  const pairs = async (
    input: NewSpend,
    sighting: CaptureSighting,
    seenAt: string,
  ): Promise<WhatDecision | null> => {
    const incoming = arriving(input, sighting, seenAt);
    const recent = await tools.recent(Math.round(input.amount));
    const kept = await keptTransfer(recent, incoming);
    if (kept)
      return { step: 'ownTransfer', capture: await tools.attachTo(kept, input, seenAt, sighting) };
    if (input.source !== 'alert' || input.foreignAmount) return null;
    const at = Date.parse(seenAt);
    const other = recent.filter(
      (r) =>
        r.source === 'alert' &&
        live(r) &&
        !r.foreignAmount &&
        r.amount === Math.round(input.amount) &&
        wayOf(r) !== sighting.direction &&
        Math.abs(Date.parse(r.at) - at) <= REVERSAL_WINDOW_MS,
    );
    if (other.length === 0) return null;
    const accounts = await tools.accountsOf(other);
    const nearest = (rows: readonly SpendRow[]) =>
      [...rows].sort(
        (a, b) => Math.abs(Date.parse(a.at) - at) - Math.abs(Date.parse(b.at) - at),
      )[0];
    const sameBank = other.filter((r) => {
      const account = accounts.get(r.id);
      return account !== undefined && sameAccount(account, sighting);
    });
    // The money out comes first and the same amount back after it: the out is undone.
    const back = nearest(
      sameBank.filter((r) =>
        wayOf(r) === 'out' ? Date.parse(r.at) <= at : at <= Date.parse(r.at),
      ),
    );
    if (back) {
      return {
        step: 'reversal',
        capture: await tools.settle(back, input, seenAt, sighting, 'deleted', 'reversal'),
      };
    }
    const across = nearest(
      other.filter(
        (r) => r.status === 'caught' && !sameBank.includes(r) && accounts.get(r.id)?.bank,
      ),
    );
    if (across && input.status === 'caught' && sighting.bank) {
      return {
        step: 'ownTransfer',
        capture: await tools.settle(across, input, seenAt, sighting, 'skipped', 'ownTransfer'),
      };
    }
    return null;
  };

  /**
   * A refund made a row of its own gives back the payment it answers, when that is found: it is
   * money in placed as a refund of it, so the close need not ask.
   */
  const linkRefund = async (
    capture: Capture,
    input: NewSpend,
    sighting: CaptureSighting,
    seenAt: string,
  ) => {
    const original = await originalOf(input, sighting, seenAt);
    if (!original) return capture;
    const row = await tools.patch(capture.row, { moneyIn: 'refund', givesBack: original.id });
    return { ...capture, row };
  };

  /**
   * A payment out just saved, for a refund of it that arrived first: the waiting refund with its
   * bank code, else the same amount into the same account, the nearest after it, is linked to it.
   */
  const refundsWaiting = async (payment: SpendRow, sighting: CaptureSighting) => {
    if (wayOf(payment) !== 'out') return;
    const waiting = (await tools.recent(payment.amount)).filter(
      (r) =>
        wayOf(r) === 'in' &&
        r.moneyIn === 'refund' &&
        (r.givesBack ?? null) === null &&
        r.amount === payment.amount &&
        r.status !== 'deleted' &&
        r.at >= payment.at,
    );
    if (waiting.length === 0) return;
    const coded = (await tools.byCode(sighting)).filter((r) => waiting.includes(r));
    const accounts = await tools.accountsOf(waiting);
    const refund =
      coded[0] ??
      waiting
        .filter((r) => {
          const account = accounts.get(r.id);
          return account !== undefined && sameAccount(account, sighting);
        })
        .sort((a, b) => (a.at < b.at ? -1 : 1))[0];
    if (refund) await tools.patch(refund, { givesBack: payment.id });
  };

  return { failed, reversal, ownTransfer, pairs, linkRefund, refundsWaiting };
}
