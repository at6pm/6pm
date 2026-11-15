import {
  addDays,
  diffDays,
  leadIncome,
  moneyNext,
  monthlyIncomeOf,
  payCycleOn,
  SALARY_INCOME_ID,
  weekdayMondayFirst,
  type Income,
  type LocalDate,
  type Payday,
  type Rhythm,
} from '@6pm/domain';

/** The four answers to "How does money reach you?", in the order the cards stand. */
export const MONEY_WAYS = ['salary', 'weekly', 'landed', 'sell'] as const;
export type MoneyWay = (typeof MONEY_WAYS)[number];

/** A follow-up page of the step, after the question itself. */
export type MoneyPage = 'ways' | 'salary' | 'pay' | 'asItComes';

/** How often the pay of "every week or two" comes. */
export type PayEvery = 'weekly' | 'everyTwoWeeks' | 'twiceMonthly';

/** "Make it last until": a week, two, the month's end, or a day picked on the strip. */
export type LastFor =
  | { readonly kind: 'days'; readonly days: 7 | 14 }
  | { readonly kind: 'monthEnd' }
  | { readonly kind: 'date'; readonly date: LocalDate };

const SALARY_ID = SALARY_INCOME_ID;

/** The answers the step gathers. */
export interface MoneyWaysAnswers {
  readonly ways: readonly MoneyWay[];
  /** The salary: a month's amount on the wheels and its payday on the strip. */
  readonly income: number;
  readonly payday: Payday;
  /** Every week or two: what each pay brings, how often, and its day. */
  readonly payAmount: number;
  readonly every: PayEvery;
  /** 0 = Monday … 6 = Sunday, as the domain's weeks run. */
  readonly weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Every two weeks: whether the next pay is this coming one or the one after. */
  readonly fortnightAfter: boolean;
  readonly twiceDays: readonly [number, number | 'last'];
  readonly lastFor: LastFor;
}

/** The answers a new person starts from: nothing picked, and the design's example amounts. */
export function startingWays(income: number, payAmount: number): MoneyWaysAnswers {
  return {
    ways: [],
    income,
    payday: { kind: 'sameDay', day: 25 },
    payAmount,
    every: 'weekly',
    weekday: 4,
    fortnightAfter: false,
    twiceDays: [15, 'last'],
    lastFor: { kind: 'monthEnd' },
  };
}

/** Picks or unpicks one answer, keeping the cards' order. */
export function toggleWay(ways: readonly MoneyWay[], way: MoneyWay): MoneyWay[] {
  const next = ways.includes(way) ? ways.filter((w) => w !== way) : [...ways, way];
  return MONEY_WAYS.filter((w) => next.includes(w));
}

/**
 * The step's pages: the question, then a follow-up for each answer in the cards' order. Money that
 * comes when it comes and selling share one ("Make it last until"), and so does a salary whose
 * payday varies: nobody is asked for a figure they cannot know.
 */
export function moneyPages(answers: Pick<MoneyWaysAnswers, 'ways' | 'payday'>): MoneyPage[] {
  const { ways } = answers;
  const pages: MoneyPage[] = ['ways'];
  if (ways.includes('salary')) pages.push('salary');
  if (ways.includes('weekly')) pages.push('pay');
  const varies = ways.includes('salary') && answers.payday.kind === 'varies';
  if (ways.includes('landed') || ways.includes('sell') || varies) pages.push('asItComes');
  return pages;
}

/**
 * The plan as before: only a salary on a payday it knows. Such a plan is saved exactly as it
 * always was, with no incomes, so its number never moves.
 */
export function salaryOnly(answers: Pick<MoneyWaysAnswers, 'ways' | 'payday'>): boolean {
  return (
    answers.ways.length === 1 && answers.ways[0] === 'salary' && answers.payday.kind !== 'varies'
  );
}

/** The day of a fortnightly pay to count from: this coming weekday, or the one after. */
export function fortnightAnchor(today: LocalDate, weekday: number, after: boolean): LocalDate {
  const wait = (weekday - weekdayMondayFirst(today) + 7) % 7;
  return addDays(today, wait + (after ? 7 : 0));
}

