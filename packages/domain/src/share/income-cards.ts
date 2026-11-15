import { foldWords } from '../capture/fold-words';
import { merchantKeyOf } from '../capture/merchant-rule';
import type { Money } from '../money/currency';
import type { Vnd } from '../money/format';
import { leadPaysOf, type PeriodInput } from '../plan/income-period';
import { payCycleOn, type Payday } from '../plan/pay-cycle';
import { payStretch } from '../plan/pay-stretch';
import { isKeptWorkIn, workDayOf, workTotals, type WorkRow } from '../spend/work';
import { yearWork, type YearWorkRow } from '../spend/work-year';
import { addDays, diffDays, weekdayMondayFirst, type LocalDate } from '../time/local-date';

/**
 * The cards for money that is not one monthly salary: days covered by money that comes when it
 * comes, a pay beyond the usual count kept, a seller's month, a thank-you to one client and the
 * work year. Each card's facts are whole numbers and counts; no card names a sender, a client
 * other than the thank-you's own addressee, or a shop other than the person's own.
 */

/** Days covered past this, and Today's ruler offers its card (once). */
export const COVERED_CARD_DAYS = 30;

/** A landing of this month: the day it came, and whether it was stamped work. */
export interface CoveredLanding {
  readonly day: LocalDate;
  readonly work: boolean;
}

export interface CoveredCard {
  /** Landings this month, through today. */
  readonly landings: number;
  /** Every one of them was stamped work: "One job landed." */
  readonly jobs: boolean;
  readonly covered: number;
  /** Of the days covered: those to the end of the stretch, then those in hand after it. */
  readonly stretch: number;
  readonly inHandDays: number;
  /** Days since the latest landing. */
  readonly quietDays: number;
  /** What waits in hand beyond the stretch. */
  readonly inHand: Vnd;
}

/**
 * Days covered: Today's ruler drawn large, a tick a day covered, those through the day the money
 * lasts to and those in hand after it; the month's landings, the days since the latest, and what
 * is in hand. Null with no line to cover days at, or nothing landed this month.
 */
export function coveredCard(input: {
  readonly today: LocalDate;
  readonly landings: readonly CoveredLanding[];
  readonly covered: number | null;
  readonly stretchDays: number;
  readonly inHand: Vnd;
}): CoveredCard | null {
  const landed = input.landings.filter((l) => l.day <= input.today);
  const covered = input.covered ?? 0;
  if (covered <= 0 || landed.length === 0) return null;
  const latest = landed.reduce((a, l) => (l.day > a ? l.day : a), landed[0]?.day ?? input.today);
  const stretch = Math.min(covered, Math.max(0, input.stretchDays));
  return {
    landings: landed.length,
    jobs: landed.every((l) => l.work),
    covered,
    stretch,
    inHandDays: covered - stretch,
    quietDays: Math.max(0, diffDays(input.today, latest)),
    inHand: Math.max(0, input.inHand),
  };
}

/**
 * The moments Today's ruler offers Days covered: the evening a landing is placed (one a day), and
 * when days covered first passes `COVERED_CARD_DAYS`. Each is offered once; the caller keeps
 * which were.
 */
export function coveredMoments(input: {
  readonly today: LocalDate;
  readonly landings: readonly CoveredLanding[];
  readonly covered: number | null;
}): string[] {
  const moments: string[] = [];
  if (input.landings.some((l) => l.day === input.today)) moments.push(`covered:${input.today}`);
  if ((input.covered ?? 0) > COVERED_CARD_DAYS) moments.push(`covered:past${COVERED_CARD_DAYS}`);
  return moments;
}

