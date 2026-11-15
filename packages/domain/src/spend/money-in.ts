import { merchantKeyOf } from '../capture/merchant-rule';
import { foldWords } from '../capture/spoken-spend';
import { floorToStep, VND, type Currency, type Money } from '../money/currency';
import type { PayCycle } from '../plan/pay-cycle';
import { diffDays, makeDate, type LocalDate } from '../time/local-date';
import type { NewYearWindow } from '../time/lunar';
import type { Income } from '../plan/incomes';
import type { Payday } from '../plan/pay-cycle';
import { incomeMatchOf, PAY_DAYS, PAY_SHARE, type RememberedPlace } from './income-pay';
import { isRequest, namesPerson, owedPaybackFor, PAYBACK_DAYS, type OwedLine } from './owed';
import { asksByHand, landsLessHeldBack, requestByCode } from './requests';
import type { SpendDirection, SpendStatus } from './spend';

/**
 * Money that came in: pay, a gift, a side job, a refund, a friend paying back. It never counts as
 * spending. Until the user says what it was at the close it changes nothing, so the number never
 * flatters the day on a guess; once kept it is one of:
 *
 * - `spread`: added to this cycle's free money, so every day left gets a share,
 * - `saved`: put in a pot or Future you (added to free money and taken out again as a top-up, so
 *   today's number holds and the pot's monthly need falls),
 * - `pay`: the pay the plan already counts as income,
 * - `refund`: a spend given back, so its money returns to the days,
 * - `payback`: someone paying back their share of a split, or a work claim repaid: only the user's
 *   own share ever counted, so the number does not move.
 */
export type MoneyIn = 'spread' | 'saved' | 'pay' | 'refund' | 'payback';

export interface MoneyInRow {
  readonly amount: Money;
  readonly status: SpendStatus;
  readonly direction?: SpendDirection | null | undefined;
  readonly moneyIn?: MoneyIn | null | undefined;
  /** The income it was, when it was placed as one of the plan's incomes. */
  readonly incomeId?: string | null | undefined;
}

const NO_INCOMES: ReadonlySet<string> = new Set();

/**
 * Whether a row is money in that adds to this cycle's free money: kept, and not the pay the plan
 * already counts nor a payback. Kept with nothing said (confirmed from the Inbox) is spread. Pay
 * of an income with no counted-on amount (`landed`: those incomes' ids) is not counted by the
 * plan, so it adds to free money like money that is spread.
 */
export function addsToFree(row: MoneyInRow, landed: ReadonlySet<string> = NO_INCOMES): boolean {
  if (row.direction !== 'in' || row.status !== 'kept') return false;
  if (row.moneyIn === 'pay') return row.incomeId != null && landed.has(row.incomeId);
  return row.moneyIn !== 'payback';
}

/** What money in adds to free money, over the rows given (the pay cycle's). */
export function sumMoneyIn(
  rows: readonly MoneyInRow[],
  landed: ReadonlySet<string> = NO_INCOMES,
): Money {
  let total = 0;
  for (const row of rows) if (addsToFree(row, landed)) total += row.amount;
  return total;
}

/** Money in at least this share of the income is a big one: the companion says so. */
export const BIG_SHARE = 0.2;
/** Pay this much above the plan (as a share of it) offers to change the plan. */
export const PLAN_UPDATE_SHARE = 0.05;
/** How far back a refund may reach for the spend it gives back. */
export const REFUND_DAYS = 60;
/** How far back a work claim may be repaid. */
export const CLAIM_DAYS = 120;

export interface IncomingMoney {
  readonly day: LocalDate;
  readonly amount: Money;
  /** Who sent it, as read ("Lan Nguyễn", "Shopee"). */
  readonly merchant: string;
  readonly note?: string | null | undefined;
  /** The transfer's own words, as the bank printed them. */
  readonly memo?: string | null | undefined;
  /** What the capture said it was: an email read as a refund says so. */
  readonly hint?: 'refund' | null | undefined;
}

/** Whether money in looks like the pay: most of the planned income, within days of payday. */
export function looksLikePay(
  money: Pick<IncomingMoney, 'day' | 'amount'>,
  income: Money,
  cycle: Pick<PayCycle, 'start' | 'payday'>,
): boolean {
  if (income <= 0 || money.amount < Math.ceil(income * PAY_SHARE)) return false;
  const near = (payday: LocalDate) => Math.abs(diffDays(money.day, payday)) <= PAY_DAYS;
  return near(cycle.start) || near(cycle.payday);
}

