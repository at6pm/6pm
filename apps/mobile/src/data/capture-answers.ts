import { randomUUID } from 'expo-crypto';

import {
  TYPED_TWIN_WINDOW_MS,
  mergeProjected,
  moneyDayOf,
  splitProjected,
  typedTwinOf,
  type SpendRow,
  type TwinRow,
} from '@6pm/domain';

import { homeCurrencyOf } from '../money/use-money-format';

import {
  ensureOwn,
  forgetApart,
  keyOfStored,
  placed,
  readApartIndex,
  rememberApart,
  seenOnRow,
  storedSightings,
  withOwn,
  type StoredSighting,
} from './capture-sightings';
import type { MoneyStore } from './money-store';

/**
 * What the person answers about how a payment was caught: "Same as your 50k at 10:30?" on a
 * caught payment that looks like one they typed, and "These are two" on a merged row. Yes joins
 * the two rows' sightings into the typed one; No and "These are two" remember the pair, so it is
 * never offered or merged again. Each has its undo.
 */

/** A sighting moved from one row to another: where it was, by its place in the table. */
interface Moved {
  readonly source: SpendRow['source'];
  readonly seenAt: string;
}

/** A caught payment joined to the spend the person typed: both rows as they were. */
export interface Joined {
  readonly typed: SpendRow;
  readonly caught: SpendRow;
  readonly moved: readonly Moved[];
}

/** A sighting split off a merged row: the row as it was, and the row the sighting now holds. */
export interface Split {
  readonly row: SpendRow;
  /** The row the split sighting went to, as it was before (null when it was made for it). */
  readonly other: SpendRow | null;
  /** That row as the split left it. */
  readonly made: SpendRow;
  readonly moved: Moved;
  readonly key: string;
  readonly staying: readonly string[];
}

/** One witness of a row, for Details: who spoke, how, and when. */
export interface WitnessLine {
  readonly source: SpendRow['source'];
  readonly channel: StoredSighting['channel'];
  readonly witness: StoredSighting['witness_kind'];
  /** The bank or shop that spoke, by name, when the sighting says. */
  readonly name: string | null;
  readonly bank: string | null;
  readonly detail: string | null;
  readonly at: string;
  /** The sighting the row was made from. */
  readonly own: boolean;
}

export interface AnswerDeps {
  readonly store: MoneyStore;
  readonly inTurn: <T>(task: () => Promise<T>) => Promise<T>;
  readonly current: (id: string) => Promise<SpendRow | null>;
  /** Publishes a row the database now holds. */
  readonly replaceSpend: (row: SpendRow) => void;
}

const live = (row: SpendRow | null): row is SpendRow =>
  row !== null && row.status !== 'skipped' && row.status !== 'deleted';

