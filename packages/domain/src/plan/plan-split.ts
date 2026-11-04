import { floorToStep, VND, type Money as Vnd } from '../money/currency';
import { dayPartOf, type CountedSpend } from '../spend/spend';
import { addDays, diffDays, type LocalDate } from '../time/local-date';
import { cycleFutureYou, dailyNumber, joinedFree, type DailyNumberInput } from './daily-number';
import type { PayCycle } from './pay-cycle';

/** The parts the pay splits into, left to right. */
export type SplitPartKind = 'bills' | 'pots' | 'before' | 'free' | 'over';

export interface SplitPart {
  readonly kind: SplitPartKind;
  /** What the part holds; never below zero (it sizes the part). */
  readonly amount: Vnd;
}

/** A line of Today's maths, top to bottom. */
export type MathsRowKind =
  /** The cycle's free money: the pay less bills and jars. */
  | 'free'
  /** What went before 6pm started counting, in the cycle the person joined. */
  | 'before'
  /** Counted before today. */
  | 'spentBefore'
  /** Counted before today, in the cycle the person joined (after joining). */
  | 'sinceJoined'
  /** Counted this cycle, today included (past the plan). */
  | 'spentSoFar'
  /** Free money at the start of today. */
  | 'left'
  /** Left over the days to payday, today included: the day's line. */
  | 'divide'
  /** How far past the plan the cycle is. */
  | 'over'
  /** Bills and jars keep what they hold (no amount). */
  | 'untouched'
  /** The pay that lands tomorrow. */
  | 'tomorrow';

export interface MathsRow {
  readonly kind: MathsRowKind;
  /** Signed: what a row takes away is below zero. Null for a row with words only. */
  readonly amount: Vnd | null;
  /** A total: drawn under a dashed rule. */
  readonly total: boolean;
  /** The row the maths lands on (the day's line, or the over). */
  readonly result: boolean;
  /** `divide`'s day count. */
  readonly count?: number;
}

/** A day of the cycle as the Free part draws it. */
export type CycleDayKind =
  /** Before the person joined: not counted, so no dot. */
  | 'none'
  | 'past'
  /** A past day once the cycle had gone past its plan. */
  | 'over'
  | 'today'
  | 'future';

export interface CycleDay {
  readonly day: LocalDate;
  readonly kind: CycleDayKind;
  /** Counted that day (day parts: what a jar covered is left out). */
  readonly spent: Vnd;
  /** The day's spending against an even day of the cycle's free money, 0 to 1. */
  readonly level: number;
}

export interface PlanSplitInput {
  /** The day's input, exactly as the daily number takes it. */
  readonly input: DailyNumberInput;
  readonly cycle: PayCycle;
  readonly today: LocalDate;
  /** Every spend of the cycle through today, with its day (the Free part's dots). */
  readonly spends: readonly (CountedSpend & { readonly day: LocalDate })[];
  /** The day 6pm was set up; null when unknown. */
  readonly joinedOn: LocalDate | null;
}

export interface PlanSplit {
  /** The pay: income and money that came in and was kept. */
  readonly pay: Vnd;
  readonly bills: Vnd;
  /** Everything jars take this cycle: Future you's slice, the other jars and top-ups. */
  readonly pots: Vnd;
  /** Gone before 6pm started counting (the joined cycle only). */
  readonly before: Vnd;
  /** The cycle's free money: the pay less bills, jars and what went before. */
  readonly free: Vnd;
  /** How far past the plan the cycle is; nothing when it is not. */
  readonly over: Vnd;
  /** The one number: `dailyNumber(input).line`. */
  readonly line: Vnd;
  readonly daysLeft: number;
  /** Days since the payday that started the cycle: 0 on payday, 1 the day after. */
  readonly daysSincePayday: number;
  /** The cycle's free money is gone. */
  readonly overspent: boolean;
  /** Payday is tomorrow. */
  readonly lastDay: boolean;
  /** The cycle the person joined part-way through. */
  readonly first: boolean;
  /** Left to right; Before and Over only when they hold something. */
  readonly parts: readonly SplitPart[];
  /** Today's maths, adding up to the line (or, past the plan, to the over). */
  readonly maths: readonly MathsRow[];
  /** One per day from the payday that started the cycle to the day before the next. */
  readonly days: readonly CycleDay[];
}

