import { merchantKeyOf } from '../capture/merchant-rule';
import type { MerchantRuleRow } from '../contracts/local-rows';
import type { Vnd } from '../money/format';
import { payEvents, SALARY_INCOME_ID, type Income } from '../plan/incomes';
import type { PlacedPay } from '../plan/income-period';
import type { Payday } from '../plan/pay-cycle';
import { addDays, type LocalDate } from '../time/local-date';
import { findBank } from '../vietqr/bank-catalogue';
import type { SpendDirection, SpendSource, SpendStatus } from './spend';

/**
 * Work of one's own: one mark, "work", on money in and on spends, for someone who sells or runs
 * something and turned work on (`plan.work`).
 *
 * - A work spend is a cost of the work, never the person's spending: it never touches the number.
 * - Work money in is takings, never spread or saved by itself.
 * - What the work kept on a closed day is its takings less its costs. Taking pay as it comes, the
 *   month's kept money lands in the plan as a landing does; paying themselves, the wage is a
 *   counted income from work and what is kept above it waits with the work.
 *
 * Someone who never turned work on keeps today's meaning of the mark: a spend marked for work is a
 * claim to be paid back by an employer (Claim back), out of the number, and nothing here applies.
 */

/** Whether money through a bank or wallet is work: always, sometimes (offered), never. */
export type BankWork = 'always' | 'sometimes' | 'never';

/** How work pays the person: what it keeps as it comes, or a wage they pay themselves. */
export type WorkMode = 'asItComes' | 'payMyself';

/** The plan's work setting, as it is stored. */
export interface WorkSetting {
  readonly mode: WorkMode;
  /** Each bank or wallet's answer, by its saved code ("MB", "CASH", "name:Chase"). */
  readonly banks?: Readonly<Record<string, BankWork>> | undefined;
}

/**
 * Money that comes when it comes, apart from a salary whose day varies: what a freelancer, a
 * shift worker or someone on commission answered in onboarding. Such money is often a client's.
 */
export function isFreelanceIncome(income: Income): boolean {
  return (
    income.rhythm.kind === 'none' &&
    income.amount <= 0 &&
    income.fromWork !== true &&
    income.id !== SALARY_INCOME_ID
  );
}

/**
 * Whether the person has work money: requests to clients with a code, tax a client held back, the
 * work year and the work stamp on money in. Someone who sells has it (`work` is set), and so does
 * someone whose money comes when it comes, from that answer alone, so nothing more is asked. A plan
 * never asked about its incomes (a monthly salary) has none of it.
 *
 * This is not the shop's bookkeeping: work costs that never touch the number, Today's takings and
 * kept money landing at the close belong to someone who sells (`work`) only.
 */
export function workMoneyOn(plan: {
  readonly incomes?: readonly Income[] | undefined;
  readonly work?: unknown;
}): boolean {
  if (plan.incomes === undefined) return false;
  return plan.work !== undefined || plan.incomes.some(isFreelanceIncome);
}

/** The saved code for cash among the chosen banks and wallets. */
export const CASH_CODE = 'CASH';
/** What a spend paid in cash keeps as its wallet. */
export const CASH_WALLET = 'Cash';
/** A bank typed by its name is saved with this before the name. */
const NAMED_PREFIX = 'name:';

/** What a bank or wallet's saved code is stored as on a spend's `wallet`. */
export function walletOfCode(code: string): string {
  if (code.toUpperCase() === CASH_CODE) return CASH_WALLET;
  if (code.startsWith(NAMED_PREFIX)) return code.slice(NAMED_PREFIX.length);
  return findBank(code)?.shortName ?? code;
}

/** A wallet as compared: lower case, without spaces ("MB Bank" is "MBBank"). */
const walletKey = (wallet: string) => wallet.replace(/\s+/g, '').toLowerCase();

/** A bank's answer for a spend's wallet; null when the wallet is none of the answered banks. */
export function bankWorkOf(
  wallet: string | null | undefined,
  banks: Readonly<Record<string, BankWork>> | undefined,
): BankWork | null {
  if (wallet == null || banks === undefined) return null;
  const want = walletKey(wallet);
  if (want === '') return null;
  for (const [code, answer] of Object.entries(banks)) {
    if (walletKey(walletOfCode(code)) === want || walletKey(code) === want) return answer;
  }
  return null;
}

/** The next answer a tap on a bank's line gives: blank, then dashed, then solid, then blank. */
export function nextBankWork(answer: BankWork): BankWork {
  return answer === 'never' ? 'sometimes' : answer === 'sometimes' ? 'always' : 'never';
}