export function captureAnswers({ store, inTurn, current, replaceSpend }: AnswerDeps) {
  const { db, tables } = store;
  const home = () => homeCurrencyOf(store.getSnapshot().plan).code;

  const sightingsOf = async (row: SpendRow) => withOwn(row, await storedSightings(db, [row.id]));
  const keysOf = async (row: SpendRow) => (await sightingsOf(row)).map(keyOfStored);

  const asTwin = async (row: SpendRow): Promise<TwinRow> => ({
    id: row.id,
    amount: row.amount,
    source: row.source,
    status: row.status,
    at: row.at,
    direction: row.direction,
    keys: await keysOf(row),
  });

  /** Moves one sighting to another row, claiming it for that row when it names no capture. */
  const move = (s: Moved, from: string, to: string) =>
    db.runAsync(
      `UPDATE OR IGNORE spend_sightings SET spend_id = ?
        WHERE spend_id = ? AND source = ? AND seen_at = ?`,
      [to, from, s.source, s.seenAt],
    );

  /**
   * The spend the person typed that this caught payment may be ("Same as your 50k at 10:30?"),
   * or null when none is, or the two were said to be two.
   */
  const typedTwin = async (id: string): Promise<SpendRow | null> => {
    const row = await current(id);
    if (!live(row)) return null;
    const t = Date.parse(row.at);
    const near = await tables.spends.select(
      "WHERE at BETWEEN ? AND ? AND status NOT IN ('deleted', 'skipped') AND id != ?",
      [
        new Date(t - TYPED_TWIN_WINDOW_MS).toISOString(),
        new Date(t + TYPED_TWIN_WINDOW_MS).toISOString(),
        id,
      ],
    );
    if (near.length === 0) return null;
    const rows = await Promise.all([row, ...near].map(asTwin));
    const [caught] = rows;
    if (!caught) return null;
    const twin = typedTwinOf(caught, rows, await readApartIndex(db));
    return twin ? (near.find((r) => r.id === twin.id) ?? null) : null;
  };

  /**
   * Yes, the same payment: every sighting of the caught row joins the typed one, which keeps what
   * the person typed and takes the rest from the best witness; the caught row goes, merged away.
   */
  const join = (caughtId: string, typedId: string): Promise<Joined | null> =>
    inTurn(async () => {
      const [caught, typed] = [await current(caughtId), await current(typedId)];
      if (!live(caught) || !live(typed)) return null;
      await ensureOwn(db, caught);
      await ensureOwn(db, typed);
      const arriving = await storedSightings(db, [caught.id]);
      let before = seenOnRow(typed, await sightingsOf(typed));
      let next: SpendRow = typed;
      for (const seen of seenOnRow(caught, arriving)) {
        const projected = mergeProjected(next, before, seen, next.categoryId, home());
        next = { ...next, amount: projected.amount, merchant: projected.merchant };
        next = { ...next, ...placed(store, typed, { amount: next.amount, at: projected.at }) };
        before = [...before, seen];
      }
      next = {
        ...next,
        note: typed.note ?? caught.note,
        memo: typed.memo ?? caught.memo ?? null,
        wallet: typed.wallet ?? caught.wallet,
        updatedAt: new Date().toISOString(),
      };
      const gone: SpendRow = {
        ...caught,
        status: 'deleted',
        previousStatus: caught.status,
        updatedAt: next.updatedAt,
      };
      const moved = arriving.map((s) => ({ source: s.source, seenAt: s.seen_at }));
      await db.withTransactionAsync(async () => {
        for (const s of moved) await move(s, caught.id, typed.id);
        await tables.spends.put(next);
        await tables.spends.put(gone);
      });
      replaceSpend(next);
      replaceSpend(gone);
      return { typed, caught, moved };
    });

  /** The undo of a join: the caught row back as it was, with its sightings, the typed one too. */
  const unjoin = (joined: Joined): Promise<void> =>
    inTurn(async () => {
      const stamp = new Date().toISOString();
      const typed = { ...joined.typed, updatedAt: stamp };
      const caught = { ...joined.caught, updatedAt: stamp };
      await db.withTransactionAsync(async () => {
        for (const s of joined.moved) await move(s, typed.id, caught.id);
        await tables.spends.put(typed);
        await tables.spends.put(caught);
      });
      replaceSpend(typed);
      replaceSpend(caught);
    });

  /** No, they are two: the pair is remembered and never offered or merged again. */
  const notSame = (caughtId: string, typedId: string): Promise<void> =>
    inTurn(async () => {
      const [caught, typed] = [await current(caughtId), await current(typedId)];
      if (!caught || !typed) return;
      await rememberApart(db, await keysOf(caught), await keysOf(typed));
    });

  /** Every witness of a row, oldest first. */
  const witnesses = async (id: string): Promise<WitnessLine[]> => {
    const row = await current(id);
    if (!row) return [];
    const own = (s: StoredSighting) => s.capture_id === row.id;
    return (await sightingsOf(row)).map((s) => ({
      source: s.source,
      channel: s.channel,
      witness: s.witness_kind,
      name: s.witness_name,
      bank: s.bank,
      detail: s.detail,
      at: s.seen_at,
      own: own(s),
    }));
  };

  /** The row a sighting split away becomes: the one it was merged away from, else a new catch. */
  const rowFor = (s: StoredSighting, from: SpendRow, id: string): SpendRow => {
    const at = new Date(s.seen_at).toISOString();
    const stamp = new Date().toISOString();
    return {
      ...from,
      id,
      day: moneyDayOf(new Date(at)),
      at,
      amount: s.amount !== null && (s.currency ?? home()) === home() ? s.amount : 0,
      merchant: s.payee ?? '',
      note: null,
      source: s.source,
      status: 'caught',
      previousStatus: null,
      wallet: s.bank,
      forWork: false,
      detail: s.detail,
      foreignAmount: null,
      currencyGuessed: false,
      memo: s.memo,
      direction: s.direction === 'in' ? 'in' : null,
      moneyIn: null,
      givesBack: null,
      savedTo: null,
      fromPot: null,
      fromPotAmount: null,
      envelopes: null,
      paysBill: null,
      photo: null,
      importId: null,
      createdAt: stamp,
      updatedAt: stamp,
    };
  };

  /**
   * "These are two": the sighting that joined the row last goes back to a row of its own (the
   * one it was merged away from, else a new catch waiting for the close), the row takes again
   * what its other sightings say, and the pair is remembered so they never merge again.
   */
  const split = (id: string): Promise<Split | null> =>
    inTurn(async () => {
      const row = await current(id);
      if (!row) return null;
      await ensureOwn(db, row);
      const stored = await storedSightings(db, [row.id]);
      const leaving = [...stored].reverse().find((s) => s.capture_id !== row.id);
      if (!leaving || stored.length < 2) return null;
      const key = keyOfStored(leaving);
      const staying = stored.filter((s) => s !== leaving).map(keyOfStored);
      const before = seenOnRow(row, stored);
      const kept = splitProjected(row, before, key, home());
      const next: SpendRow = {
        ...row,
        amount: kept.amount,
        merchant: kept.merchant,
        ...placed(store, row, kept),
        updatedAt: new Date().toISOString(),
      };
      const was = leaving.capture_id ? await tables.spends.get(leaving.capture_id) : null;
      const otherId = was && was.id !== row.id ? was.id : (leaving.capture_id ?? randomUUID());
      const other: SpendRow =
        was && was.id !== row.id
          ? {
              ...was,
              status: was.previousStatus ?? 'caught',
              previousStatus: null,
              updatedAt: next.updatedAt,
            }
          : rowFor(leaving, row, otherId);
      const moved = { source: leaving.source, seenAt: leaving.seen_at };
      await db.withTransactionAsync(async () => {
        await tables.spends.put(other);
        await move(moved, row.id, other.id);
        await db.runAsync(
          `UPDATE spend_sightings SET capture_id = ?
            WHERE spend_id = ? AND source = ? AND seen_at = ? AND capture_id IS NULL`,
          [other.id, other.id, moved.source, moved.seenAt],
        );
        await tables.spends.put(next);
      });
      await rememberApart(db, [key], staying);
      replaceSpend(next);
      replaceSpend(other);
      return {
        row,
        other: was && was.id !== row.id ? was : null,
        made: other,
        moved,
        key,
        staying,
      };
    });

  /** The undo of "These are two": the sighting back on its row, the pair forgotten. */
  const unsplit = (done: Split): Promise<void> =>
    inTurn(async () => {
      const stamp = new Date().toISOString();
      const row = { ...done.row, updatedAt: stamp };
      const other = done.other ? { ...done.other, updatedAt: stamp } : null;
      await db.withTransactionAsync(async () => {
        await move(done.moved, done.made.id, row.id);
        await tables.spends.put(row);
        if (other) await tables.spends.put(other);
        else await tables.spends.remove(done.made.id);
      });
      await forgetApart(db, [done.key], done.staying);
      replaceSpend(row);
      replaceSpend(other ?? { ...done.made, status: 'deleted', updatedAt: stamp });
    });

  /** Everything 6pm kept about one row's capture, for "This is wrong". */
  const report = async (id: string) => {
    const row = await current(id);
    if (!row) return null;
    const stored = await storedSightings(db, [row.id]);
    return {
      row,
      sightings: stored,
      ids: [row.id, ...stored.flatMap((s) => (s.capture_id ? [s.capture_id] : []))],
    };
  };

  return { typedTwin, join, unjoin, notSame, witnesses, split, unsplit, report };
}

export type CaptureAnswers = ReturnType<typeof captureAnswers>;
