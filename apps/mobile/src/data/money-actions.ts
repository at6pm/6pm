import { randomUUID } from 'expo-crypto';

import {
  canKeep,
  findDuplicate,
  jarCover,
  learnedRule,
  mayBeSamePayment,
  mergedNaming,
  mergedStatus,
  merchantKeyOf,
  moneyDayOf,
  settleTypedAmount,
  type CategoryRow,
  type ClosedDayRow,
  type LocalDate,
  type SightedSpend,
  type SpendRow,
  type Witness,
} from '@6pm/domain';

import { homeCurrencyOf } from '../money/use-money-format';

import { noteReceiptEdit } from './first-catch';
import { markHandTake } from './jar-asks';
import { moneyInActions } from './money-in-actions';
import { findSpend, type MoneyStore } from './money-store';
import { syncPaidBill } from './paid-bill-sync';
import { NO_SPEND_PHOTOS, type SpendPhotos } from './spend-photos';

export interface NewSpend {
  /** Set when the capture already has one (an inbox item), so importing it twice finds it. */
  readonly id?: string;
  readonly amount: number;
  readonly categoryId: string;
  readonly merchant: string;
  readonly source: SpendRow['source'];
  /** Spends the user enters are kept at once; ones 6pm catches wait for the close. */
  readonly status: 'kept' | 'caught' | 'pending';
  readonly note?: string | null;
  readonly wallet?: string | null;
  readonly detail?: string | null;
  readonly foreignAmount?: SpendRow['foreignAmount'];
  /** The receipt printed no currency and the one saved was guessed. */
  readonly currencyGuessed?: boolean;
  /** A transfer's own words a bank printed ("Nội dung"), read when asking if it paid a bill. */
  readonly memo?: string | null;
  /** When it happened; now unless the source says otherwise. */
  readonly at?: Date;
  /**
   * The money day to file it under, when that is not the day the screens show: cash added to a
   * close that ran past 04:00 belongs to the day being closed.
   */
  readonly day?: LocalDate;
  /** `in` for money that came in; spending when left out. */
  readonly direction?: 'in' | 'out' | null;
  /** What the capture read money in as (an email read as a refund), for the close to ask. */
  readonly moneyIn?: 'refund' | null;
  /** The jar it comes out of (Quick add's "From a jar"); today's money when left out. */
  readonly fromPot?: string | null;
  /** Red envelopes a lì xì held ("5 bao × 200k"); none when left out. */
  readonly envelopes?: number | null;
  /**
   * The category to make first when the phone has none with its id (the Lì xì category, made the
   * first time a lì xì is kept).
   */
  readonly makeCategory?: CategoryRow;
}

/**
 * What saving a capture did: a new row, or the sighting of a payment that was already there.
 * `before` is the row as it was ahead of a merge, so the sighting can be taken out again.
 */
export interface Capture {
  readonly row: SpendRow;
  readonly merged: boolean;
  readonly before: SpendRow | null;
  readonly sighting: { readonly source: SpendRow['source']; readonly seenAt: string };
}

/** One way a spend was seen: the source trail on Details. */
export interface Sighting {
  readonly source: SpendRow['source'];
  readonly seenAt: string;
  readonly detail: string | null;
}

/** What an undo puts back besides the status: the amount and category an edit changed. */
export type UndoRestore = Partial<Pick<SpendRow, 'amount' | 'categoryId'>>;

/**
 * Every write the app makes to its money. Each one commits to the database first, then publishes
 * the new snapshot, so the screen never shows a state the phone has not saved. A spend's photo
 * goes with it: deleting the spend lets the file go (held for the undo), and undoing puts it back.
 */
