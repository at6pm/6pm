import { randomUUID } from 'expo-crypto';

import {
  isJoinedCycle,
  payCycleOn,
  spendRowSchema,
  type CategoryRow,
  type ImportApp,
  type ImportRecordRow,
  type ImportRow,
  type LocalDate,
  type SpendRow,
} from '@6pm/domain';

import type { Language } from '@6pm/i18n';

import { readFirstDay } from './diary-queries';
import type { MoneyStore } from './money-store';
import { seedStarterCategories } from './onboarding';
import { readPlan, writePlan, type PlanSettings } from './plan-settings';
import { nextSort, OTHER_NOT_DAILY_ID, untouchedShared } from './shared-categories';
import { columnOf, type SqlValue } from './table';

/**
 * Bringing another app's history in, and taking it out again. Every line is a kept spend (or money
 * in) with source `import`, dated before the day 6pm started: history only. It is never counted in
 * today's number, a close, a bill, a pot or money in; the only number it moves is the joined pay
 * cycle's "spent since payday", which its real lines replace (M2a). Lines already here (a file
 * brought in twice) are left as they are.
 */

/** Where one of their categories goes: a category the person has, or one the bring-in makes. */
export type LabelPick =
  | { readonly kind: 'category'; readonly id: string }
  | {
      readonly kind: 'new';
      /** The id to make it with; the screens choose one no category has. */
      readonly id: string;
      readonly name: string;
      readonly icon: string;
      readonly hue: number;
      readonly countsDaily: boolean;
    };

export interface BringInInput {
  readonly app: ImportApp;
  /** Lines to write, oldest first: dated before the start day and not here already. */
  readonly rows: readonly ImportRow[];
  /** Their category → where it goes; every spending label has one. */
  readonly picks: ReadonlyMap<string, LabelPick>;
  /** What money in is filed under (it is never spending, so the category is never shown). */
  readonly moneyInCategory: string;
  /** Names the starter categories when there are none yet (bringing history in during onboarding). */
  readonly language: Language;
  /** Written so far, with the newest day written, as each batch commits. */
  readonly onProgress?: (written: number, day: LocalDate) => void;
}

/** Lines per statement and per transaction: small enough to report progress, few enough to be quick. */
const BATCH = 120;

const SPEND_FIELDS = Object.keys(spendRowSchema.shape);
const SPEND_COLUMNS = SPEND_FIELDS.map(columnOf);

function encode(row: SpendRow): SqlValue[] {
  const record = row as unknown as Record<string, unknown>;
  return SPEND_FIELDS.map((field) => {
    const value = record[field];
    if (typeof value === 'boolean') return value ? 1 : 0;
    // A flag a restored older row lacks is stored as no.
    if (value === undefined && (field === 'forWork' || field === 'currencyGuessed')) return 0;
    if (value === undefined || value === null) return null;
    if (typeof value === 'object') return JSON.stringify(value);
    return value as SqlValue;
  });
}

/** The day 6pm started for this person: the plan's, else the first day it has, else today. */
export async function startDayOf(store: MoneyStore): Promise<LocalDate> {
  const { plan, today } = store.getSnapshot();
  if (plan?.startedOn) return plan.startedOn;
  return (await readFirstDay(store)) ?? today;
}

/** Ids of every line brought in before: a second bring-in of the same file skips them. */
export async function importedIds(store: MoneyStore): Promise<ReadonlySet<string>> {
  const rows = await store.db.getAllAsync<{ id: string }>(
    "SELECT id FROM spends WHERE source = 'import'",
    [],
  );
  return new Set(rows.map((r) => r.id));
}

/** Every bring-in still here, newest first. */
export function readImports(store: MoneyStore): Promise<ImportRecordRow[]> {
  return store.tables.imports.select('ORDER BY at DESC', []);
}

/** The local instant of a line: its time, or noon when the file gave none. */
function instantOf(row: ImportRow): string {
  const [y = 1970, m = 1, d = 1] = row.day.split('-').map(Number);
  const [h = 12, min = 0, s = 0] = (row.time ?? '12:00:00').split(':').map(Number);
  return new Date(y, m - 1, d, h, min, s).toISOString();
}

/**
 * What brought-in lines spent between two days (from inclusive, to exclusive), in categories that
 * count daily: onboarding's "spent since payday", from the person's own history.
 */
