import { z } from 'zod';

import { IMPORT_APPS } from '../import/columns';

/** Rows of the phone's money database, checked on every read and write. */

const id = z.string().min(1);
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const instant = z.string().min(20);
const vnd = z.number().int().nonnegative();

/** The longest transfer memo kept: a bank's transfer message is at most about this long. */
export const MEMO_MAX = 140;

export const spendSourceSchema = z.enum([
  'manual',
  'voice',
  'shared',
  'qr',
  'email',
  'applePay',
  'cash',
  'alert',
  'import',
]);
export const spendStatusSchema = z.enum(['caught', 'pending', 'kept', 'skipped', 'deleted']);

/** Spending goes out; money that came in (pay, a gift, a refund) comes in. */
export const spendDirectionSchema = z.enum(['out', 'in']);

/**
 * What money that came in was, once the user said at the close: spread over the days left, saved
 * in a pot or Future you, their pay, a refund of a spend, or someone paying back their share.
 */
export const moneyInSchema = z.enum(['spread', 'saved', 'pay', 'refund', 'payback']);

export const categoryRowSchema = z.object({
  id,
  name: z.string().min(1),
  icon: z.string().min(1),
  hue: z.number(),
  countsDaily: z.boolean(),
  sort: z.number().int(),
  archivedAt: instant.nullable(),
});
export type CategoryRow = z.infer<typeof categoryRowSchema>;

export const foreignAmountSchema = z.object({
  currency: z.string().length(3),
  amount: z.number().nonnegative(),
  /** Đồng for one unit; 0 while a captured foreign amount waits for a rate. */
  rate: z.number().nonnegative(),
});

export const spendRowSchema = z.object({
  id,
  day,
  at: instant,
  amount: vnd,
  categoryId: id,
  merchant: z.string(),
  note: z.string().nullable(),
  source: spendSourceSchema,
  status: spendStatusSchema,
  previousStatus: spendStatusSchema.nullable(),
  wallet: z.string().nullable(),
  forWork: z.boolean(),
  detail: z.string().nullable(),
  foreignAmount: foreignAmountSchema.nullable(),
  /**
   * The receipt printed no currency and the one saved was guessed; absent on rows and backups
   * from before it was kept.
   */
  currencyGuessed: z.boolean().optional(),
  /**
   * The bill this payment paid (its id), or `'repayment'` for a card or loan with no bill: out of
   * the daily number, since the bill already came off the plan. Absent on rows and backups from
   * before bills could be paid by a spend.
   */
  paysBill: z.string().min(1).nullable().optional(),
  /**
   * The transfer's own words a bank receipt or email printed ("Nội dung: Thanh toan the tin
   * dung"), read when asking whether it paid a bill; the user's own words are `note`. Absent on
   * rows and backups from before it was kept.
   */
  memo: z.string().max(MEMO_MAX).nullable().optional(),
  /** `in` for money that came in; null or absent is spending, as on rows from before it could. */
  direction: spendDirectionSchema.nullable().optional(),
  /** What money that came in was; null while it waits for the close, and on spending. */
  moneyIn: moneyInSchema.nullable().optional(),
  /** The spend a refund or a payback answers (its id). */
  givesBack: id.nullable().optional(),
  /** The pot (or Future you goal) money that came in was saved in (its id). */
  savedTo: id.nullable().optional(),
  /** The jar this spend came out of (its id): its part stays out of the daily number (M13). */
  fromPot: id.nullable().optional(),
  /** What the jar covered, at most the spend; the rest counted today. Null: the whole spend. */
  fromPotAmount: vnd.nullable().optional(),
  /**
   * The bring-in this line came with (`imports.id`): history from another app's export, before the
   * day 6pm started. Absent on every other spend, and on rows and backups from before it could.
   */
  importId: id.nullable().optional(),
  /**
   * Red envelopes in one lì xì entry ("5 bao × 200k" is 5): the spend or money in is their total.
   * Null or absent for everything else, and on rows and backups from before it was kept.
   */
  envelopes: z.number().int().positive().max(999).nullable().optional(),
  createdAt: instant,
  updatedAt: instant,
});
export type SpendRow = z.infer<typeof spendRowSchema>;

export const merchantRuleRowSchema = z.object({
  merchantKey: z.string().min(1),
  merchant: z.string().min(1),
  categoryId: id,
  learnedTimes: z.number().int().nonnegative(),
  setByUser: z.boolean(),
});
export type MerchantRuleRow = z.infer<typeof merchantRuleRowSchema>;