const row = (
  kind: MathsRowKind,
  amount: Vnd | null,
  extra: Partial<Pick<MathsRow, 'total' | 'result' | 'count'>> = {},
): MathsRow => ({ kind, amount, total: false, result: false, ...extra });

/**
 * Plan's split of the pay into Bills, Pots, Free (and Before, Over), Today's maths and the cycle's
 * days. Every amount comes from the same input as the daily number, so the "a day" Plan shows is
 * Today's line, and the maths adds up to it: free money, less what went before and what was spent
 * before today, over the days left with today included.
 */
export function planSplit(split: PlanSplitInput): PlanSplit {
  const { input, cycle, today } = split;
  const { plan, share = 1 } = input;
  const day = dailyNumber(input);
  const moneyIn = Number.isFinite(input.moneyIn) ? Math.max(0, input.moneyIn ?? 0) : 0;
  const pay = plan.income + moneyIn;
  const pots = cycleFutureYou(input) + plan.occasions + plan.topUps;
  const planned = plan.income - plan.bills - cycleFutureYou(input) - plan.occasions;
  const before = planned - joinedFree(planned, share, input.beforeJoining);
  const freeThisMonth = pay - plan.bills - pots;
  const free = freeThisMonth - before;
  const over = day.overspent ? -day.free : 0;
  const daysLeft = Math.max(0, input.daysLeft);
  const first = split.joinedOn !== null && split.joinedOn > cycle.start;
  const spentRow = first ? 'sinceJoined' : null;

  const maths: MathsRow[] = [row('free', freeThisMonth)];
  if (before > 0) maths.push(row('before', -before));
  if (day.overspent) {
    maths.push(
      row(spentRow ?? 'spentSoFar', -(input.spentBefore + day.spent)),
      row('over', over, { total: true, result: true }),
      // Each cycle starts whole: the over is not carried into the next pay, so no row says so.
      row('untouched', null),
    );
  } else {
    if (input.spentBefore !== 0 || first) {
      maths.push(row(spentRow ?? 'spentBefore', -input.spentBefore));
    }
    if (maths.length > 1) maths.push(row('left', day.startFree, { total: true }));
    maths.push(row('divide', day.line, { total: true, result: true, count: daysLeft + 1 }));
    if (daysLeft === 1) maths.push(row('tomorrow', plan.income));
  }

  return {
    pay,
    bills: plan.bills,
    pots,
    before,
    free,
    over,
    line: day.line,
    daysLeft,
    daysSincePayday: diffDays(today, cycle.start),
    overspent: day.overspent,
    lastDay: daysLeft === 1,
    first,
    parts: [
      { kind: 'bills', amount: Math.max(0, plan.bills) },
      { kind: 'pots', amount: Math.max(0, pots) },
      ...(before > 0 ? [{ kind: 'before' as const, amount: before }] : []),
      { kind: 'free', amount: Math.max(0, free) },
      ...(over > 0 ? [{ kind: 'over' as const, amount: over }] : []),
    ],
    maths,
    days: cycleDays(split, free, first),
  };
}

/** The cycle's days: what each counted, and whether the cycle was past its plan by then. */
function cycleDays(split: PlanSplitInput, free: Vnd, first: boolean): CycleDay[] {
  const { cycle, today, input } = split;
  const count = Math.max(1, diffDays(cycle.payday, cycle.start));
  const byDay = new Map<LocalDate, Vnd>();
  for (const spend of split.spends) {
    const part = dayPartOf(spend, input.notDaily);
    if (part !== 0) byDay.set(spend.day, (byDay.get(spend.day) ?? 0) + part);
  }
  const joinedOn = first ? split.joinedOn : null;
  const counted = joinedOn === null ? count : Math.max(1, diffDays(cycle.payday, joinedOn));
  // An even day of the cycle's free money, as the dots' scale (a step when there is none).
  const even = Math.max(floorToStep(free / counted, input.currency ?? VND), 1);
  let running = 0;
  return Array.from({ length: count }, (_, k) => {
    const date = addDays(cycle.start, k);
    const spent = date <= today ? (byDay.get(date) ?? 0) : 0;
    if (joinedOn !== null && date < joinedOn && date !== today) {
      return { day: date, kind: 'none' as const, spent: 0, level: 0 };
    }
    running += spent;
    const kind: CycleDayKind =
      date === today ? 'today' : date > today ? 'future' : running > free ? 'over' : 'past';
    return { day: date, kind, spent, level: Math.max(0, Math.min(1, spent / even)) };
  });
}