/** What pay brought beyond the plan: it is money in of its own, for the user to place. */
export function payExtra(amount: Money, income: Money): Money {
  return income > 0 ? Math.max(0, amount - income) : 0;
}

/** Whether pay above the plan by `extra` is worth offering to make the plan's income. */
export function offersPlanUpdate(extra: Money, income: Money): boolean {
  return income > 0 && extra >= income * PLAN_UPDATE_SHARE;
}

/** Money in this big next to the month's income: the companion notices. */
export function isBigMoneyIn(amount: Money, income: Money): boolean {
  return income > 0 && amount >= income * BIG_SHARE;
}

/** A spend money in may give back: spending, still counted, not already given back. */
export interface GivableSpend {
  readonly id: string;
  readonly day: LocalDate;
  readonly amount: Money;
  readonly merchant: string;
  readonly status: SpendStatus;
  readonly direction?: SpendDirection | null | undefined;
  readonly note?: string | null | undefined;
  readonly forWork?: boolean | undefined;
  /** Already answered by a refund or a payback. */
  readonly givenBack?: boolean | undefined;
}

const REFUND_WORDS = [
  'refund',
  'refunded',
  'reversal',
  'chargeback',
  'hoan tien',
  'hoan tra',
  'tra lai tien',
  'hoan phi',
].map((word) => ` ${word} `);

/** Whether a sender, note or memo says the money is a refund. */
export function namesRefund(text: string): boolean {
  const folded = ` ${foldWords(text)} `;
  return REFUND_WORDS.some((word) => folded.includes(word));
}

function givable(spend: GivableSpend, day: LocalDate, days: number): boolean {
  if (spend.direction === 'in' || spend.givenBack === true) return false;
  if (spend.status !== 'kept' && spend.status !== 'caught') return false;
  const back = diffDays(day, spend.day);
  return back >= 0 && back <= days;
}

function sameShop(a: string, b: string): boolean {
  const x = merchantKeyOf(a);
  const y = merchantKeyOf(b);
  if (x.length < 3 || y.length < 3) return false;
  return x === y || x.includes(y) || y.includes(x);
}

/**
 * The spend a refund gives back, or null. It must say it is a refund (the email was read as one,
 * or a refund word is in its text) or come from the same shop for the exact amount; it reaches
 * back `REFUND_DAYS`, for a spend of at least its amount (a part refund). The same shop wins over
 * an amount alone; then the exact amount; then the nearest day.
 */
export function refundFor(money: IncomingMoney, spends: readonly GivableSpend[]): string | null {
  const said =
    money.hint === 'refund' ||
    namesRefund(`${money.merchant} ${money.note ?? ''} ${money.memo ?? ''}`);
  let best: { id: string; score: number } | null = null;
  for (const spend of spends) {
    if (!givable(spend, money.day, REFUND_DAYS) || spend.amount < money.amount) continue;
    const shop = sameShop(spend.merchant, money.merchant);
    const exact = spend.amount === money.amount;
    if (!(said && (shop || exact)) && !(shop && exact)) continue;
    const score = (shop ? 4 : 0) + (exact ? 2 : 0) - diffDays(money.day, spend.day) / 1000;
    if (best === null || score > best.score) best = { id: spend.id, score };
  }
  return best?.id ?? null;
}

/**
 * The spend a payback answers, or null: the exact amount of a work claim from the last
 * `CLAIM_DAYS`, or of a spend with a note (a split saves one naming the total) from the last
 * `PAYBACK_DAYS`. The nearest day wins. Without `claims` (someone who works for themselves, whose
 * work spends are costs of their own work) a work spend is never a claim repaid.
 */
export function paybackFor(
  money: IncomingMoney,
  spends: readonly GivableSpend[],
  options: { readonly claims?: boolean } = {},
): string | null {
  const claims = options.claims ?? true;
  let best: GivableSpend | null = null;
  for (const spend of spends) {
    if (spend.amount !== money.amount) continue;
    const claim = claims && spend.forWork === true && givable(spend, money.day, CLAIM_DAYS);
    const split =
      spend.status === 'kept' &&
      (spend.note ?? '').trim() !== '' &&
      givable(spend, money.day, PAYBACK_DAYS);
    if (!claim && !split) continue;
    if (best === null || spend.day > best.day) best = spend;
  }
  return best?.id ?? null;
}