export async function importedSpentBetween(
  store: MoneyStore,
  from: LocalDate,
  to: LocalDate,
): Promise<number> {
  const rows = await store.db.getAllAsync<{ total: number | null }>(
    `SELECT SUM(s.amount) AS total FROM spends s JOIN categories c ON c.id = s.category_id
     WHERE s.source = 'import' AND s.status = 'kept' AND (s.direction IS NULL OR s.direction = 'out')
       AND c.counts_daily = 1 AND s.day >= ? AND s.day < ?`,
    [from, to],
  );
  return rows[0]?.total ?? 0;
}

/**
 * The joined pay cycle and the day 6pm started, while that cycle lasts: the only time brought-in
 * lines change a number (its "spent since payday"). Null with no plan or once the cycle is over.
 */
function joinedAnswerFrom(
  plan: PlanSettings | null,
  today: LocalDate,
): { readonly cycleStart: LocalDate; readonly startedOn: LocalDate } | null {
  if (plan === null || !plan.startedOn) return null;
  const cycle = payCycleOn(today, plan.payday);
  if (!isJoinedCycle(cycle, plan.startedOn)) return null;
  return { cycleStart: cycle.start, startedOn: plan.startedOn };
}

function withAnswer(plan: PlanSettings, answer: number | null): PlanSettings {
  const { spentSincePayday: _old, ...rest } = plan;
  return answer === null ? rest : { ...rest, spentSincePayday: Math.max(0, Math.round(answer)) };
}

/** Writes the lines in batches, makes the categories they need, and records the bring-in. */
export function bringIn(store: MoneyStore, input: BringInInput): Promise<ImportRecordRow> {
  return store.exclusive(async () => {
    const { db, tables } = store;
    const now = new Date().toISOString();
    const id = randomUUID();
    await seedStarterCategories(store, input.language);
    const existing = await tables.categories.all();
    const byId = new Map(existing.map((c) => [c.id, c]));
    const have = new Set(existing.filter((c) => c.archivedAt === null).map((c) => c.id));
    let sort = nextSort(existing);
    const made: CategoryRow[] = [];
    for (const pick of input.picks.values()) {
      if (pick.kind !== 'new' || have.has(pick.id)) continue;
      have.add(pick.id);
      // One put away before (an undone bring-in's "Other · not daily") comes back as it was.
      const before = byId.get(pick.id);
      made.push(
        before
          ? { ...before, sort: sort++, archivedAt: null }
          : {
              id: pick.id,
              name: pick.name,
              icon: pick.icon,
              hue: pick.hue,
              countsDaily: pick.countsDaily,
              sort: sort++,
              archivedAt: null,
            },
      );
    }
    const record: ImportRecordRow = {
      id,
      app: input.app,
      at: now,
      lines: input.rows.length,
      firstDay: input.rows[0]?.day ?? null,
      lastDay: input.rows[input.rows.length - 1]?.day ?? null,
      answered: false,
      answerBefore: null,
    };
    await db.withTransactionAsync(async () => {
      for (const category of made) await tables.categories.put(category);
      await tables.imports.put(record);
    });

    // Newest first, so the months shelve back from this one as they are written.
    const ordered = [...input.rows].reverse();
    let written = 0;
    for (let at = 0; at < ordered.length; at += BATCH) {
      const batch = ordered.slice(at, at + BATCH).map((row): SpendRow => {
        const pick = input.picks.get(row.label);
        const instant = instantOf(row);
        return spendRowSchema.parse({
          id: row.id,
          day: row.day,
          at: instant,
          amount: row.amount,
          categoryId:
            row.direction === 'in' ? input.moneyInCategory : (pick?.id ?? input.moneyInCategory),
          merchant: row.merchant,
          note: row.note,
          source: 'import',
          status: 'kept',
          previousStatus: null,
          wallet: input.app === 'momo' ? 'MOMO' : null,
          forWork: false,
          currencyGuessed: false,
          detail: null,
          foreignAmount: null,
          direction: row.direction === 'in' ? 'in' : null,
          moneyIn: null,
          importId: id,
          // Made when it happened: nothing brought in reads as caught today.
          createdAt: instant,
          updatedAt: now,
        });
      });
      const marks = `(${SPEND_COLUMNS.map(() => '?').join(', ')})`;
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `INSERT INTO spends (${SPEND_COLUMNS.join(', ')}) VALUES ${batch.map(() => marks).join(', ')}
           ON CONFLICT (id) DO NOTHING`,
          batch.flatMap(encode),
        );
      });
      written += batch.length;
      input.onProgress?.(written, batch[batch.length - 1]?.day ?? ordered[0]?.day ?? '');
    }

    // The joined cycle's lines stand in for the since-payday answer, while that cycle lasts.
    const plan = await readPlan(db);
    const today = store.getSnapshot().today;
    const joined = joinedAnswerFrom(plan, today);
    if (plan && joined) {
      const spent = await importedSpentBetween(store, joined.cycleStart, joined.startedOn);
      if (spent > 0) {
        const answered: ImportRecordRow = {
          ...record,
          answered: true,
          answerBefore: plan.spentSincePayday ?? null,
        };
        await db.withTransactionAsync(async () => {
          await writePlan(db, withAnswer(plan, spent));
          await tables.imports.put(answered);
        });
        await store.loadInTurn(today);
        return answered;
      }
    }
    await store.loadInTurn(today);
    return record;
  });
}

