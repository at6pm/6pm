import { randomUUID } from 'expo-crypto';

import {
  SENT_WINDOW_MS,
  addDays,
  areApart,
  findDuplicate,
  jarCover,
  matchWithoutAmount,
  mayBeSamePayment,
  mergedStatus,
  moneyDayOf,
  sameBooking,
  sameReference,
  sightingKey,
  type CaptureSighting,
  type NewSighting,
  type SightedSpend,
  type SightingAtKind,
  type SightingChannel,
  type SpendRow,
  type Witness,
} from '@6pm/domain';

import {
  INSERT_SIGHTING,
  ensureOwn,
  isOwnSighting,
  keyOfStored,
  readApartIndex,
  reproject,
  sightingValues,
} from './capture-sightings';
import { whatSteps, type WhatStep } from './capture-what';
import type { Capture, NewSpend } from './money-actions';
import { findSpend } from './money-store';
import { arrivingHeldBack } from './request-actions';
import type { MoneyStore } from './money-store';

/** A capture is matched against every row from this many days back, not this pay cycle only. */
export const CANDIDATE_DAYS = 45;

/**
 * The channels whose sightings arrive on their own, after the payment: these are the ones a row
 * the person answered "Not mine" or deleted keeps for itself. A receipt photographed, a code
 * scanned or a spend typed is the person acting now, and is never swallowed by an earlier answer.
 */
const ARRIVES_ALONE: ReadonlySet<SightingChannel> = new Set(['alert', 'email', 'shared', 'wallet']);

/** A sighting row as matching reads it. */
interface SightingRow {
  readonly spend_id: string;
  readonly capture_id: string | null;
  readonly source: SpendRow['source'];
  readonly seen_at: string;
  readonly detail: string | null;
  readonly at_kind: SightingAtKind | null;
  readonly bank: string | null;
  readonly account_tail: string | null;
  readonly reference: string | null;
  readonly direction: 'out' | 'in' | null;
}

/** What the decision was, and what the capture did. */
export interface Decision {
  readonly step: 'tombstone' | 'reference' | 'samePayment' | 'newRow' | WhatStep;
  /** What the capture did; null for a failed charge or a reversal that found nothing. */
  readonly capture: Capture | null;
}

/**
 * The steps that run inside the store's turn, in this order: a row the person answered "Not mine"
 * or deleted keeps any later sighting of its payment and brings nothing back (by the bank's code,
 * then by amount and time); a row with the same bank code, account and way takes it at any
 * distance in time; a shop's mail about a booking already paid is kept with that payment; another witness of a payment from the last 45 days takes it by amount and
 * time (`findDuplicate`); else it is a new row, its sighting kept from the start.
 */
