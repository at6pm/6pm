import {
  addDays,
  asItComesIncome,
  cashTakingsId,
  isTakings,
  merchantKeyOf,
  rememberedWorkRule,
  wageIncome,
  workIncomeOf,
  WORK_INCOME_ID,
  type BankWork,
  type Income,
  type LocalDate,
  type MerchantRuleRow,
  type SpendRow,
  type WorkMode,
  workMarkOf,
} from '@6pm/domain';

import type { MoneyActions } from './money-actions';
import { findSpend, type MoneySnapshot, type MoneyStore } from './money-store';
import { readPlan, writePlan } from './plan-settings';
import { workOf } from './work-money';

/** The shops and senders whose work mark was answered, by merchant key. */
export async function readWorkRules(
  store: Pick<MoneyStore, 'tables'>,
): Promise<ReadonlyMap<string, MerchantRuleRow>> {
  const rules = await store.tables.rules.select('WHERE work IS NOT NULL', []);
  return new Map(rules.map((rule) => [rule.merchantKey, rule]));
}

/**
 * Remembers a shop's or sender's stamp, inked or left blank, so it arrives inked next time or is
 * no longer offered. Nothing for a spend with no name to key it.
 */
export async function rememberWork(
  store: MoneyStore,
  spend: Pick<SpendRow, 'merchant' | 'categoryId'>,
  work: boolean,
): Promise<void> {
  await store.exclusive(async () => {
    const existing = await store.tables.rules.get(merchantKeyOf(spend.merchant));
    if (existing?.work === work) return;
    const rule = rememberedWorkRule(existing, spend.merchant, spend.categoryId, work);
    if (rule !== null) await store.tables.rules.put(rule);
  });
}

/**
 * Today's takings kept at the close: the caught transfers kept as takings, and the cash typed in
 * as one line for the day (replaced when typed again, gone when it is nothing).
 */
export async function keepTakings(
  store: MoneyStore,
  actions: MoneyActions,
  day: LocalDate,
  cash: number,
): Promise<void> {
  const snap = store.getSnapshot();
  for (const row of snap.cycleSpends) {
    if (row.day <= day && isTakings(row) && row.status === 'caught') {
      await actions.setStatus(row.id, 'kept');
    }
  }
  const id = cashTakingsId(day);
  const amount = Math.max(0, Math.round(cash));
  const existing = findSpend(store.getSnapshot(), id) ?? (await store.tables.spends.get(id));
  if (existing && existing.status !== 'deleted') {
    if (amount === 0) await actions.setStatus(id, 'deleted');
    else if (existing.amount !== amount) await actions.update(id, { amount });
    return;
  }
  if (amount === 0) return;
  const row = await actions.addSpend({
    id,
    amount,
    categoryId: snap.categories[0]?.id ?? '',
    merchant: '',
    source: 'cash',
    status: 'kept',
    direction: 'in',
    day,
  });
  await actions.markForWork(row.id, true);
}

/** The cash typed as takings for a day, if any was. */
export function cashTakingsOf(rows: readonly SpendRow[], day: LocalDate): number {
  const row = rows.find((s) => s.id === cashTakingsId(day) && s.status !== 'deleted');
  return row?.amount ?? 0;
}

/** One bank's answer to "Which of these is for work?", from Settings › Banks. */
export function setBankWork(store: MoneyStore, code: string, answer: BankWork): Promise<void> {
  return store.exclusive(async () => {
    const plan = await readPlan(store.db);
    if (plan?.work === undefined) return;
    await writePlan(store.db, {
      ...plan,
      work: { ...plan.work, banks: { ...plan.work.banks, [code]: answer } },
    });
    await store.loadInTurn(store.getSnapshot().today);
  });
}

/**
 * The day a switch to paying oneself takes effect: the next close, today's while today is still
 * open, else tomorrow's.
 */
export function nextCloseDay(snapshot: Pick<MoneySnapshot, 'today' | 'closedDays'>): LocalDate {
  const closed = snapshot.closedDays.some((d) => d.day === snapshot.today);
  return closed ? addDays(snapshot.today, 1) : snapshot.today;
}

/**
 * How work pays the person (the Work money sheet): what it keeps as it comes, or a wage every
 * week on a weekday. The income from work becomes the one that says so. A new wage takes effect at
 * the next close: closes before it landed as they came, and what closes keep from then on stays
 * with the shop, which pays the wage on its weekday (`wageLedger`).
 */
export function setWorkMode(
  store: MoneyStore,
  mode: WorkMode,
  wage: { readonly amount: number; readonly weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6 } | null,
): Promise<void> {
  return store.exclusive(async () => {
    const plan = await readPlan(store.db);
    if (plan?.work === undefined || plan.incomes === undefined) return;
    const existing = workIncomeOf(plan.incomes);
    const income: Income =
      mode === 'payMyself' && wage !== null
        ? wageIncome(existing, wage.amount, wage.weekday, nextCloseDay(store.getSnapshot()))
        : asItComesIncome(existing);
    const others = plan.incomes.filter((i) => i.id !== (existing?.id ?? WORK_INCOME_ID));
    await writePlan(store.db, {
      ...plan,
      incomes: [...others, income],
      work: {
        ...plan.work,
        mode: mode === 'payMyself' && wage !== null ? 'payMyself' : 'asItComes',
      },
    });
    await store.loadInTurn(store.getSnapshot().today);
  });
}

/**
 * A capture as it arrives, for someone with work on: inked at once when its bank is always work,
 * or its shop or sender was stamped before (`workMarkOf`), so it never counts in the meantime.
 */
export async function stampOnArrival(
  store: MoneyStore,
  actions: Pick<MoneyActions, 'markForWork'>,
  row: SpendRow,
): Promise<void> {
  const work = workOf(store.getSnapshot());
  if (work === null || row.forWork || row.status !== 'caught') return;
  const rule = await store.tables.rules.get(merchantKeyOf(row.merchant));
  if (workMarkOf({ work, wallet: row.wallet, rule }) === 'inked') {
    await actions.markForWork(row.id, true);
  }
}
