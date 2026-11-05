import {
  currencyOf,
  FUTURE_YOU_POT_ID,
  moneyInAsk,
  newYearJarOf,
  nextNewYearWindow,
  owedByPerson,
  paydayPreview,
  planReminders,
  receiptBankOf,
  type CloseNews,
  type LocalDate,
  type LunarTradition,
  type PaydayPreview,
  type PlannedNotification,
  type QuietWayInput,
  type WaitingMoney,
} from '@6pm/domain';

import type { CatchSeen } from '../../data/first-catch';
import { waitingOf, type MoneySnapshot } from '../../data/money-store';
import type { NotificationMemory, NotificationSettings } from '../../data/notification-settings';
import { openOwedOf, owedLineOf } from '../../data/owed-actions';
import { planCurrencyCode } from '../../data/plan-settings';

/** The ways that run by themselves and can be cancelled by the phone when they catch again. */
const WATCHED_WAYS = ['alert', 'applePay'] as const;

/** What the close will ask about each piece of money in still waiting. */
export function waitingMoneyOf(
  snapshot: MoneySnapshot,
  tradition: LunarTradition | null,
): WaitingMoney[] {
  const { plan } = snapshot;
  if (plan === null) return [];
  const owed = openOwedOf(snapshot).map(owedLineOf);
  const jar = newYearJarOf(snapshot.pots);
  const window = tradition === null ? null : nextNewYearWindow(snapshot.today, tradition);
  return waitingOf(snapshot)
    .filter((s) => s.direction === 'in')
    .map((s): WaitingMoney => {
      const ask = moneyInAsk(
        {
          day: s.day,
          amount: s.amount,
          merchant: s.merchant,
          note: s.note,
          memo: s.memo,
          hint: s.moneyIn === 'refund' ? 'refund' : null,
        },
        {
          income: plan.income,
          cycle: snapshot.cycle,
          spends: [],
          owed,
          season: {
            window,
            jar:
              jar === null
                ? null
                : { id: jar.id, goal: jar.goal, held: snapshot.potSaved[jar.id] ?? 0 },
          },
        },
      );
      if (ask?.kind === 'pay' || ask?.kind === 'bonus') return { kind: ask.kind, name: null };
      if (ask?.kind === 'payback') return { kind: 'payback', name: ask.name ?? null };
      return { kind: 'other', name: null };
    });
}

/**
 * The ways that run by themselves (bank alerts, Wallet) and caught something in the catches
 * read: the day each last caught or was last seen running, and the bank its alerts came from.
 */
export function quietWaysOf(input: {
  readonly catches: readonly CatchSeen[];
  readonly lastAlert: { readonly day: LocalDate; readonly bank: string | null } | null;
  readonly ways: { readonly alert: boolean; readonly applePay: boolean };
  readonly memory: NotificationMemory;
}): QuietWayInput[] {
  const out: QuietWayInput[] = [];
  for (const way of WATCHED_WAYS) {
    if (!input.ways[way]) continue;
    const own = input.catches.filter((c) => c.source === way);
    const latest = own.reduce<CatchSeen | null>(
      (a, c) => (a === null || c.at > a.at ? c : a),
      null,
    );
    if (latest === null) continue;
    let last = latest.day;
    if (way === 'alert' && input.lastAlert && input.lastAlert.day > last) {
      last = input.lastAlert.day;
    }
    out.push({
      way,
      lastCatch: last,
      bank: way === 'alert' ? (input.lastAlert?.bank ?? receiptBankOf(latest.detail)) : null,
      told: input.memory.quietTold[way] ?? null,
    });
  }
  return out;
}

/** What payday's notification says, or null without a plan or with a payday that varies. */
export function paydayOf(snapshot: MoneySnapshot): PaydayPreview | null {
  const { plan } = snapshot;
  if (plan === null || plan.payday.kind === 'varies') return null;
  return paydayPreview({
    payday: snapshot.cycle.payday,
    rule: plan.payday,
    income: plan.income,
    futureYou: plan.futureYou,
    bills: snapshot.bills,
    pots: snapshot.pots,
    saved: snapshot.potSaved,
    currency: currencyOf(planCurrencyCode(plan)),
  });
}

/**
 * Whether this build has a year card to offer on 31 December: it has none, so that day's close
 * reminder carries whatever else the day has.
 */
const YEAR_CARD = false;

/** Everything to schedule now, worked out by the domain from the snapshot and the switches. */
export function plannedNotifications(input: {
  readonly now: Date;
  readonly snapshot: MoneySnapshot;
  readonly settings: NotificationSettings;
  readonly readyShown: ReadonlySet<string>;
  readonly tradition: LunarTradition | null;
  readonly quietWays: readonly QuietWayInput[];
}): PlannedNotification[] {
  const { snapshot, tradition } = input;
  const { plan } = snapshot;
  const seasonJar = newYearJarOf(snapshot.pots);
  const news: CloseNews = {
    jars: snapshot.pots.filter((p) => p.id !== FUTURE_YOU_POT_ID),
    saved: snapshot.potSaved,
    readyShown: input.readyShown,
    tradition,
    seasonJarId: seasonJar?.id ?? null,
    waiting: waitingMoneyOf(snapshot, tradition),
    yearCard: YEAR_CARD,
  };
  const people = owedByPerson(openOwedOf(snapshot).map(owedLineOf));
  const keyOf = new Map(people.flatMap((p) => p.lines.map((l) => [l.id, p] as const)));
  const owed = openOwedOf(snapshot).map((row) => {
    const person = keyOf.get(row.id);
    return {
      key: person?.key ?? `line:${row.id}`,
      name: person?.name ?? row.name,
      amount: row.amount,
      remindAt: row.remindAt,
    };
  });
  return planReminders({
    now: input.now,
    on: input.settings.on,
    closeAt: plan?.closeAt ?? null,
    closedDays: new Set(snapshot.closedDays.map((d) => d.day)),
    news,
    payday: plan === null || plan.payday.kind === 'varies' ? null : snapshot.cycle.payday,
    owed,
    quietWays: input.quietWays,
  });
}

/**
 * The memory after a rebuild: each way asked about keeps the time it is now set for; one no
 * longer set keeps only a time already past (it was asked about then).
 */
export function memoryAfter(
  memory: NotificationMemory,
  planned: readonly PlannedNotification[],
  now: Date,
): NotificationMemory {
  const quietTold: Record<string, string> = {};
  for (const [way, at] of Object.entries(memory.quietTold)) {
    if (new Date(at).getTime() <= now.getTime()) quietTold[way] = at;
  }
  for (const notice of planned) {
    if (notice.kind === 'capture') quietTold[notice.way] = notice.at.toISOString();
  }
  return { quietTold };
}