export function capturing(store: MoneyStore, replaceSpend: (row: SpendRow) => void) {
  const { tables, db } = store;

  /** A row the screens hold (this cycle's, or one still waiting) is published; others are not. */
  const publish = (row: SpendRow) => {
    const snap = store.getSnapshot();
    const shown = findSpend(snap, row.id) !== null;
    if (
      shown ||
      row.day >= snap.cycle.start ||
      row.status === 'caught' ||
      row.status === 'pending'
    ) {
      replaceSpend(row);
    }
  };

  /** A row's own sighting (when it has none yet) and the one just seen. */
  const writeSightings = async (
    twin: SpendRow,
    input: NewSpend,
    seenAt: string,
    sighting?: CaptureSighting,
  ) => {
    await ensureOwn(db, twin);
    await db.runAsync(INSERT_SIGHTING, [
      twin.id,
      input.source,
      seenAt,
      input.detail ?? null,
      input.id ?? null,
      ...sightingValues(sighting),
    ]);
  };

  /** The same payment seen a second way: one item, its sightings recorded, never two rows. */
  const mergeInto = async (
    twin: SpendRow,
    input: NewSpend,
    seenAt: string,
    sighting?: CaptureSighting,
  ): Promise<Capture> => {
    const projected = await reproject(store, twin, input, seenAt, sighting);
    const next: SpendRow = {
      ...twin,
      status: mergedStatus(twin.status, input.status),
      ...projected,
      note: twin.note ?? input.note ?? null,
      wallet: twin.wallet ?? input.wallet ?? null,
      memo: twin.memo ?? input.memo ?? null,
      // Money in seen again by an email read as a refund: the close still asks about the refund.
      moneyIn: twin.moneyIn ?? (twin.direction === 'in' ? (input.moneyIn ?? null) : null),
      updatedAt: new Date().toISOString(),
    };
    await db.withTransactionAsync(async () => {
      await writeSightings(twin, input, seenAt, sighting);
      await tables.spends.put(next);
    });
    publish(next);
    return { row: next, merged: true, before: twin, sighting: { source: input.source, seenAt } };
  };

  /** A sighting kept with a row the person answered, the row left exactly as they left it. */
  const attachTo = async (
    row: SpendRow,
    input: NewSpend,
    seenAt: string,
    sighting: CaptureSighting,
  ): Promise<Capture> => {
    await db.withTransactionAsync(() => writeSightings(row, input, seenAt, sighting));
    return { row, merged: true, before: row, sighting: { source: input.source, seenAt } };
  };

  const sightingsOf = async (ids: readonly string[]): Promise<SightingRow[]> => {
    if (ids.length === 0) return [];
    return db.getAllAsync<SightingRow>(
      `SELECT spend_id, capture_id, source, seen_at, detail, at_kind, bank, account_tail, reference,
              direction
         FROM spend_sightings WHERE spend_id IN (${ids.map(() => '?').join(', ')})`,
      [...ids],
    );
  };

  /**
   * The spends this capture could be a second sighting of, each with what its own first sighting
   * said (and when) and the ways it was seen since, so a payment one witness saw is never given a
   * second sighting by it, and each sighting's time can be measured from; and each sighting's
   * key, for the pairs the person said are two.
   */
  const withTrails = async (
    spends: readonly SpendRow[],
  ): Promise<(SightedSpend & { readonly keys: readonly string[] })[]> => {
    const rows = await sightingsOf(spends.map((s) => s.id));
    const bySpend = new Map<string, SightingRow[]>();
    for (const row of rows) bySpend.set(row.spend_id, [...(bySpend.get(row.spend_id) ?? []), row]);
    return spends.map((s) => {
      const trail = bySpend.get(s.id) ?? [];
      const own = trail.find((r) => isOwnSighting(s, r));
      const seenBy: Witness[] = trail
        .filter((r) => r !== own)
        .map((r) => ({
          source: r.source,
          detail: r.detail,
          at: r.seen_at,
          atKind: r.at_kind,
          bank: r.bank,
          accountTail: r.account_tail,
        }));
      return {
        ...s,
        // Its first sighting's own time; the row's may follow a more exact one since.
        at: own?.seen_at ?? s.at,
        seenBy,
        atKind: own?.at_kind ?? null,
        bank: own?.bank ?? null,
        accountTail: own?.account_tail ?? null,
        keys:
          trail.length > 0
            ? trail.map(keyOfStored)
            : [keyOfStored({ capture_id: s.id, source: s.source, seen_at: s.at })],
      };
    });
  };

  /** Rows a later sighting merged away into another payment (a priced charge abroad). */
  const mergedAway = async (ids: readonly string[]): Promise<ReadonlySet<string>> => {
    if (ids.length === 0) return new Set();
    const rows = await db.getAllAsync<{ capture_id: string }>(
      `SELECT capture_id FROM spend_sightings
        WHERE capture_id IN (${ids.map(() => '?').join(', ')}) AND spend_id != capture_id`,
      [...ids],
    );
    return new Set(rows.map((r) => r.capture_id));
  };

  /**
   * A row the person answered: "Not mine" (skipped) or deleted, never a scan that was waiting and
   * then let go, and never a row merged away into another payment.
   */
  const tombstonesOf = async (rows: readonly SpendRow[]): Promise<SpendRow[]> => {
    const answered = rows.filter(
      (r) => (r.status === 'skipped' || r.status === 'deleted') && r.previousStatus !== 'pending',
    );
    const away = await mergedAway(answered.map((r) => r.id));
    return answered.filter((r) => !away.has(r.id));
  };

  /**
   * The rows a sighting with this bank code and account was already kept with: going the same way
   * (`sameWay`), or either way (a refund or reversal finds the payment it gives back).
   */
  const coded = async (sighting: CaptureSighting, sameWay: boolean): Promise<SpendRow[]> => {
    const reference = sighting.reference?.trim().toUpperCase();
    if (!reference) return [];
    const rows = await db.getAllAsync<SightingRow>(
      `SELECT spend_id, capture_id, source, seen_at, detail, at_kind, bank, account_tail, reference,
              direction
         FROM spend_sightings WHERE UPPER(reference) = ?`,
      [reference],
    );
    const ids = [
      ...new Set(
        rows
          .filter((r) =>
            sameReference(sighting, {
              reference: r.reference,
              direction: sameWay ? r.direction : sighting.direction,
              bank: r.bank,
              accountTail: r.account_tail,
            }),
          )
          .map((r) => r.spend_id),
      ),
    ];
    const found = await Promise.all(ids.map((id) => tables.spends.get(id)));
    return found
      .filter((r): r is SpendRow => r !== null && r.source !== 'import')
      .sort((a, b) => (a.at < b.at ? 1 : -1));
  };

  /**
   * The payment a shop's mail about a booking already paid restates: a row from the last 45 days
   * that a mail from the same site with a code it shares was kept with, going the same way, of at
   * least this amount (the booking's total, or a part of it). One still counted comes first, then
   * one the person answered; a row merged away into another payment is passed over.
   */
  const booked = async (input: NewSpend, sighting: CaptureSighting): Promise<SpendRow | null> => {
    if (sighting.channel !== 'email' || sighting.witness.kind !== 'shop' || !sighting.reference) {
      return null;
    }
    const rows = await db.getAllAsync<SightingRow>(
      `SELECT s.spend_id, s.capture_id, s.source, s.seen_at, s.detail, s.at_kind, s.bank,
              s.account_tail, s.reference, s.direction
         FROM spend_sightings s JOIN spends p ON p.id = s.spend_id
        WHERE s.source = 'email' AND s.reference IS NOT NULL AND p.day >= ? AND p.source != 'import'`,
      [addDays(store.getSnapshot().today, -CANDIDATE_DAYS)],
    );
    const said = {
      reference: sighting.reference,
      detail: input.detail,
      direction: sighting.direction,
    };
    const ids = [...new Set(rows.filter((r) => sameBooking(said, r)).map((r) => r.spend_id))];
    const amount = Math.round(input.amount);
    const found = (await Promise.all(ids.map((id) => tables.spends.get(id)))).filter(
      (r): r is SpendRow => r !== null && (r.foreignAmount != null || amount <= r.amount),
    );
    const live = found.find((r) => r.status !== 'skipped' && r.status !== 'deleted');
    return live ?? (await tombstonesOf(found))[0] ?? null;
  };

  /**
   * Writes a new row and its own sighting together. Money in read as a refund is placed as one
   * from the start, so it is never asked about as a pay, takings or a request; other money in from
   * a sender remembered holding back arrives with that share held back (`arrivingHeldBack`),
   * whichever way it was caught.
   */
  const newRow = async (
    input: NewSpend,
    sighting: CaptureSighting,
    patch: Partial<SpendRow> = {},
  ): Promise<Capture> => {
    const snap = store.getSnapshot();
    const at = input.at ?? new Date();
    const now = new Date().toISOString();
    const jar = input.fromPot ?? null;
    const refund = input.direction === 'in' && sighting.what === 'refund';
    const made: SpendRow = {
      id: input.id ?? randomUUID(),
      // Captured now, it belongs to the day the screens are showing; a recorded time files itself.
      day: input.day ?? (input.at ? moneyDayOf(input.at) : snap.today),
      at: at.toISOString(),
      amount: Math.round(input.amount),
      categoryId: input.categoryId,
      merchant: input.merchant,
      note: input.note ?? null,
      source: input.source,
      status: input.status,
      previousStatus: null,
      wallet: input.wallet ?? null,
      forWork: false,
      detail: input.detail ?? null,
      foreignAmount: input.foreignAmount ?? null,
      currencyGuessed: input.currencyGuessed ?? false,
      memo: input.memo ?? null,
      direction: input.direction === 'in' ? 'in' : null,
      moneyIn: input.direction === 'in' ? (input.moneyIn ?? (refund ? 'refund' : null)) : null,
      givesBack: null,
      savedTo: null,
      fromPot: input.direction === 'in' ? null : jar,
      fromPotAmount:
        jar === null || input.direction === 'in'
          ? null
          : jarCover(Math.round(input.amount), snap.potSaved[jar] ?? 0),
      envelopes: input.envelopes ?? null,
      createdAt: now,
      updatedAt: now,
      ...patch,
    };
    const row =
      sighting.what === 'incoming' || sighting.what === 'payment'
        ? await arrivingHeldBack(store, made)
        : made;
    await db.withTransactionAsync(async () => {
      await tables.spends.put(row);
      await db.runAsync(INSERT_SIGHTING, [
        row.id,
        row.source,
        row.at,
        row.detail,
        row.id,
        ...sightingValues(sighting),
      ]);
    });
    replaceSpend(row);
    return { row, merged: false, before: null, sighting: { source: row.source, seenAt: row.at } };
  };

  const decideNow = async (input: NewSpend, sighting: CaptureSighting): Promise<Decision> => {
    const seenAt = (input.at ?? new Date()).toISOString();
    // What the message is comes first: a failed charge, a reversal or an own transfer tells what
    // became of a payment, and is never matched as a second sighting of one.
    if (sighting.what === 'failed') return what.failed(input, sighting, seenAt);
    if (sighting.what === 'reversal') return what.reversal(input, sighting, seenAt);
    if (sighting.what === 'ownTransfer') return what.ownTransfer(input, sighting, seenAt);
    const paired = await what.pairs(input, sighting, seenAt);
    if (paired) return paired;
    const decided = await matchNow(input, sighting, seenAt);
    if (!decided.capture) return decided;
    if (decided.step === 'newRow' && sighting.what === 'refund') {
      return {
        ...decided,
        capture: await what.linkRefund(decided.capture, input, sighting, seenAt),
      };
    }
    await what.refundsWaiting(decided.capture.row, sighting);
    return decided;
  };

  /** A payment or money in: a row the person answered, the bank's code, amount and time, else new. */
  const matchNow = async (
    input: NewSpend,
    sighting: CaptureSighting,
    seenAt: string,
  ): Promise<Decision> => {
    const amount = Math.round(input.amount);
    const keepsAnswer = ARRIVES_ALONE.has(sighting.channel);

    // The bank's own code, account and way: the same payment, however late it is told.
    const referenced = await coded(sighting, true);
    const answered = await tombstonesOf(referenced);
    const buried = answered[0];
    if (buried && keepsAnswer) {
      return { step: 'tombstone', capture: await attachTo(buried, input, seenAt, sighting) };
    }
    // A sighting the person said is another payment than a row's never joins that row again.
    const apart = await readApartIndex(db);
    const key = sightingKey({ captureId: input.id ?? null, source: input.source, at: seenAt });
    const together = async (rows: readonly SpendRow[]) =>
      (await withTrails(rows)).filter((s) => !areApart([key], s.keys, apart));
    const joinable = new Set((await together(referenced)).map((s) => s.id));
    const live = referenced.find(
      (r) => r.status !== 'skipped' && r.status !== 'deleted' && joinable.has(r.id),
    );
    if (live) {
      return { step: 'reference', capture: await mergeInto(live, input, seenAt, sighting) };
    }
    // A shop's later mail about a booking already paid, however it was read: kept with that
    // payment, which it only restates, and nothing new is made.
    const booking = await booked(input, sighting);
    if (booking) {
      return { step: 'reference', capture: await attachTo(booking, input, seenAt, sighting) };
    }

    const incoming: NewSighting = {
      amount,
      source: input.source,
      status: input.status,
      at: seenAt,
      detail: input.detail ?? null,
      foreignAmount: input.foreignAmount ?? null,
      direction: input.direction ?? null,
      merchant: input.merchant,
      atKind: sighting.atKind ?? null,
      bank: sighting.bank ?? null,
      accountTail: sighting.accountTail ?? null,
    };
    const candidates = await tables.spends.select(
      "WHERE day >= ? AND source != 'import' ORDER BY at DESC",
      [addDays(store.getSnapshot().today, -CANDIDATE_DAYS)],
    );
    // Only a spend of the same amount, a fee apart, or paid abroad can be the same payment.
    const recent = candidates.filter((s) => mayBeSamePayment(s, amount, incoming));

    if (keepsAnswer) {
      const graves = await tombstonesOf(recent);
      // Matched as if still caught: the matcher passes over answered rows otherwise.
      const sighted = (await withTrails(graves)).map((s) => ({ ...s, status: 'caught' as const }));
      const grave = findDuplicate(incoming, sighted);
      const row = grave ? graves.find((s) => s.id === grave.id) : undefined;
      if (row) return { step: 'tombstone', capture: await attachTo(row, input, seenAt, sighting) };
    }

    const open = recent.filter((s) => s.status !== 'deleted');
    const twin = findDuplicate(incoming, await together(open));
    const row = twin ? open.find((s) => s.id === twin.id) : undefined;
    if (row) {
      return { step: 'samePayment', capture: await mergeInto(row, input, seenAt, sighting) };
    }
    // One of the two gave no amount (a Wallet tap at 0đ): time, witness and name join them, and
    // the row takes the amount the other gave.
    const blank = !(amount > 0) && !input.foreignAmount;
    const near = candidates.filter(
      (s) =>
        s.status !== 'deleted' &&
        s.status !== 'skipped' &&
        (blank ? s.amount > 0 : !(s.amount > 0) && s.foreignAmount == null) &&
        Math.abs(Date.parse(s.at) - Date.parse(seenAt)) <= SENT_WINDOW_MS,
    );
    const unpriced = near.length > 0 ? matchWithoutAmount(incoming, await together(near)) : null;
    const partner = unpriced ? near.find((s) => s.id === unpriced.id) : undefined;
    if (partner) {
      return { step: 'samePayment', capture: await mergeInto(partner, input, seenAt, sighting) };
    }
    return { step: 'newRow', capture: await newRow(input, sighting) };
  };

  /** Rows from the last 45 days that can be the same payment as this amount, any status. */
  const recent = async (amount: number): Promise<SpendRow[]> =>
    (
      await tables.spends.select("WHERE day >= ? AND source != 'import' ORDER BY at DESC", [
        addDays(store.getSnapshot().today, -CANDIDATE_DAYS),
      ])
    ).filter((s) => mayBeSamePayment(s, amount));

  const marks = (ids: readonly string[]) => ids.map(() => '?').join(', ');

  const whatsOf = async (ids: readonly string[]) => {
    const found = new Map<string, string[]>();
    if (ids.length === 0) return found;
    const rows = await db.getAllAsync<{ spend_id: string; what: string | null }>(
      `SELECT spend_id, what FROM spend_sightings WHERE spend_id IN (${marks(ids)})`,
      [...ids],
    );
    for (const r of rows)
      if (r.what) found.set(r.spend_id, [...(found.get(r.spend_id) ?? []), r.what]);
    return found;
  };

  /** Each row's account: its own sighting's, else the bank its alert came from or it was paid from. */
  const accountsOf = async (rows: readonly SpendRow[]) => {
    const own = new Map(
      (await sightingsOf(rows.map((r) => r.id)))
        .filter((r) => rows.some((row) => row.id === r.spend_id && isOwnSighting(row, r)))
        .map((r) => [r.spend_id, r] as const),
    );
    return new Map(
      rows.map((r) => {
        const sighting = own.get(r.id);
        const bank = sighting?.bank ?? (r.source === 'alert' ? r.detail : r.wallet) ?? null;
        return [r.id, { bank, accountTail: sighting?.account_tail ?? null }] as const;
      }),
    );
  };

  /** Attaches a sighting and sets the row's status, the old one kept for its undo. */
  const settle = async (
    row: SpendRow,
    input: NewSpend,
    seenAt: string,
    sighting: CaptureSighting,
    status: 'skipped' | 'deleted',
    said: 'failed' | 'reversal' | 'ownTransfer',
  ): Promise<Capture> => {
    const next: SpendRow = {
      ...row,
      status,
      previousStatus: row.status,
      updatedAt: new Date().toISOString(),
    };
    await db.withTransactionAsync(async () => {
      await writeSightings(row, input, seenAt, sighting);
      // Every sighting of the row says what it became: what voided it, or that it moved nothing.
      await db.runAsync(
        `UPDATE spend_sightings SET what = ? WHERE spend_id = ? AND (what IS NULL OR what IN ('payment', 'incoming'))`,
        [said, row.id],
      );
      await tables.spends.put(next);
    });
    publish(next);
    return { row: next, merged: true, before: row, sighting: { source: input.source, seenAt } };
  };

  const patch = async (row: SpendRow, changes: Partial<SpendRow>): Promise<SpendRow> => {
    const next: SpendRow = { ...row, ...changes, updatedAt: new Date().toISOString() };
    await tables.spends.put(next);
    publish(next);
    return next;
  };

  const what = whatSteps({
    recent,
    withTrails,
    tombstonesOf,
    byCode: (sighting) => coded(sighting, false),
    whatsOf,
    accountsOf,
    attachTo,
    settle,
    newRow,
    patch,
  });

  return { mergeInto, withTrails, decideNow };
}