/** Every chosen bank and cash, each asked once: what onboarding's slip starts from. */
export function startingBankWork(
  chosen: readonly string[],
  answered: Readonly<Record<string, BankWork>> = {},
): Record<string, BankWork> {
  const codes = [...chosen.filter((c) => c.toUpperCase() !== CASH_CODE), CASH_CODE];
  const banks: Record<string, BankWork> = {};
  for (const code of codes) banks[code] = answered[code] ?? 'sometimes';
  return banks;
}

/**
 * The work mark a spend or money in arrives with:
 * - `inked`: it is work (an "always" bank, or a shop or sender remembered as work),
 * - `offered`: a dashed stamp is offered once (a "sometimes" bank, a bank never answered, a shop
 *   or sender not yet remembered),
 * - `none`: nothing is offered ("never", a shop or sender remembered as not work, or work not on).
 */
export type WorkMark = 'inked' | 'offered' | 'none';

export function workMarkOf(input: {
  readonly work: WorkSetting | null | undefined;
  readonly wallet: string | null | undefined;
  /** The rule of the shop or sender, if any. */
  readonly rule?: Pick<MerchantRuleRow, 'work'> | null | undefined;
}): WorkMark {
  if (input.work == null) return 'none';
  const answer = bankWorkOf(input.wallet, input.work.banks);
  if (answer === 'always') return 'inked';
  if (answer === 'never') return 'none';
  const remembered = input.rule?.work;
  if (remembered === true) return 'inked';
  if (remembered === false) return 'none';
  return 'offered';
}

/**
 * A shop or sender's rule once its stamp was answered: inked or left blank, it is remembered
 * either way, so the stamp arrives inked or is no longer offered. Null with no name to key it.
 */
export function rememberedWorkRule(
  existing: MerchantRuleRow | null,
  merchant: string,
  categoryId: string,
  work: boolean,
): MerchantRuleRow | null {
  const key = merchantKeyOf(merchant);
  if (key === '') return null;
  const base: MerchantRuleRow = existing ?? {
    merchantKey: key,
    merchant: merchant.trim(),
    categoryId,
    learnedTimes: 0,
    setByUser: false,
  };
  return { ...base, work };
}

/** The fields work reads from a spend or money in. */
export interface WorkRow {
  readonly day: LocalDate;
  readonly amount: Vnd;
  readonly status: SpendStatus;
  readonly direction?: SpendDirection | null | undefined;
  readonly forWork?: boolean | undefined;
  readonly source?: SpendSource | undefined;
}

const gone = (row: WorkRow) => row.status === 'skipped' || row.status === 'deleted';

/** Work money in that is takings: stamped, not set aside as not mine or deleted. */
export function isTakings(row: WorkRow): boolean {
  return row.direction === 'in' && row.forWork === true && !gone(row);
}

/** A work cost: a stamped spend, not set aside as not mine or deleted. */
export function isWorkCost(row: WorkRow): boolean {
  return row.direction !== 'in' && row.forWork === true && !gone(row);
}

/**
 * Work money in that counts: kept. One rule for Plan's Work card, the Diary's week and the year:
 * what is kept counts, and what still waits (a seller's takings caught before the close, a payment
 * not yet placed) does not.
 */
export function isKeptWorkIn(row: WorkRow): boolean {
  return isTakings(row) && row.status === 'kept';
}

/** A work cost that counts, by the same rule: kept, not still waiting for the close. */
export function isKeptWorkCost(row: WorkRow): boolean {
  return isWorkCost(row) && row.status === 'kept';
}

/** Takings typed as cash at the close: one line a day, kept under the day's own id. */
export function cashTakingsId(day: LocalDate): string {
  return `takings-cash-${day}`;
}

/** A day's work: what came in (caught transfers and cash), what went out, and what was kept. */
export interface WorkDay {
  readonly day: LocalDate;
  /** Caught takings that are not cash: how many, and how much. */
  readonly transfers: number;
  readonly caught: Vnd;
  readonly cash: Vnd;
  /** `caught` and `cash`. */
  readonly takings: Vnd;
  readonly costCount: number;
  readonly costs: Vnd;
  /** Takings less costs; below nothing when costs were more. */
  readonly kept: Vnd;
}

const isCash = (row: WorkRow) => row.source === 'cash';

