import {
  BUFFER_POT_ID,
  bufferPotRow,
  carriesOver,
  cycleCarry,
  payCycleOn,
  type LocalDate,
  type PayCycle,
  type PotMove,
  type PotRow,
} from '@6pm/domain';

import type { MoneyTables } from './money-tables';
import type { PlanSettings } from './plan-settings';
import type { SqlDatabase } from './table';

const CARRY = 'carry:';

/** One carry per month: the id makes a second write of the same month a no-op. */
export function carryId(cycleStart: LocalDate): string {
  return `${CARRY}${cycleStart}`;
}

/** The most months one catch-up closes: a damaged clock must not walk back for ever. */
const MAX_MONTHS = 24;

/** How a month ended, as the money store works it out from that month's own rows. */
export interface MonthEnding {
  /** Free money at the end of its last day. */
  readonly free: number;
  /** What its pays beyond the usual count kept aside. */
  readonly kept: number;
  /** What the buffer jar held through it. */
  readonly held: number;
}

/**
 * Writes what each month that has ended left over into the buffer jar ("In hand"), once a month,
 * for a plan whose months carry over (`carriesOver`), and returns the moves written and the buffer
 * when it was made. A month is closed from its own spends (`endingOf` reads them: the store holds
 * only the month it is in), in order, so each carry knows the one before. The move is an opening
 * of the jar, filed in the month it carries into, that brings what the jar holds to the carry
 * (`cycleCarry`): the month spent what the jar held with the rest, so it is not added twice.
 *
 * Months that ended before the incomes were set (`incomesFrom`) were monthly ones and carry
 * nothing. The jar is made the first time a carry puts something in it; a month that carries
 * nothing into a jar that is not there writes nothing.
 */
export async function recordDueCarries(
  db: SqlDatabase,
  tables: Pick<MoneyTables, 'pots'>,
  input: {
    readonly plan: PlanSettings;
    readonly cycle: PayCycle;
    readonly pots: readonly PotRow[];
    readonly moves: readonly PotMove[];
    readonly endingOf: (
      month: PayCycle,
      moves: readonly PotMove[],
      pots: readonly PotRow[],
    ) => Promise<MonthEnding | null>;
  },
): Promise<{ readonly moves: PotMove[]; readonly buffer: PotRow | null }> {
  const { plan, cycle } = input;
  const none = { moves: [], buffer: null };
  if (!carriesOver(plan) || plan.incomesFrom === undefined) return none;
  const due: PayCycle[] = [];
  for (
    let month = payCycleOn(plan.incomesFrom, plan.payday);
    month.start < cycle.start;
    month = payCycleOn(month.payday, plan.payday)
  ) {
    // The month the incomes were set in counts from that day; it carries like the rest.
    due.push(month);
    if (payCycleOn(month.payday, plan.payday).start <= month.start) break;
  }
  if (due.length === 0) return none;
  const rows = await db.getAllAsync<{ id: string }>(
    "SELECT id FROM pot_moves WHERE id LIKE 'carry:%'",
    [],
  );
  const written = new Set(rows.map((row) => row.id));
  const open = due.filter((month) => !written.has(carryId(month.start))).slice(-MAX_MONTHS);
  let pots = [...input.pots];
  let buffer = pots.find((pot) => pot.id === BUFFER_POT_ID) ?? null;
  let made: PotRow | null = null;
  const moves = [...input.moves];
  const out: PotMove[] = [];
  for (const month of open) {
    const ending = await input.endingOf(month, moves, pots);
    if (ending === null) continue;
    const amount = cycleCarry(ending) - ending.held;
    if (amount === 0 && buffer === null) continue;
    const at = new Date().toISOString();
    if (buffer === null) {
      buffer = bufferPotRow(at);
      await tables.pots.insertMissing(buffer);
      pots = [...pots, buffer];
      made = buffer;
    }
    await db.runAsync(
      `INSERT OR IGNORE INTO pot_moves (id, pot_id, amount, kind, cycle, at)
       VALUES (?, ?, ?, 'opening', ?, ?)`,
      [carryId(month.start), BUFFER_POT_ID, amount, month.payday, at],
    );
    const move: PotMove = { potId: BUFFER_POT_ID, kind: 'opening', cycle: month.payday, amount };
    moves.push(move);
    out.push(move);
  }
  return { moves: out, buffer: made };
}