export interface FifthPayCard {
  /** The day the pay counted. */
  readonly payOn: LocalDate;
  /** The lead income's pays in that pay's budget month, oldest first; `kept` beyond the usual count. */
  readonly pays: readonly { readonly day: LocalDate; readonly kept: boolean }[];
  /** Usual pays in a month: 4 for a weekly pay, 2 for the others. */
  readonly base: number;
  /** The pay's place in its month: 5 on a fifth Friday. */
  readonly ofMonth: number;
  /** What it keeps in hand. */
  readonly kept: Vnd;
  /** The days in hand that is at today's line. */
  readonly daysInHand: number;
  /** Every bill due in the pay's month had all it takes set aside. */
  readonly billsWhole: boolean;
  /** The pay's weekday, 0 = Monday, and whether the pay is weekly. */
  readonly weekday: number;
  readonly weekly: boolean;
}

/**
 * The fifth Friday: the pays of a month paid by the week or the fortnight, the usual ones as paper
 * and the one beyond the count kept in hand, with the days it adds at `line`. Null unless the pay
 * that opened the stretch on `input.day` is beyond the usual count.
 */
export function fifthPayCard(input: PeriodInput, line: Vnd): FifthPayCard | null {
  const stretch = payStretch(input);
  const lead = leadPaysOf(input);
  if (stretch === null || !stretch.extra || lead === null) return null;
  const month = payCycleOn(stretch.payOn, input.anchor);
  const end = addDays(month.payday, -1);
  const days = lead.days.filter((day) => day >= month.start && day <= end);
  return {
    payOn: stretch.payOn,
    pays: days.map((day, i) => ({ day, kept: i >= stretch.base })),
    base: stretch.base,
    ofMonth: stretch.ofMonth,
    kept: stretch.kept,
    daysInHand: line > 0 ? Math.floor(stretch.kept / line) : 0,
    // The month's own bills: one due after the month is the next month's to fill.
    billsWhole: stretch.bills.filter((bill) => bill.due <= end).every((bill) => bill.whole),
    weekday: weekdayMondayFirst(stretch.payOn),
    weekly: lead.lead.rhythm.kind === 'weekly',
  };
}

/** The moment Plan's In hand offers the fifth Friday: the day a pay beyond the count lands. */
export function fifthPayMoment(card: Pick<FifthPayCard, 'payOn'> | null, today: LocalDate) {
  return card !== null && card.payOn === today ? `fifth:${today}` : null;
}

/**
 * What a Diary note says when a day sold out, in the languages 6pm speaks: matched on the note's
 * plain words (no accents, any case), or as written where the script has no spaces.
 */
const SOLD_OUT_WORDS = [
  'sold out',
  'het hang',
  'het som',
  'ban het',
  'het veo',
  'habis',
  'ludes',
  'agotado',
  'epuise',
  'tout vendu',
  'ausverkauft',
] as const;
const SOLD_OUT_SCRIPT = ['售罄', '卖完', '賣完', '完売', '売り切れ', '품절', '완판', 'ขายหมด'];

/** Whether a day's note says it sold out. */
export function saysSoldOut(note: string | null | undefined): boolean {
  if (note == null || note.trim() === '') return false;
  const words = foldWords(note);
  return (
    SOLD_OUT_WORDS.some((w) => words.includes(` ${w} `)) ||
    SOLD_OUT_SCRIPT.some((w) => note.includes(w))
  );
}

/** A day of the shop's month: open with what it took, shut, or still ahead. */
export type ShopDay =
  | { readonly kind: 'open'; readonly takings: Vnd }
  | { readonly kind: 'shut' }
  | { readonly kind: 'ahead' };

/** Senders who paid this many times or more in the month are regulars. */
export const REGULAR_VISITS = 3;

export interface ShopMonthCard {
  readonly from: LocalDate;
  readonly to: LocalDate;
  /** One a day from `from` through `to`. */
  readonly days: readonly ShopDay[];
  /** Days with takings. */
  readonly open: number;
  /** Closed days whose Diary note says the shop sold out. */
  readonly soldOut: number;
  /** The day that took the most (the first of equals); null with none. */
  readonly best: LocalDate | null;
  /** Takings caught as transfers, and the senders seen `REGULAR_VISITS` times or more: counts. */
  readonly transfers: number;
  readonly regulars: number;
  /** What the work kept over the month, counted once kept. */
  readonly kept: Vnd;
  /** The weekday that took the most over the month, 0 = Monday; null with no takings. */
  readonly bestWeekday: number | null;
}