/** Money in at least this share of the plan's income, in the bonus season, is asked as the bonus. */
export const BONUS_SHARE = 0.5;
/** The bonus season opens on 15 December before Tết and runs to mùng 6. */
const BONUS_FROM_MONTH = 12;
const BONUS_FROM_DAY = 15;

/** Words a bonus's memo carries, without accents: "THUONG TET", "lương tháng 13", "bonus". */
const BONUS_WORDS = [
  'thuong tet',
  'tien thuong',
  'thuong cuoi nam',
  'luong 13',
  'luong thang 13',
  'thang 13',
  'tet',
  'bonus',
  'year end bonus',
  '13th month',
].map((word) => ` ${word} `);
/**
 * The same, in words that only keep their meaning with their marks: "thưởng" (not the name
 * Thương), and Korean and Chinese bonus words.
 */
const BONUS_MARKED = /thưởng|상여|보너스|年终奖|年終獎|奖金/iu;

/** Whether a sender, note or memo says the money is a (Tết) bonus. */
export function namesBonus(text: string): boolean {
  const folded = ` ${foldWords(text)} `;
  return (
    BONUS_WORDS.some((word) => folded.includes(word)) || BONUS_MARKED.test(text.normalize('NFC'))
  );
}

/** Whether a day is in the bonus season: from 15 December before mùng 1 to mùng 6. */
export function inBonusSeason(day: LocalDate, window: NewYearWindow | null): boolean {
  if (window === null) return false;
  const from = makeDate(window.year - 1, BONUS_FROM_MONTH, BONUS_FROM_DAY);
  return day >= from && day <= window.end;
}

/** The season's jar as the bonus question sees it: what it is for and what it holds. */
export interface BonusJar {
  readonly id: string;
  readonly goal: Money;
  readonly held: Money;
}

/** The bonus torn in two: what the jar is still missing goes in first; the rest is the person's. */
export function bonusSplit(
  amount: Money,
  jar: Pick<BonusJar, 'goal' | 'held'>,
): {
  readonly toJar: Money;
  readonly rest: Money;
} {
  const missing = Math.max(0, jar.goal - jar.held);
  const toJar = Math.min(Math.max(0, amount), missing);
  return { toJar, rest: Math.max(0, amount - toJar) };
}

/**
 * Whether money in is the Tết bonus (thưởng Tết, the 13th month): in the bonus season, with a
 * season's jar still missing something, and either at least half the plan's income or a bonus
 * word in its sender, note or memo.
 */
export function looksLikeBonus(
  money: IncomingMoney,
  context: {
    readonly income: Money;
    readonly window: NewYearWindow | null;
    readonly jar: BonusJar | null;
  },
): boolean {
  const { jar } = context;
  if (jar === null || jar.goal - jar.held <= 0 || !inBonusSeason(money.day, context.window)) {
    return false;
  }
  const big = context.income > 0 && money.amount >= Math.ceil(context.income * BONUS_SHARE);
  return big || namesBonus(`${money.merchant} ${money.note ?? ''} ${money.memo ?? ''}`);
}

/**
 * What the close asks about money in before it is placed, if it looks like anything. A payback of
 * owed lines carries them (`owed`) and the person they name, to ask "Linh paying back 300k?".
 */
export type MoneyInAsk =
  /**
   * The pay; of one of the plan's incomes (`incomeId`) once it holds them. `landing`: nothing is
   * counted on and the money is asked about as what landed, from a sender never placed before.
   */
  | { readonly kind: 'pay'; readonly incomeId?: string; readonly landing?: true }
  /** Money from a sender placed the same way as last time: spread, or saved in a jar. */
  | { readonly kind: 'remembered'; readonly place: RememberedPlace }
  | { readonly kind: 'bonus'; readonly jarId: string; readonly toJar: Money }
  | { readonly kind: 'refund'; readonly spendId: string }
  | {
      readonly kind: 'payback';
      readonly spendId: string;
      readonly owed?: readonly string[];
      readonly name?: string | null;
    }
  /**
   * A request to be paid whose code the transfer's words carry (`requestByCode`): what a client
   * held back, when the money is the strip less a tenth.
   */
  | { readonly kind: 'request'; readonly lineId: string; readonly heldBack: Money }
  /** No code, a sender nobody knows, and work requests open: "One of these?" (`asksByHand`). */
  | { readonly kind: 'byHand' };