/** One day's work from its rows. */
export function workDayOf(rows: readonly WorkRow[], day: LocalDate): WorkDay {
  let transfers = 0;
  let caught = 0;
  let cash = 0;
  let costCount = 0;
  let costs = 0;
  for (const row of rows) {
    if (row.day !== day) continue;
    if (isTakings(row)) {
      if (isCash(row)) cash += row.amount;
      else {
        transfers += 1;
        caught += row.amount;
      }
    } else if (isWorkCost(row)) {
      costCount += 1;
      costs += row.amount;
    }
  }
  const takings = caught + cash;
  return { day, transfers, caught, cash, takings, costCount, costs, kept: takings - costs };
}

/** Every day from `from` through `to` with any work on it, oldest first. */
export function workDaysOf(rows: readonly WorkRow[], from: LocalDate, to: LocalDate): WorkDay[] {
  const days = [
    ...new Set(
      rows
        .filter((r) => r.day >= from && r.day <= to && (isTakings(r) || isWorkCost(r)))
        .map((r) => r.day),
    ),
  ].sort();
  return days.map((day) => workDayOf(rows, day));
}

/**
 * In, out and kept over some days: Plan's Work card, the Diary's week line. Money in and costs
 * count once they are kept (`isKeptWorkIn`, `isKeptWorkCost`), as the year counts them.
 */
export interface WorkTotals {
  readonly in: Vnd;
  readonly out: Vnd;
  readonly kept: Vnd;
}

export function workTotals(rows: readonly WorkRow[], from: LocalDate, to: LocalDate): WorkTotals {
  let takings = 0;
  let costs = 0;
  for (const row of rows) {
    if (row.day < from || row.day > to) continue;
    if (isKeptWorkIn(row)) takings += row.amount;
    else if (isKeptWorkCost(row)) costs += row.amount;
  }
  return { in: takings, out: costs, kept: takings - costs };
}

/**
 * What the work has kept for the person this month: over the closed days from `from` through
 * `to`, takings kept less every work cost that stands, never below nothing. Takings still waiting
 * for a close do not count yet; a cost counts from the day it was caught, as spending does. A day
 * whose costs were more than its takings is taken from the days that kept money, as the month's
 * work goes; a month that kept less than nothing leaves the person's number as it was.
 */
export function workLanded(
  rows: readonly WorkRow[],
  closed: ReadonlySet<LocalDate>,
  from: LocalDate,
  to: LocalDate,
): Vnd {
  let kept = 0;
  for (const row of rows) {
    if (row.day < from || row.day > to || !closed.has(row.day)) continue;
    if (isTakings(row) && row.status === 'kept') kept += row.amount;
    else if (isWorkCost(row)) kept -= row.amount;
  }
  return Math.max(0, kept);
}

/**
 * What a day's work kept: takings kept less every work cost that stands, below nothing when the
 * costs were more. Takings still waiting for a close do not count.
 */
function keptOn(rows: readonly WorkRow[], day: LocalDate): Vnd {
  let kept = 0;
  for (const row of rows) {
    if (row.day !== day) continue;
    if (isTakings(row) && row.status === 'kept') kept += row.amount;
    else if (isWorkCost(row)) kept -= row.amount;
  }
  return kept;
}

/** The wages someone paying themselves has been paid, and what the shop holds and owes them. */
export interface WageLedger {
  /** Each wage on its day, at what the shop could pay of it. */
  readonly paid: readonly PlacedPay[];
  /** Wages due and not paid in full: the shop owes the person this, first out of what it keeps. */
  readonly owed: Vnd;
  /** What the shop kept since the wage began and has not paid out: "Not paid to you yet". */
  readonly held: Vnd;
  /** The day the wage began (the income's `from`, or `from` given here): closes before it landed. */
  readonly since: LocalDate;
}

/**
 * The wage someone pays themselves from their work, counted as the shop can pay it. Each wage falls
 * on its weekday, the first on or after the day it began (`Income.from`, the close after the switch),
 * and is paid that morning from what the shop holds: what it kept on the days closed since the wage
 * began, before the wage's day, less the wages paid before. A wage the shop cannot pay in full is
 * paid as far as it can, never leaving the shop below nothing; the rest is owed and is paid first,
 * with the next wage, once the shop keeps enough. What the shop keeps above the wages waits with it.
 * Counted within the budget month (`from` through `to`), as the rows are.
 */
