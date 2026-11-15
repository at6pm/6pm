import { useEffect, useMemo, useState } from 'react';

import {
  bankWorkOf,
  futureYouIn,
  joinedCycle,
  landingDays,
  lastMoneyIn,
  merchantKeyOf,
  occasionsOf,
  rememberedSenders,
  typedMoneyIn,
  workMarkOf,
  type LandingDays,
  type MerchantRuleRow,
  type SpendRow,
  type TypedMoneyIn,
} from '@6pm/domain';

import { dayOf, periodOf, type MoneySnapshot } from '../../data/money-store';
import { useMoney, useMoneyActions, useMoneyStore } from '../../data/money-provider';
import { joinedAnswersOf } from '../../data/plan-settings';
import { rememberWork } from '../../data/work-actions';
import { workOf } from '../../data/work-money';
import { useI18n } from '../../i18n/i18n';
import { jarName } from '../pots/jar-name';
import { coveredDate } from './ticket-stamp';

/**
 * Days money that lands adds, for someone whose money only lands and whose day is at its cap
 * (`landingDays`): null for everyone else, and for money that is saved rather than spread.
 */
function landingOf(snap: MoneySnapshot, amount: number, place: TypedMoneyIn): LandingDays | null {
  const { plan } = snap;
  if (plan === null || amount <= 0) return null;
  const period = periodOf(snap);
  const day = dayOf(snap);
  if (period === null || day === null || period.kind !== 'landed') return null;
  const landed = (id: string) => (plan.incomes ?? []).some((i) => i.id === id && i.amount <= 0);
  const adds = place.moneyIn === 'spread' || (place.moneyIn === 'pay' && landed(place.incomeId));
  if (!adds) return null;
  const joined = joinedCycle(snap.cycle, joinedAnswersOf(plan));
  return landingDays({
    day: snap.today,
    pool: day.startFree,
    line: day.line,
    cycle: snap.cycle,
    anchor: plan.payday,
    bills: snap.bills,
    jars: futureYouIn(plan.futureYou, joined) + occasionsOf(snap.pots, snap.setAsideThisCycle),
    amount,
    cap: period.cap,
  });
}

/**
 * Quick add's "Got paid" face: the senders "Who from" offers, the one on the ticket if 6pm knows
 * them, where their money goes (`typedMoneyIn`) and what it adds, and Keep it, which writes the
 * money in and places it at once: as last time for a sender 6pm knows, as a counted income's pay
 * when it looks like one, and otherwise spread over the days.
 */