export function moneyActions(store: MoneyStore, photos: SpendPhotos = NO_SPEND_PHOTOS) {
  const { tables } = store;

  /**
   * The patch that lets a spend's photo go; the file is held for that undo only: the spend's
   * delete brings back what the delete took, "Remove photo" what it took.
   */
  const letPhotoGo = async (
    row: SpendRow,
    why: 'deleted' | 'removed' = 'deleted',
  ): Promise<Partial<SpendRow>> => {
    if (!row.photo) return {};
    await photos.letGo(`${why}:${row.id}`, row.photo);
    return { photo: null };
  };

  // Writes run one after another, and after any load in flight: each reads the row as the one
  // before it left it, so two quick edits to the same spend (an amount, then a status) never
  // overwrite each other, and a reload never publishes what it read before a write.
  const inTurn = store.exclusive;

  const newestFirst = (rows: readonly SpendRow[]) =>
    [...rows].sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));

  const replaceSpend = (row: SpendRow) => {
    const snap = store.getSnapshot();
    const others = (list: readonly SpendRow[]) => list.filter((s) => s.id !== row.id);
    if (row.day < snap.cycle.start) {
      // A waiting item from before payday stays in the snapshot after it is answered (its details
      // and the close's running total still read it) until the next load drops it.
      const waitingBefore =
        row.status === 'deleted'
          ? others(snap.waitingBefore)
          : newestFirst([row, ...others(snap.waitingBefore)]);
      // A spend from before payday taken from a jar still lowers what the jar holds.
      const earlierJarSpends =
        row.fromPot != null && row.status !== 'deleted' && row.status !== 'skipped'
          ? [row, ...others(snap.earlierJarSpends)]
          : others(snap.earlierJarSpends);
      store.publish({ ...snap, waitingBefore, earlierJarSpends });
      return;
    }
    const inCycle = row.day <= snap.today;
    const cycleSpends =
      row.status === 'deleted' || !inCycle
        ? others(snap.cycleSpends)
        : newestFirst([row, ...others(snap.cycleSpends)]);
    store.publish({ ...snap, cycleSpends });
  };

  /** The row as the screen holds it, else as the database does (one read, not two). */
  const current = async (id: string): Promise<SpendRow | null> =>
    findSpend(store.getSnapshot(), id) ?? (await tables.spends.get(id));

  const patchNow = async (row: SpendRow, patch: Partial<SpendRow>): Promise<SpendRow> => {
    const next: SpendRow = { ...row, ...patch, updatedAt: new Date().toISOString() };
    await tables.spends.put(next);
    replaceSpend(next);
    // A bill the spend pays follows it: back to due when it is skipped or deleted, its amount.
    await syncPaidBill(store, row, next);
    return next;
  };

  /**
   * What a jar covers of a spend taken from it (M13): what the jar holds now, this spend's own
   * earlier part given back first, at most the spend; the rest counts today.
   */
  const coverOf = (row: SpendRow, potId: string, amount: number): number => {
    const snap = store.getSnapshot();
    const own = row.fromPot === potId ? (row.fromPotAmount ?? row.amount) : 0;
    return jarCover(amount, (snap.potSaved[potId] ?? 0) + own);
  };

  const update = (id: string, patch: Partial<SpendRow>): Promise<SpendRow | null> =>
    inTurn(async () => {
      const row = await current(id);
      if (!row) return null;
      await noteReceiptEdit(store.db, row, patch);
      const settled = settleTypedAmount(
        row.foreignAmount,
        patch,
        homeCurrencyOf(store.getSnapshot().plan),
      );
      const next = settled === undefined ? patch : { ...patch, foreignAmount: settled };
      // A new amount on a spend from a jar takes what the jar can give of it, no more.
      const jar = next.fromPot === undefined ? row.fromPot : next.fromPot;
      const amount = next.amount ?? row.amount;
      const cover =
        jar != null && next.amount !== undefined
          ? { fromPotAmount: coverOf(row, jar, amount) }
          : {};
      return patchNow(row, { ...next, ...cover });
    });

  /** The same payment seen a second way: one item, its sightings recorded, never two rows. */
  const mergeInto = async (twin: SpendRow, input: NewSpend, seenAt: string): Promise<Capture> => {
    const next: SpendRow = {
      ...twin,
      status: mergedStatus(twin.status, input.status),
      // The name that says most about who was paid, whichever sighting came first.
      ...mergedNaming(twin, input),
      note: twin.note ?? input.note ?? null,
      wallet: twin.wallet ?? input.wallet ?? null,
      memo: twin.memo ?? input.memo ?? null,
      // Money in seen again by an email read as a refund: the close still asks about the refund.
      moneyIn: twin.moneyIn ?? (twin.direction === 'in' ? (input.moneyIn ?? null) : null),
      updatedAt: new Date().toISOString(),
    };
    await store.db.withTransactionAsync(async () => {
      const insert =
        'INSERT OR IGNORE INTO spend_sightings (spend_id, source, seen_at, detail, capture_id) VALUES (?, ?, ?, ?, ?)';
      // The first sighting was never written on its own; it is part of the trail from now on.
      await store.db.runAsync(insert, [twin.id, twin.source, twin.at, twin.detail, twin.id]);
      await store.db.runAsync(insert, [
        twin.id,
        input.source,
        seenAt,
        input.detail ?? null,
        input.id ?? null,
      ]);
      await tables.spends.put(next);
    });
    replaceSpend(next);
    return { row: next, merged: true, before: twin, sighting: { source: input.source, seenAt } };
  };

  /**
   * The spends this capture could be a second sighting of, each with the ways it was seen already,
   * so a payment one witness saw is never given a second sighting by it.
   */
  const withTrails = async (spends: readonly SpendRow[]): Promise<SightedSpend[]> => {
    if (spends.length === 0) return [];
    const marks = spends.map(() => '?').join(', ');
    const rows = await store.db.getAllAsync<{
      spend_id: string;
      source: SpendRow['source'];
      detail: string | null;
    }>(
      `SELECT spend_id, source, detail FROM spend_sightings WHERE spend_id IN (${marks})`,
      spends.map((s) => s.id),
    );
    const trails = new Map<string, Witness[]>();
    for (const row of rows) {
      const trail = trails.get(row.spend_id) ?? [];
      trail.push({ source: row.source, detail: row.detail });
      trails.set(row.spend_id, trail);
    }
    return spends.map((s) => ({ ...s, seenBy: trails.get(s.id) ?? [] }));
  };

  const captureNow = async (input: NewSpend): Promise<Capture> => {
    const at = input.at ?? new Date();
    const snap = store.getSnapshot();
    const amount = Math.round(input.amount);
    // Only a spend of the same amount, a fee apart, or paid abroad can be the same payment.
    const candidates = snap.cycleSpends.filter((s) => mayBeSamePayment(s, amount));
    const twin = findDuplicate(
      {
        amount,
        source: input.source,
        status: input.status,
        at: at.toISOString(),
        detail: input.detail ?? null,
        foreignAmount: input.foreignAmount ?? null,
        direction: input.direction ?? null,
        merchant: input.merchant,
      },
      await withTrails(candidates),
    );
    if (twin) {
      const row = snap.cycleSpends.find((s) => s.id === twin.id);
      if (row) return mergeInto(row, input, at.toISOString());
    }
    const now = new Date().toISOString();
    const jar = input.fromPot ?? null;
    const row: SpendRow = {
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
      moneyIn: input.direction === 'in' ? (input.moneyIn ?? null) : null,
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
    };
    await tables.spends.put(row);
    replaceSpend(row);
    return { row, merged: false, before: null, sighting: { source: row.source, seenAt: row.at } };
  };

  /**
   * Takes back what a capture did and nothing else: a row it created is deleted; a payment it
   * only added a sighting to loses that sighting (and goes back to how it was, when nothing has
   * touched it since) and stays.
   */
  const withdrawNow = async (capture: Capture): Promise<SpendRow | null> => {
    const row = await current(capture.row.id);
    if (!row) return null;
    if (!capture.merged) {
      return patchNow(row, {
        status: 'deleted',
        previousStatus: row.status,
        ...(await letPhotoGo(row)),
      });
    }
    const { db } = store;
    const merged = capture.row;
    const untouched =
      capture.before !== null &&
      row.status === merged.status &&
      row.note === merged.note &&
      row.wallet === merged.wallet;
    const restored =
      untouched && capture.before
        ? { ...capture.before, updatedAt: new Date().toISOString() }
        : row;
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        'DELETE FROM spend_sightings WHERE spend_id = ? AND source = ? AND seen_at = ?',
        [row.id, capture.sighting.source, capture.sighting.seenAt],
      );
      const left = await db.getAllAsync<{ n: number }>(
        'SELECT COUNT(*) AS n FROM spend_sightings WHERE spend_id = ?',
        [row.id],
      );
      // A payment seen once has no trail: the first sighting is only kept alongside a second.
      if ((left[0]?.n ?? 0) <= 1) {
        await db.runAsync('DELETE FROM spend_sightings WHERE spend_id = ?', [row.id]);
      }
      if (restored !== row) await tables.spends.put(restored);
    });
    replaceSpend(restored);
    return restored;
  };

  return {
    addSpend: (input: NewSpend) =>
      inTurn(async () => {
        const made = input.makeCategory;
        if (made && !store.getSnapshot().categories.some((c) => c.id === made.id)) {
          await tables.categories.insertMissing(made);
          await store.loadInTurn(store.getSnapshot().today);
        }
        const { row } = await captureNow(input);
        // Quick add "From a jar" is taken by hand: it arms the jar for the close's question.
        if (row.fromPot != null && input.fromPot != null) {
          await markHandTake(store.db, row.id, row.fromPot);
        }
        return row;
      }),
    /** `addSpend`, also saying whether the payment merged into one already there. */
    captureSpend: (input: NewSpend) => inTurn(() => captureNow(input)),
    /** Takes back a capture (a cancelled payment) without touching anything it did not make. */
    withdrawCapture: (capture: Capture) => inTurn(() => withdrawNow(capture)),
    /**
     * A charge abroad just priced may be one the bank already debited in đồng (its alert or email
     * came first, and only now can the two amounts be compared): it then joins that payment as a
     * sighting, and its own row goes. Only a catch still waiting for the close is moved.
     */
    mergePriced: (id: string): Promise<SpendRow | null> =>
      inTurn(async () => {
        const row = await current(id);
        if (!row || row.status !== 'caught' || !row.foreignAmount || row.amount <= 0) return null;
        const snap = store.getSnapshot();
        const homeOnly = snap.cycleSpends.filter((s) => s.id !== id && !s.foreignAmount);
        const twin = findDuplicate(
          {
            amount: row.amount,
            source: row.source,
            status: row.status,
            at: row.at,
            detail: row.detail,
            foreignAmount: row.foreignAmount,
            direction: row.direction ?? null,
            merchant: row.merchant,
          },
          await withTrails(homeOnly),
        );
        const target = twin ? snap.cycleSpends.find((s) => s.id === twin.id) : undefined;
        if (!target) return null;
        const merged = await mergeInto(
          target,
          {
            id: row.id,
            amount: row.amount,
            categoryId: row.categoryId,
            merchant: row.merchant,
            source: row.source,
            status: row.status,
            note: row.note,
            wallet: row.wallet,
            detail: row.detail,
            memo: row.memo ?? null,
          },
          row.at,
        );
        // The payment keeps the first photo; one only the priced charge had moves over to it.
        const adopt = row.photo != null && merged.row.photo == null;
        const into = adopt ? await patchNow(merged.row, { photo: row.photo }) : merged.row;
        await patchNow(row, {
          status: 'deleted',
          previousStatus: row.status,
          ...(adopt ? { photo: null } : await letPhotoGo(row)),
        });
        return into;
      }),
    update,
    /**
     * "From a jar": the spend comes out of the jar as far as it holds, and leaves today's number
     * alone for that part (M13); null puts it back on today. Money in never comes from a jar.
     * Taken by hand (Details, a jar's page), it arms the jar for the close's question; the close's
     * own yes (`by: 'close'`) does not.
     */
    takeFromJar: (
      id: string,
      potId: string | null,
      by: 'hand' | 'close' = 'hand',
    ): Promise<SpendRow | null> =>
      inTurn(async () => {
        const row = await current(id);
        if (!row || row.direction === 'in') return null;
        if (potId === null) return patchNow(row, { fromPot: null, fromPotAmount: null });
        const next = await patchNow(row, {
          fromPot: potId,
          fromPotAmount: coverOf(row, potId, row.amount),
        });
        if (by === 'hand') await markHandTake(store.db, id, potId);
        return next;
      }),
    /**
     * Puts a spend's jar back exactly as it was (the undo of taking it off its jar on the jar's
     * page): the same jar and the same part it covered, whatever the jar holds now.
     */
    restoreJarTake: (
      id: string,
      taken: { readonly fromPot: string; readonly fromPotAmount: number | null | undefined },
    ): Promise<SpendRow | null> =>
      inTurn(async () => {
        const row = await current(id);
        if (!row || row.direction === 'in') return null;
        return patchNow(row, {
          fromPot: taken.fromPot,
          fromPotAmount: taken.fromPotAmount ?? null,
        });
      }),
    /**
     * Keep, not mine, delete: remembers the old status so the undo pill can put it back. An edit
     * made in the same breath (the close's "Save and keep") goes in the same write.
     */
    setStatus: (
      id: string,
      status: SpendRow['status'],
      edit: UndoRestore = {},
    ): Promise<SpendRow | null> =>
      inTurn(async () => {
        const row = await current(id);
        if (!row) return null;
        // A spend at 0 (unread, or abroad and still unpriced) is never confirmed: it waits under
        // Needs a look until an amount is typed or its rate arrives, so 0 is never counted.
        if (status === 'kept' && !canKeep({ amount: edit.amount ?? row.amount })) {
          return Object.keys(edit).length > 0 ? patchNow(row, edit) : row;
        }
        // Saying the same thing twice (a double tap) must not overwrite what undo would restore.
        if (row.status === status) return Object.keys(edit).length > 0 ? patchNow(row, edit) : row;
        const gone = status === 'deleted' ? await letPhotoGo(row) : {};
        return patchNow(row, { ...edit, ...gone, status, previousStatus: row.status });
      }),
    /** Puts back the status before the last change, and the amount and category an edit changed. */
    undo: (id: string, restore: UndoRestore = {}): Promise<SpendRow | null> =>
      inTurn(async () => {
        const row = await current(id);
        if (!row?.previousStatus) return null;
        // A deleted spend comes back with the photo it had.
        const photo = row.status === 'deleted' ? await photos.bringBack(`deleted:${row.id}`) : null;
        return patchNow(row, {
          ...restore,
          ...(photo ? { photo } : {}),
          status: row.previousStatus,
          previousStatus: null,
        });
      }),
    /**
     * Keeps a photo with the spend: `write` puts the picture at the URI it is given, and says
     * false when there was none (the picker was closed). It replaces the photo there was, unless
     * `ifNone` (a capture seen again keeps its first photo). The picture is written outside the
     * store's turn, so a picker left open holds nothing up.
     */
    attachPhoto: async (
      id: string,
      write: (uri: string) => Promise<boolean>,
      ifNone = false,
    ): Promise<SpendRow | null> => {
      const { name, uri } = photos.place(id);
      try {
        if (!(await write(uri))) {
          photos.remove(name);
          return null;
        }
        return await inTurn(async () => {
          const row = await current(id);
          if (!row || row.status === 'deleted' || (ifNone && row.photo)) {
            photos.remove(name);
            return null;
          }
          const next = await patchNow(row, { photo: name });
          if (row.photo && row.photo !== name) photos.remove(row.photo);
          return next;
        });
      } catch (error) {
        photos.remove(name);
        throw error;
      } finally {
        photos.placed(name);
      }
    },
    /** "Remove photo": the spend stays; the file is held for the undo. */
    removePhoto: (id: string): Promise<SpendRow | null> =>
      inTurn(async () => {
        const row = await current(id);
        if (!row?.photo) return null;
        return patchNow(row, await letPhotoGo(row, 'removed'));
      }),
    /** The undo of "Remove photo": the same photo back, when the spend has none since. */
    restorePhoto: (id: string): Promise<SpendRow | null> =>
      inTurn(async () => {
        const row = await current(id);
        if (!row || row.photo) return null;
        const photo = await photos.bringBack(`removed:${id}`);
        return photo ? patchNow(row, { photo }) : null;
      }),
    ...moneyInActions(store, { inTurn, current, patchNow, replaceSpend }),
    /** "Was this one for work?" — a work spend moves to Claim back, out of the daily number. */
    markForWork: (id: string, forWork: boolean) => update(id, { forWork }),
    /** The category a saved rule files this merchant under, or null when none applies. */
    ruleCategory: async (merchant: string): Promise<string | null> => {
      if (merchant.trim() === '') return null;
      const rule = await tables.rules.get(merchantKeyOf(merchant));
      return rule && store.getSnapshot().categories.some((c) => c.id === rule.categoryId)
        ? rule.categoryId
        : null;
    },
    /** "Always file Circle K as Shopping": the next catch from this merchant gets this category. */
    rememberMerchant: (merchant: string, categoryId: string) =>
      inTurn(async () => {
        const existing = await tables.rules.get(merchantKeyOf(merchant));
        await tables.rules.put(learnedRule(existing, merchant, categoryId));
      }),
    /** Every way a spend was seen, oldest first. Empty for a spend seen only once. */
    sightings: async (spendId: string): Promise<Sighting[]> => {
      const rows = await store.db.getAllAsync<{
        source: SpendRow['source'];
        seen_at: string;
        detail: string | null;
      }>(
        'SELECT source, seen_at, detail FROM spend_sightings WHERE spend_id = ? ORDER BY seen_at',
        [spendId],
      );
      return rows.map((r) => ({ source: r.source, seenAt: r.seen_at, detail: r.detail }));
    },
    /** Files the day's receipt: the Diary, the week strip and the streak read it. */
    closeDay: (row: ClosedDayRow) =>
      inTurn(async () => {
        await tables.closedDays.put(row);
        const snap = store.getSnapshot();
        store.publish({
          ...snap,
          closedDays: [...snap.closedDays.filter((d) => d.day !== row.day), row].sort((a, b) =>
            a.day < b.day ? -1 : 1,
          ),
        });
      }),
    /** How many days were closed before `day`: its receipt is the next number. */
    closedBefore: async (day: string): Promise<number> => {
      const rows = await store.db.getAllAsync<{ n: number }>(
        'SELECT COUNT(*) AS n FROM closed_days WHERE day < ?',
        [day],
      );
      return rows[0]?.n ?? 0;
    },
  };
}

export type MoneyActions = ReturnType<typeof moneyActions>;