export function wageLedger(input: {
  readonly incomes: readonly Income[];
  readonly rows: readonly WorkRow[];
  readonly closed: ReadonlySet<LocalDate>;
  readonly from: LocalDate;
  readonly to: LocalDate;
  readonly anchor: Payday;
}): WageLedger {
  const wage = input.incomes.find((income) => income.fromWork === true && income.amount > 0);
  const since = wage?.from !== undefined && wage.from > input.from ? wage.from : input.from;
  if (wage === undefined) return { paid: [], owed: 0, held: 0, since };
  const keptDays = [...input.closed]
    .filter((day) => day >= since && day <= input.to)
    .sort()
    .map((day) => ({ day, kept: keptOn(input.rows, day) }));
  const keptBefore = (day: LocalDate) =>
    keptDays.filter((d) => d.day < day).reduce((sum, d) => sum + d.kept, 0);
  const paid: PlacedPay[] = [];
  let paidOut = 0;
  let owed = 0;
  for (const event of payEvents([wage], since, input.to, input.anchor)) {
    const due = event.amount + owed;
    const pay = Math.max(0, Math.min(due, keptBefore(event.day) - paidOut));
    paid.push({ incomeId: event.incomeId, day: event.day, amount: pay });
    paidOut += pay;
    owed = due - pay;
  }
  const kept = keptDays.reduce((sum, d) => sum + d.kept, 0);
  return { paid, owed, held: Math.max(0, kept - paidOut), since };
}

/** The work's month, as Plan's Work card says it. */
export interface WorkMonth extends WorkTotals {
  /** What reached the person's days: the kept money that landed, or the wages paid. */
  readonly landed: Vnd;
  /** Paying themselves: what the work kept above the wages so far, waiting with the work. */
  readonly waiting: Vnd;
}

/**
 * The work's month to `to`: in, out and kept, what of it reached the person's days, and, for
 * someone who pays themselves, what is kept above the wages and waits. Closes before the wage
 * began landed as they came.
 */
export function workMonth(input: {
  readonly rows: readonly WorkRow[];
  readonly closed: ReadonlySet<LocalDate>;
  readonly from: LocalDate;
  readonly to: LocalDate;
  readonly work: WorkSetting;
  readonly incomes: readonly Income[];
  readonly anchor: Payday;
}): WorkMonth {
  const totals = workTotals(input.rows, input.from, input.to);
  if (input.work.mode === 'asItComes') {
    return {
      ...totals,
      landed: workLanded(input.rows, input.closed, input.from, input.to),
      waiting: 0,
    };
  }
  const ledger = wageLedger(input);
  const wages = ledger.paid.reduce((sum, pay) => sum + pay.amount, 0);
  const before = workLanded(input.rows, input.closed, input.from, addDays(ledger.since, -1));
  return { ...totals, landed: before + wages, waiting: ledger.held };
}

/**
 * The wage as a weekly income from work: what "Pay myself" saves. A wage that is new starts on
 * `from` (the day of the next close); changing an existing wage keeps the day it began.
 */
export function wageIncome(
  existing: Income | null,
  amount: Vnd,
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  from?: LocalDate,
): Income {
  const began = existing !== null && existing.amount > 0 ? existing.from : from;
  return {
    id: existing?.id ?? WORK_INCOME_ID,
    name: existing?.name ?? null,
    rhythm: { kind: 'weekly', weekday },
    amount: Math.max(0, Math.round(amount)),
    fromWork: true,
    ...(began !== undefined ? { from: began } : {}),
  };
}

/** Work kept as it comes: an income from work with nothing counted on. */
export function asItComesIncome(existing: Income | null): Income {
  return {
    id: existing?.id ?? WORK_INCOME_ID,
    name: existing?.name ?? null,
    rhythm: { kind: 'none' },
    amount: 0,
    fromWork: true,
  };
}

/** The id of the income from work that onboarding's "I sell or run something" makes. */
export const WORK_INCOME_ID = 'work';

/** The plan's income from work, if it has one. */
export function workIncomeOf(incomes: readonly Income[] | undefined): Income | null {
  return incomes?.find((income) => income.fromWork === true) ?? null;
}

/**
 * Whether a spend marked for work is a claim an employer pays back (Claim back): only for someone
 * who never turned work on. With work on it is a cost of their own work, and money in is never
 * matched to it as a claim repaid (`paybackFor` with `claims: false`).
 */
export function isClaimBack(
  spend: { readonly forWork?: boolean | undefined },
  workOn: boolean,
): boolean {
  return spend.forWork === true && !workOn;
}

/** Owed lines whose spend is work: who has not paid the work, oldest first. */
export function workOwed<T extends { readonly spendId: string; readonly day: LocalDate }>(
  lines: readonly T[],
  spends: ReadonlyMap<string, { readonly forWork?: boolean | undefined }>,
): T[] {
  return lines
    .filter((line) => spends.get(line.spendId)?.forWork === true)
    .sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
}