export function useMoneyInFace({
  rules,
  sender,
  amount,
  wallet,
  pay = null,
}: {
  readonly rules: readonly MerchantRuleRow[];
  readonly sender: string;
  readonly amount: number;
  /** The bank or wallet it came into, whose answer says whether it is work. */
  readonly wallet: string;
  /** The income the close was told this is the pay of ("It landed"). */
  readonly pay?: string | null;
}) {
  const snap = useMoney();
  const store = useMoneyStore();
  const actions = useMoneyActions();
  const { t, language } = useI18n();
  const [lastIn, setLastIn] = useState<ReadonlyMap<string, string>>(new Map());
  useEffect(() => {
    let live = true;
    store.db
      .getAllAsync<{ merchant: string; at: string }>(
        "SELECT merchant, MAX(at) AS at FROM spends WHERE direction = 'in' GROUP BY merchant",
        [],
      )
      .then((rows) => live && setLastIn(lastMoneyIn(rows)))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [store]);

  const { plan } = snap;
  const senders = useMemo(
    () =>
      rememberedSenders(rules, lastIn, {
        jars: new Set(snap.pots.filter((p) => p.archivedAt === null).map((p) => p.id)),
        incomes: new Set((plan?.incomes ?? []).map((i) => i.id)),
      }),
    [rules, lastIn, snap.pots, plan],
  );
  const key = merchantKeyOf(sender);
  const known = key === '' ? null : (senders.find((s) => s.merchantKey === key) ?? null);
  // A landing, for someone whose money only lands, is decided there too (`incomeMatchOf`).
  const place = typedMoneyIn(
    { day: snap.today, amount },
    {
      remembered: known?.place ?? null,
      incomes: plan?.incomes,
      anchor: plan?.payday ?? { kind: 'sameDay', day: 1 },
      expected: pay,
    },
  );
  // Work of one's own: the WORK stamp, offered or inked as its bank and sender say, tapped to change.
  const work = workOf(snap);
  const [stampedByHand, setStamped] = useState<{
    readonly key: string;
    readonly on: boolean;
  } | null>(null);
  const mark = workMarkOf({ work, wallet, rule: rules.find((r) => r.merchantKey === key) });
  const stamped =
    work === null || (mark === 'none' && stampedByHand?.key !== key)
      ? null
      : stampedByHand?.key === key
        ? stampedByHand.on
        : mark === 'inked';
  const landedIds = new Set((plan?.incomes ?? []).filter((i) => i.amount <= 0).map((i) => i.id));
  const landing = landingOf(snap, amount, place);
  const jar = place.moneyIn === 'saved' ? snap.pots.find((p) => p.id === place.savedTo) : undefined;
  // A landing goes into the days (after the bills), as 4a says it; only a counted pay is "your pay".
  const intoDays = place.moneyIn === 'pay' && landedIds.has(place.incomeId);
  const placeLine =
    place.moneyIn === 'pay' && !intoDays
      ? t(place.asLastTime ? 'quick.in.payLast' : 'quick.in.pay')
      : place.moneyIn === 'saved'
        ? t('quick.in.jarLast', { jar: jar ? jarName(jar, t) : '' })
        : t(place.asLastTime ? 'quick.in.daysLast' : 'quick.in.days');

  /** Writes the money in and places it; returns its id. */
  const keep = async (entry: {
    readonly categoryId: string;
    readonly wallet: string;
    readonly foreignAmount: SpendRow['foreignAmount'];
  }): Promise<string> => {
    const rule = known ? rules.find((r) => r.merchantKey === known.merchantKey) : undefined;
    const categoryId =
      rule && snap.categories.some((c) => c.id === rule.categoryId)
        ? rule.categoryId
        : entry.categoryId;
    // Stamped as work, it is today's takings: kept as they are, for the close to count.
    const takings = stamped === true;
    const row = await actions.addSpend({
      amount,
      categoryId,
      merchant: sender.trim(),
      source: 'manual',
      status: takings ? 'kept' : 'caught',
      wallet: entry.wallet,
      foreignAmount: entry.foreignAmount,
      direction: 'in',
    });
    if (work !== null) {
      if (takings) await actions.markForWork(row.id, true);
      if (stamped !== null && bankWorkOf(entry.wallet, work.banks) !== 'always') {
        await rememberWork(store, { merchant: sender, categoryId }, takings);
      }
      if (takings) return row.id;
    }
    if (place.moneyIn === 'pay') {
      const income = plan?.incomes?.find((i) => i.id === place.incomeId);
      await actions.keepPay(row.id, { amount: income?.amount ?? 0, incomeId: place.incomeId });
    } else {
      await actions.placeMoneyIn(
        row.id,
        place.moneyIn === 'saved'
          ? { moneyIn: 'saved', savedTo: place.savedTo }
          : { moneyIn: 'spread' },
      );
    }
    // Someone without work keeps today's behaviour: a sender remembered as work stays marked.
    if (work === null && known?.work === true) await actions.markForWork(row.id, true);
    return row.id;
  };

  return {
    senders,
    known,
    /** The WORK stamp: inked, offered (false), or not offered at all (null). */
    stamped,
    toggleStamp: () => setStamped({ key, on: stamped !== true }),
    place,
    placeLine,
    landingLine: landing
      ? t('quick.in.landing', { count: landing.days, date: coveredDate(landing.to, language) })
      : null,
    keep,
  };
}