/**
 * The one question the close asks about money in: the pay first, then the Tết bonus, then a
 * refund, then a payback of owed lines (`owedPaybackFor`), then of a spend with a note or a
 * work claim. Money whose memo names a bonus is asked as the bonus even near payday. Money
 * that looks like none of them is an ordinary card, to spread or save.
 *
 * A plan that holds its incomes (`incomes`, with the month's `anchor`) asks about the pay of
 * whichever income the money looks like, by that income's amount per pay and its own dates
 * (`incomeMatchOf`); with nothing counted on, money that is not a bonus, a refund or a payback is
 * asked about as the pay of the income that only lands, as Quick add places it when typed in. A
 * sender whose money was placed before (`remembered`) is offered that place
 * again, unless the money names a bonus or gives back a spend or owed lines: a refund still wins.
 */
export function moneyInAsk(
  money: IncomingMoney,
  context: {
    readonly income: Money;
    readonly cycle: Pick<PayCycle, 'start' | 'payday'>;
    readonly spends: readonly GivableSpend[];
    /** Open owed lines not already asked about tonight. */
    readonly owed?: readonly OwedLine[];
    /** The season and its jar, for the bonus question; absent for those who keep no season. */
    readonly season?: { readonly window: NewYearWindow | null; readonly jar: BonusJar | null };
    /** The plan's incomes, once it holds them, and the month's anchor their dates count in. */
    readonly incomes?: readonly Income[] | undefined;
    readonly anchor?: Payday;
    /** Where money from this sender went last time (`rememberedPlaceOf`). */
    readonly remembered?: RememberedPlace | null;
    /**
     * The person works for themselves (`plan.work`): a work spend is a cost of their work, so
     * money in is never matched to it as a claim repaid.
     */
    readonly work?: boolean;
    /**
     * Something is remembered about the sender (where its money went, whether it is work, a
     * request it paid): money from them is not asked about by hand.
     */
    readonly knownSender?: boolean;
  },
): MoneyInAsk | null {
  // A request's code in the transfer's words is read before any other matching.
  const coded = requestByCode([money.memo, money.note], context.owed ?? []);
  if (coded !== null) {
    return {
      kind: 'request',
      lineId: coded.id,
      heldBack: landsLessHeldBack(money.amount, coded.amount) ? coded.amount - money.amount : 0,
    };
  }
  const season = context.season;
  const bonus =
    money.hint !== 'refund' &&
    season !== undefined &&
    season.jar !== null &&
    looksLikeBonus(money, { income: context.income, ...season })
      ? {
          kind: 'bonus' as const,
          jarId: season.jar.id,
          toJar: bonusSplit(money.amount, season.jar).toJar,
        }
      : null;
  const said = namesBonus(`${money.merchant} ${money.note ?? ''} ${money.memo ?? ''}`);
  if (bonus !== null && said) return bonus;
  const remembered = context.remembered ?? null;
  if (remembered !== null) {
    const answers = givesBackAsk(money, context);
    if (answers !== null) return answers;
    return remembered.moneyIn === 'pay' && remembered.incomeId !== null
      ? { kind: 'pay', incomeId: remembered.incomeId }
      : { kind: 'remembered', place: remembered };
  }
  const match = incomeMatchOf(money, context.incomes, context.anchor ?? CALENDAR_MONTH);
  if (money.hint !== 'refund') {
    if (match.kind === 'pay') return { kind: 'pay', incomeId: match.incomeId };
    if (context.incomes === undefined && looksLikePay(money, context.income, context.cycle)) {
      return { kind: 'pay' };
    }
  }
  if (bonus !== null) return bonus;
  const answers = givesBackAsk(money, context);
  if (answers !== null) return answers;
  // Someone who works for themselves is paid by clients: their money is takings, never a claim
  // repaid by an employer.
  const payback = paybackFor(money, context.spends, { claims: context.work !== true });
  if (payback !== null) return { kind: 'payback', spendId: payback };
  // No code and a sender nobody knows, with work requests open: the person matches it by hand.
  if (money.hint !== 'refund' && byHandFor(money, context)) return { kind: 'byHand' };
  // Nothing is counted on: money that answers nothing else is what landed (`incomeMatchOf`).
  return match.kind === 'landing' && money.hint !== 'refund'
    ? { kind: 'pay', incomeId: match.incomeId, landing: true }
    : null;
}