/** A work row with the sender as the bank printed it, never shown: only counted. */
export type ShopRow = WorkRow & { readonly merchant: string };

/**
 * My shop's month: a bar a day of takings (shut days and days ahead apart), the days open and
 * those a Diary note says sold out, the best day, the transfers caught, the regulars as a count,
 * and what the work kept.
 */
export function shopMonthCard(input: {
  readonly from: LocalDate;
  readonly to: LocalDate;
  readonly today: LocalDate;
  readonly rows: readonly ShopRow[];
  readonly notes: readonly { readonly day: LocalDate; readonly note: string | null }[];
}): ShopMonthCard {
  const { from, to, today, rows } = input;
  const inMonth = rows.filter((r) => r.day >= from && r.day <= to);
  const days: ShopDay[] = [];
  const byWeekday = Array.from({ length: 7 }, () => 0);
  let best: { day: LocalDate; takings: Vnd } | null = null;
  let transfers = 0;
  for (let day = from; day <= to; day = addDays(day, 1)) {
    const work = workDayOf(inMonth, day);
    transfers += work.transfers;
    if (work.takings > 0) {
      days.push({ kind: 'open', takings: work.takings });
      const w = weekdayMondayFirst(day);
      byWeekday[w] = (byWeekday[w] ?? 0) + work.takings;
      if (best === null || work.takings > best.takings) best = { day, takings: work.takings };
    } else days.push({ kind: day > today ? 'ahead' : 'shut' });
  }
  const senders = new Map<string, number>();
  for (const row of inMonth) {
    if (row.source === 'cash' || row.direction !== 'in' || row.forWork !== true) continue;
    if (row.status === 'skipped' || row.status === 'deleted') continue;
    const key = merchantKeyOf(row.merchant);
    if (key !== '') senders.set(key, (senders.get(key) ?? 0) + 1);
  }
  const most = Math.max(0, ...byWeekday);
  const found = best as { day: LocalDate } | null;
  return {
    from,
    to,
    days,
    open: days.filter((d) => d.kind === 'open').length,
    soldOut: input.notes.filter((n) => n.day >= from && n.day <= to && saysSoldOut(n.note)).length,
    best: found?.day ?? null,
    transfers,
    regulars: [...senders.values()].filter((n) => n >= REGULAR_VISITS).length,
    kept: workTotals(inMonth, from, to).kept,
    bestWeekday: most > 0 ? byWeekday.indexOf(most) : null,
  };
}

/**
 * The budget month Plan's Work card offers My shop's month for: the one whose last day is closed,
 * on that evening or the morning after. Null on any other day.
 */
export function shopMonthMoment(input: {
  readonly today: LocalDate;
  readonly anchor: Payday;
  readonly closed: ReadonlySet<LocalDate>;
}): { readonly from: LocalDate; readonly to: LocalDate } | null {
  for (const day of [input.today, addDays(input.today, -1)]) {
    const month = payCycleOn(day, input.anchor);
    const last = addDays(month.payday, -1);
    if (last === day && input.closed.has(day)) return { from: month.start, to: last };
  }
  return null;
}

export interface ThankYouCard {
  /** The client it thanks, as the request named them; null when it named nobody. */
  readonly name: string | null;
  readonly job: string | null;
  readonly code: string;
  /** What was asked. */
  readonly amount: Money;
  readonly askedOn: LocalDate;
  /** When the money that paid it landed. */
  readonly landedOn: LocalDate;
  readonly landedAt: string;
}

/**
 * Paid, thank you: a receipt for one client, never an invoice. What was asked and when, and when
 * the money that paid it landed. Null unless the request was paid by that money in.
 */