const month = z.string().regex(/^\d{4}-\d{2}$/);

export const billKindSchema = z.enum(['card', 'other']);

/** Kind, last month, paid amount and asked cycle arrived with snapshot format 4. */
export const billRowSchema = z.object({
  id,
  name: z.string().min(1),
  icon: z.string().min(1),
  hue: z.number(),
  amount: vnd,
  dueDay: z.number().int().min(1).max(31),
  paidCycle: day.nullable(),
  sort: z.number().int(),
  archivedAt: instant.nullable(),
  /** A card bill's payment never moves free money (card spending counted when it happened). */
  kind: billKindSchema.default('other'),
  /** The last month ('YYYY-MM') it is paid in; it stops by itself after. Null: no end. */
  lastMonth: month.nullable().default(null),
  /** What paying it took in `paidCycle`, when that was not its amount (`other` bills only). */
  paidAmount: vnd.nullable().default(null),
  /** The pay cycle the close last asked whether a capture paid it: once a cycle at most. */
  askedCycle: day.nullable().default(null),
});
export type BillRow = z.infer<typeof billRowSchema>;

export const potRowSchema = z.object({
  id,
  kind: z.enum(['goal', 'occasion']),
  name: z.string().min(1),
  icon: z.string().min(1),
  hue: z.number(),
  goal: vnd,
  neededBy: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .nullable(),
  share: z.number().min(0).max(1).nullable(),
  /**
   * What a jar with no date puts in each payday. Null or absent: nothing steady (a dated jar, a
   * 2.1 goal still filling from Future you's slice, or one filled only by hand).
   */
  monthly: vnd.nullable().optional(),
  /**
   * A season's jar: `newYear` is the Tết jar (Seollal's or the Spring Festival's for those who keep
   * them). It is outside the free jars, and in the season's window it is asked about by itself.
   * Null or absent for every other jar, and on rows and backups from before it was kept.
   */
  season: z.enum(['newYear']).nullable().optional(),
  paused: z.boolean(),
  createdAt: instant,
  archivedAt: instant.nullable(),
});
export type PotRow = z.infer<typeof potRowSchema>;

export const closedDayRowSchema = z.object({
  day,
  closedAt: instant,
  late: z.boolean(),
  spent: vnd,
  line: z.number().int(),
  tomorrow: vnd,
  note: z.string().nullable(),
});
export type ClosedDayRow = z.infer<typeof closedDayRowSchema>;

/**
 * One bring-in of another app's history: which app, when, and what it wrote. Its lines are the
 * spends with its `importId`. When its lines in the joined pay cycle stood in for "spent since
 * payday", `answerBefore` keeps what was there, so undoing it puts that back.
 */
export const importRowSchema = z.object({
  id,
  app: z.enum(IMPORT_APPS),
  at: instant,
  lines: z.number().int().nonnegative(),
  firstDay: day.nullable(),
  lastDay: day.nullable(),
  /** This bring-in set "spent since payday" from its lines. */
  answered: z.boolean(),
  /** What "spent since payday" was before it did; null when it was the estimate. */
  answerBefore: vnd.nullable(),
});
export type ImportRecordRow = z.infer<typeof importRowSchema>;

/** How an owed line was settled (see `OwedSettled`). */
export const owedSettledSchema = z.enum(['payback', 'cash', 'covered']);

/**
 * A share of a split spend someone else owes: a person (a typed first name, or nobody named), the
 * amount, and the spend it is a share of. Open until settled: by money in (`settledSpendId` is
 * that money in), in cash (the payback kept that day), or covered by the user (the spend it became
 * that day). Arrived with snapshot format 9.
 */
export const owedRowSchema = z.object({
  id,
  spendId: id,
  name: z.string().min(1).nullable(),
  amount: z.number().int().positive(),
  /** The spend's day: a payback's reach is counted from it. */
  day,
  /** Its place in the split, after the user's own share. */
  sort: z.number().int().nonnegative(),
  createdAt: instant,
  settledAt: instant.nullable(),
  settledBy: owedSettledSchema.nullable(),
  settledSpendId: id.nullable(),
  /** When to remind the user to ask; set and read by reminders, null for none. */
  remindAt: instant.nullable(),
  updatedAt: instant,
});
export type OwedRow = z.infer<typeof owedRowSchema>;