const CALENDAR_MONTH: Payday = { kind: 'sameDay', day: 1 };

/** Whether money with no code is asked about by hand: see `asksByHand`. */
function byHandFor(
  money: IncomingMoney,
  context: { readonly owed?: readonly OwedLine[]; readonly knownSender?: boolean },
): boolean {
  const lines = context.owed ?? [];
  if (!lines.some(isRequest)) return false;
  const knownSender =
    context.knownSender === true || lines.some((line) => namesPerson(money.merchant, line.name));
  return asksByHand({ coded: false, knownSender, lines });
}

/** A refund of a spend, or a payback of owed lines: money that answers something already there. */
function givesBackAsk(
  money: IncomingMoney,
  context: { readonly spends: readonly GivableSpend[]; readonly owed?: readonly OwedLine[] },
): MoneyInAsk | null {
  const refund = refundFor(money, context.spends);
  if (refund !== null) return { kind: 'refund', spendId: refund };
  const owed = owedPaybackFor(money, context.owed ?? []);
  if (owed !== null) {
    return { kind: 'payback', spendId: owed.spendId, owed: owed.ids, name: owed.name };
  }
  return null;
}

/**
 * What a money-in card shows before it is placed: tomorrow's line as it is, and if the money were
 * spread over the days left. With no day left after today, spreading lands on today alone.
 */
export function spreadPreview(
  day: { readonly free: Money; readonly tomorrow: Money },
  amount: Money,
  daysLeft: number,
  currency: Currency = VND,
): { readonly asIs: Money; readonly spread: Money; readonly days: number } {
  const days = Math.max(1, daysLeft);
  return {
    asIs: day.tomorrow,
    spread: Math.max(0, floorToStep((day.free + amount) / days, currency)),
    days,
  };
}

/** Where money saved for Future you is put: Future you's jar (and 2.1 goals by their shares). */
export const FUTURE_YOU = 'futureYou';

/**
 * Money saved for Future you, split between its goals by their shares (evenly when none has one),
 * in whole minor units: what rounding leaves goes to the goal with the largest share. No goal, no
 * split: Future you has nowhere to keep it.
 */
export function futureYouSplit(
  amount: Money,
  goals: readonly { readonly id: string; readonly share: number | null }[],
): Readonly<Record<string, Money>> {
  if (goals.length === 0 || amount <= 0) return {};
  const shares = goals.map((g) => Math.max(0, g.share ?? 0));
  const total = shares.reduce((a, b) => a + b, 0);
  const weights = total > 0 ? shares.map((s) => s / total) : goals.map(() => 1 / goals.length);
  const parts = weights.map((w) => Math.floor(amount * w));
  let largest = 0;
  weights.forEach((w, i) => {
    if (w > (weights[largest] ?? 0)) largest = i;
  });
  parts[largest] = (parts[largest] ?? 0) + amount - parts.reduce((a, b) => a + b, 0);
  const split: Record<string, Money> = {};
  goals.forEach((goal, i) => {
    const part = parts[i] ?? 0;
    if (part > 0) split[goal.id] = part;
  });
  return split;
}

/**
 * Money in saved to Future you, by jar: all of it into Future you's jar, or, while 2.1 goals still
 * fill from the slice, split by their shares as 2.1 did, Future you's jar taking whatever share
 * they no longer take.
 */
export function futureYouSavedSplit(
  amount: Money,
  pots: readonly { readonly id: string; readonly kind: string; readonly share: number | null }[],
): Readonly<Record<string, Money>> {
  const goals = pots.filter((p) => p.kind === 'goal' && p.id !== FUTURE_YOU);
  const taken = goals.reduce((sum, g) => sum + Math.max(0, g.share ?? 0), 0);
  const rest = Math.max(0, Math.round((1 - taken) * 1e6) / 1e6);
  return futureYouSplit(amount, [
    ...goals,
    ...(goals.length === 0 || rest > 0
      ? [{ id: FUTURE_YOU, share: goals.length === 0 ? 1 : rest }]
      : []),
  ]);
}
