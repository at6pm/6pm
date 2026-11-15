import { z } from 'zod';

import { DEFAULT_CLOSE_AT, type JoinedAnswers } from '@6pm/domain';

import type { SqlDatabase } from './table';

const localDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const dayOfMonth = z.number().int().min(1).max(31);

/** How often an income pays (the domain's `Rhythm`). */
const rhythmSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('monthly'), day: z.union([dayOfMonth, z.literal('last')]) }),
  z.object({ kind: z.literal('weekly'), weekday: z.literal([0, 1, 2, 3, 4, 5, 6]) }),
  z.object({ kind: z.literal('everyTwoWeeks'), anchor: localDate }),
  z.object({
    kind: z.literal('twiceMonthly'),
    days: z.tuple([dayOfMonth, z.union([dayOfMonth, z.literal('last')])]).readonly(),
  }),
  z.object({ kind: z.literal('none') }),
]);

/** One income (the domain's `Income`): an amount of 0 is counted only once it has landed. */
const incomeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).nullable(),
  rhythm: rhythmSchema,
  amount: z.number().int().nonnegative(),
  fromWork: z.boolean().optional(),
  /** The first day it pays from: a wage started at the close after "Pay myself" was chosen. */
  from: localDate.optional(),
});

/** Whether money through a bank or wallet is work: always, sometimes (asked), or never. */
export const walletWorkSchema = z.enum(['always', 'sometimes', 'never']);
export type WalletWork = z.infer<typeof walletWorkSchema>;

/** The user's month, as onboarding and the Plan tab set it. Kept as one JSON setting. */
export const planSettingsSchema = z.object({
  income: z.number().int().nonnegative(),
  payday: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('sameDay'), day: z.number().int().min(1).max(31) }),
    z.object({ kind: z.literal('lastDay') }),
    z.object({ kind: z.literal('varies') }),
  ]),
  /** Future you, paid first each payday. */
  futureYou: z.number().int().nonnegative(),
  closeAt: z.string().regex(/^\d{2}:\d{2}$/),
  persona: z.enum(['soft', 'cheeky', 'roast']),
  serious: z.boolean(),
  /** The day the user set up 6pm: that pay cycle counts only the days left in it. */
  startedOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  /**
   * In the pay cycle the user set 6pm up in: what they said they spent between payday and that
   * day, not counting bills. Counted in place of the even-pace estimate; a plan saved before 6pm
   * asked has none and keeps the estimate.
   */
  spentSincePayday: z.number().int().nonnegative().optional(),
  /** "Start Future you at payday": the cycle the user joined sets nothing aside for Future you. */
  futureYouAtPayday: z.boolean().optional(),
  /**
   * The home currency (ISO 4217), from the phone when the month was first set up. A plan saved
   * before 6pm counted other currencies has none, and is in đồng.
   */
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .optional(),
  /**
   * Every income, once the user has said how money reaches them. Absent on every plan saved before
   * it was asked: the plan's own `income` on its payday is then the one income (`incomesOf`), and
   * the payday stays the month's anchor either way.
   */
  incomes: z.array(incomeSchema).max(12).optional(),
  /**
   * The day the incomes were first set. Months that ended before it were counted as a monthly plan
   * and carry nothing over; without it no month is carried.
   */
  incomesFrom: localDate.optional(),
  /** "Make it last until": the day money with no counted-on pay has to last through. */
  lastUntil: localDate.nullable().optional(),
  /**
   * Someone who earns from work of their own: taking pay as it comes, or paying themselves a wage
   * (an income with `fromWork`). `banks` answers, per bank or wallet code as the `wallets` setting
   * saves it ("MB", "CASH", "name:Chase"), whether money through it is work.
   */
  work: z
    .object({
      mode: z.enum(['asItComes', 'payMyself']),
      banks: z.record(z.string().min(1), walletWorkSchema).optional(),
    })
    .optional(),
});
export type PlanSettings = z.infer<typeof planSettingsSchema>;

/** What the plan says about the cycle the user joined, as the domain reads it. */
export function joinedAnswersOf(plan: PlanSettings | null): JoinedAnswers {
  return {
    on: plan?.startedOn ?? null,
    spentSincePayday: plan?.spentSincePayday ?? null,
    futureYouAtPayday: plan?.futureYouAtPayday === true,
  };
}

export const DEFAULT_PLAN: PlanSettings = {
  income: 0,
  payday: { kind: 'lastDay' },
  futureYou: 0,
  closeAt: DEFAULT_CLOSE_AT,
  persona: 'cheeky',
  serious: false,
};

const KEY = 'plan';

/** A plan from before 6pm counted other currencies was set up in đồng. */
const PLAN_CURRENCY_BEFORE = 'VND';

/**
 * What the app counts in: the plan's currency, đồng for a plan that has none, and the phone's
 * own before there is a plan (onboarding).
 */
export function homeCurrencyCode(plan: PlanSettings | null, deviceCode: string): string {
  return plan === null ? deviceCode : planCurrencyCode(plan);
}

/** The currency a plan was set up in. */
export function planCurrencyCode(plan: PlanSettings): string {
  return plan.currency ?? PLAN_CURRENCY_BEFORE;
}

export async function readPlan(db: SqlDatabase): Promise<PlanSettings | null> {
  const rows = await db.getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    KEY,
  ]);
  const raw = rows[0]?.value;
  if (raw === undefined) return null;
  const parsed = planSettingsSchema.safeParse(parseJson(raw));
  return parsed.success ? parsed.data : null;
}

/** A damaged setting reads as no setting rather than throwing on launch. */
function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function writePlan(db: SqlDatabase, plan: PlanSettings): Promise<void> {
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
    KEY,
    JSON.stringify(planSettingsSchema.parse(plan)),
  ]);
}