/** What undoing a bring-in took away, kept by the screen so a tap can bring it back. */
export interface RemovedImport {
  readonly record: ImportRecordRow;
  readonly spends: readonly SpendRow[];
  /** "Other · not daily", put away when nothing was left in it. */
  readonly archived?: readonly CategoryRow[];
}

/**
 * "Other · not daily" as 6pm made it, when nothing at all is filed in it any more (and no rule
 * points at it): undoing the bring-in that filled it puts it away with its lines.
 */
async function emptySharedNotDaily(store: MoneyStore): Promise<CategoryRow | null> {
  const row = await store.tables.categories.get(OTHER_NOT_DAILY_ID);
  if (row === null || row.archivedAt !== null || !untouchedShared(row)) return null;
  const used = await store.db.getAllAsync<{ n: number }>(
    `SELECT (SELECT COUNT(*) FROM spends WHERE category_id = ?)
       + (SELECT COUNT(*) FROM merchant_rules WHERE category_id = ?) AS n`,
    [row.id, row.id],
  );
  return (used[0]?.n ?? 0) === 0 ? row : null;
}

/**
 * Removes one bring-in's lines and nothing else: closed days, every other spend and the categories
 * stay, but for "Other · not daily" when the bring-in made it and nothing else is in it. When its lines set "spent since payday", the answer goes back to what the other bring-ins
 * still say, or to what it was before.
 */
export function undoImport(store: MoneyStore, importId: string): Promise<RemovedImport | null> {
  return store.exclusive(async () => {
    const { db, tables } = store;
    const record = await tables.imports.get(importId);
    if (record === null) return null;
    const spends = await tables.spends.select("WHERE import_id = ? AND source = 'import'", [
      importId,
    ]);
    let archived: CategoryRow[] = [];
    await db.withTransactionAsync(async () => {
      await db.runAsync("DELETE FROM spends WHERE import_id = ? AND source = 'import'", [importId]);
      await tables.imports.remove(importId);
      const empty = await emptySharedNotDaily(store);
      if (empty) {
        await tables.categories.put({ ...empty, archivedAt: new Date().toISOString() });
        archived = [empty];
      }
    });
    const plan = await readPlan(db);
    const today = store.getSnapshot().today;
    const joined = joinedAnswerFrom(plan, today);
    if (plan && joined && record.answered) {
      const left = await importedSpentBetween(store, joined.cycleStart, joined.startedOn);
      await writePlan(db, withAnswer(plan, left > 0 ? left : record.answerBefore));
    }
    await store.loadInTurn(today);
    return { record, spends, archived };
  });
}

/** Puts an undone bring-in back exactly as it was. */
export function restoreImport(store: MoneyStore, removed: RemovedImport): Promise<void> {
  return store.exclusive(async () => {
    const { db, tables } = store;
    const marks = `(${SPEND_COLUMNS.map(() => '?').join(', ')})`;
    await db.withTransactionAsync(async () => {
      for (const category of removed.archived ?? []) await tables.categories.put(category);
      await tables.imports.put(removed.record);
      for (let at = 0; at < removed.spends.length; at += BATCH) {
        const batch = removed.spends.slice(at, at + BATCH);
        await db.runAsync(
          `INSERT INTO spends (${SPEND_COLUMNS.join(', ')}) VALUES ${batch.map(() => marks).join(', ')}
           ON CONFLICT (id) DO NOTHING`,
          batch.flatMap(encode),
        );
      }
    });
    const plan = await readPlan(db);
    const today = store.getSnapshot().today;
    const joined = joinedAnswerFrom(plan, today);
    if (plan && joined && removed.record.answered) {
      const spent = await importedSpentBetween(store, joined.cycleStart, joined.startedOn);
      if (spent > 0) await writePlan(db, withAnswer(plan, spent));
    }
    await store.loadInTurn(today);
  });
}