export function thankYouCard(input: {
  readonly line: {
    readonly name: string | null;
    readonly job?: string | null | undefined;
    readonly code?: string | null | undefined;
    readonly amount: Money;
    readonly settledBy: string | null;
    readonly settledSpendId: string | null;
  };
  readonly askedOn: LocalDate;
  readonly moneyIn: { readonly id: string; readonly day: LocalDate; readonly at: string } | null;
}): ThankYouCard | null {
  const { line, moneyIn } = input;
  if (line.code == null || moneyIn === null) return null;
  if (line.settledBy !== 'payback' || line.settledSpendId !== moneyIn.id) return null;
  return {
    name: line.name,
    job: line.job ?? null,
    code: line.code,
    amount: line.amount,
    askedOn: input.askedOn,
    landedOn: moneyIn.day,
    landedAt: moneyIn.at,
  };
}

/** The first day the work year offers its card: 1 December. */
export const WORK_YEAR_CARD_FROM = '12-01';

/** The moment the work year page offers its card: from 1 December, once a year. */
export function workYearMoment(today: LocalDate): string | null {
  return today.slice(5) >= WORK_YEAR_CARD_FROM ? `work-year:${today.slice(0, 4)}` : null;
}

export interface WorkYearCard {
  readonly year: number;
  /** Work money in as billed, by month, January first. */
  readonly months: readonly Money[];
  /** The first month still to come, drawn dashed: 12 for a year gone. */
  readonly toCome: number;
  /** Payments of work money in, the clients they came from, and those a request's code found. */
  readonly jobs: number;
  readonly clients: number;
  readonly paidByCode: number;
  /** The month that billed the most; null with nothing in. */
  readonly busiest: number | null;
  /** The most days in a row with no work money in, after the first and through today. */
  readonly longestQuiet: number;
  readonly billed: Money;
  /** Days with work money in: a seller's days open. */
  readonly daysOpen: number;
}

/** A work row of the year with its id (to know a code found it) and its sender (only counted). */
export type WorkYearCardRow = YearWorkRow & { readonly id: string; readonly merchant: string };

/**
 * My work year: twelve months of work money in with no scale, months to come dashed, the jobs,
 * clients and payments a code found as counts, the busiest month and the longest quiet. The
 * held-back amounts, certificates and the year's line never reach a card.
 */
export function workYearCard(input: {
  readonly year: number;
  readonly today: LocalDate;
  readonly rows: readonly WorkYearCardRow[];
  /** Money in that paid a request by its code, by id. */
  readonly codePaid: ReadonlySet<string>;
}): WorkYearCard {
  const { year, today } = input;
  const work = yearWork(input.rows, year);
  const ins = input.rows.filter((r) => r.day.startsWith(`${year}-`) && isKeptWorkIn(r));
  const clients = new Set(
    ins.filter((r) => r.source !== 'cash').map((r) => merchantKeyOf(r.merchant)),
  );
  clients.delete('');
  const days = [...new Set(ins.map((r) => r.day))].sort();
  const end = today < `${year}-12-31` ? today : `${year}-12-31`;
  let longestQuiet = 0;
  days.forEach((day, i) => {
    const next = days[i + 1];
    const gap = next === undefined ? diffDays(end, day) : diffDays(next, day) - 1;
    longestQuiet = Math.max(longestQuiet, gap);
  });
  const most = Math.max(0, ...work.months);
  const thisYear = Number(today.slice(0, 4));
  return {
    year,
    months: work.months,
    toCome: year < thisYear ? 12 : year > thisYear ? 0 : Number(today.slice(5, 7)),
    jobs: ins.length,
    clients: clients.size,
    paidByCode: ins.filter((r) => input.codePaid.has(r.id)).length,
    busiest: most > 0 ? work.months.indexOf(most) : null,
    longestQuiet,
    billed: work.billed,
    daysOpen: days.length,
  };
}