function rhythmOf(answers: MoneyWaysAnswers, today: LocalDate): Rhythm {
  switch (answers.every) {
    case 'weekly':
      return { kind: 'weekly', weekday: answers.weekday };
    case 'everyTwoWeeks':
      return {
        kind: 'everyTwoWeeks',
        anchor: fortnightAnchor(today, answers.weekday, answers.fortnightAfter),
      };
    case 'twiceMonthly':
      return { kind: 'twiceMonthly', days: answers.twiceDays };
  }
}

/**
 * The incomes the answers make: the salary on its day (or, with a payday that varies, counted as
 * it lands), the pay of every week or two, and money that comes when it comes; selling is work of
 * one's own, counted as it lands.
 */
export function incomesOfAnswers(answers: MoneyWaysAnswers, today: LocalDate): Income[] {
  const out: Income[] = [];
  const { ways } = answers;
  if (ways.includes('salary')) {
    const { payday } = answers;
    out.push(
      payday.kind === 'varies'
        ? { id: SALARY_ID, name: null, rhythm: { kind: 'none' }, amount: 0 }
        : {
            id: SALARY_ID,
            name: null,
            rhythm: { kind: 'monthly', day: payday.kind === 'sameDay' ? payday.day : 'last' },
            amount: Math.max(0, Math.round(answers.income)),
          },
    );
  }
  if (ways.includes('weekly')) {
    out.push({
      id: 'pay',
      name: null,
      rhythm: rhythmOf(answers, today),
      amount: Math.max(0, Math.round(answers.payAmount)),
    });
  }
  if (ways.includes('landed')) {
    out.push({ id: 'landed', name: null, rhythm: { kind: 'none' }, amount: 0 });
  }
  if (ways.includes('sell')) {
    out.push({ id: 'work', name: null, rhythm: { kind: 'none' }, amount: 0, fromWork: true });
  }
  return out;
}

/**
 * The month's anchor for incomes: the lead monthly income's own day, so its pay opens the month;
 * else the calendar month.
 */
export function anchorOf(incomes: readonly Income[]): Payday {
  const lead = leadIncome(incomes);
  if (lead?.rhythm.kind !== 'monthly') return { kind: 'sameDay', day: 1 };
  const { day } = lead.rhythm;
  return day === 'last' ? { kind: 'lastDay' } : { kind: 'sameDay', day };
}

/**
 * The day money has to last until, as saved: a week or two from today, the day picked, or none
 * for the month's end (the month's own payday then ends it).
 */
export function lastUntilOf(lastFor: LastFor, today: LocalDate): LocalDate | null {
  switch (lastFor.kind) {
    case 'days':
      return addDays(today, lastFor.days);
    case 'date':
      return lastFor.date;
    case 'monthEnd':
      return null;
  }
}

/**
 * The day "Each landing covers bills first, then lasts to {date}" names: the day the money is
 * divided through, as the daily number counts it (`moneyNext`). Beside a pay that is counted on,
 * that is the pay's day, whatever was chosen.
 */
export function lastsTo(
  lastFor: LastFor,
  today: LocalDate,
  anchor: Payday,
  incomes: readonly Income[],
): LocalDate {
  return moneyNext(today, payCycleOn(today, anchor), incomes, lastUntilOf(lastFor, today)).on;
}

/** The days the "A date…" strip offers: tomorrow through about three months on. */
export function lastUntilDays(today: LocalDate): LocalDate[] {
  return Array.from({ length: 92 }, (_, i) => addDays(today, i + 1));
}

/** The next day a weekday comes, today included. */
export function nextWeekday(today: LocalDate, weekday: number): LocalDate {
  return addDays(today, (weekday - weekdayMondayFirst(today) + 7) % 7);
}

/** What onboarding saves of the answers: the month's income and anchor, and its incomes. */
export interface PlanOfAnswers {
  readonly income: number;
  readonly payday: Payday;
  /** Null for a salary on a payday it knows: that plan is saved exactly as it always was. */
  readonly incomes: {
    readonly incomes: readonly Income[];
    readonly lastUntil: LocalDate | null;
    readonly work: boolean;
  } | null;
}

/**
 * The plan the answers make. A salary alone, on a day it knows, is the plan as before: its amount
 * and payday, no incomes. Anything else holds its incomes, counts what they bring in a usual month
 * as the plan's income, and is anchored on the lead monthly income's day (or the 1st).
 */
export function planOfAnswers(answers: MoneyWaysAnswers, today: LocalDate): PlanOfAnswers {
  if (salaryOnly(answers)) {
    return { income: answers.income, payday: answers.payday, incomes: null };
  }
  const incomes = incomesOfAnswers(answers, today);
  return {
    income: monthlyIncomeOf({ income: 0, incomes }),
    payday: anchorOf(incomes),
    incomes: {
      incomes,
      lastUntil: lastUntilOf(answers.lastFor, today),
      work: answers.ways.includes('sell'),
    },
  };
}

/**
 * The answers a plan already stands on, for asking the question again from Plan: each income's
 * way ticked, with what it was saved with, so each follow-up opens on its own values and saving
 * them unchanged makes the same plan (`planOfAnswers`). A plan never asked about its incomes is a
 * salary on its payday ("It varies" included); `start` fills what the plan does not say.
 */
export function answersOfPlan(
  plan: {
    readonly income: number;
    readonly payday: Payday;
    readonly incomes?: readonly Income[] | undefined;
    readonly lastUntil?: LocalDate | null | undefined;
  },
  today: LocalDate,
  start: MoneyWaysAnswers,
): MoneyWaysAnswers {
  const lastFor: LastFor =
    plan.lastUntil != null && plan.lastUntil >= today
      ? { kind: 'date', date: plan.lastUntil }
      : { kind: 'monthEnd' };
  if (plan.incomes === undefined) {
    return { ...start, ways: ['salary'], income: plan.income, payday: plan.payday, lastFor };
  }
  let answers: MoneyWaysAnswers = { ...start, ways: [], lastFor };
  const tick = (way: MoneyWay) => MONEY_WAYS.filter((w) => w === way || answers.ways.includes(w));
  for (const income of plan.incomes) {
    const { rhythm } = income;
    switch (rhythm.kind) {
      case 'monthly':
        answers = {
          ...answers,
          ways: tick('salary'),
          income: income.amount,
          payday:
            rhythm.day === 'last' ? { kind: 'lastDay' } : { kind: 'sameDay', day: rhythm.day },
        };
        break;
      case 'weekly':
        answers = {
          ...answers,
          ways: tick('weekly'),
          payAmount: income.amount,
          every: 'weekly',
          weekday: rhythm.weekday,
        };
        break;
      case 'everyTwoWeeks': {
        const weekday = weekdayMondayFirst(rhythm.anchor) as MoneyWaysAnswers['weekday'];
        // The anchor is this coming weekday or the one after, fourteen days apart either way.
        const after = diffDays(fortnightAnchor(today, weekday, false), rhythm.anchor) % 14 !== 0;
        answers = {
          ...answers,
          ways: tick('weekly'),
          payAmount: income.amount,
          every: 'everyTwoWeeks',
          weekday,
          fortnightAfter: after,
        };
        break;
      }
      case 'twiceMonthly':
        answers = {
          ...answers,
          ways: tick('weekly'),
          payAmount: income.amount,
          every: 'twiceMonthly',
          twiceDays: rhythm.days,
        };
        break;
      case 'none':
        // The salary that varies is counted as it lands; so are money that comes and takings.
        answers =
          income.id === SALARY_ID
            ? { ...answers, ways: tick('salary'), income: plan.income, payday: { kind: 'varies' } }
            : { ...answers, ways: tick(income.fromWork === true ? 'sell' : 'landed') };
        break;
    }
  }
  return answers;
}
