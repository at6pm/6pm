import { useMemo, type ReactNode } from 'react';

import { diffDays, setAsideNamed, type DailyNumber, type LocalDate } from '@6pm/domain';

import type { MoneySnapshot } from '../../data/money-store';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { useOwed } from '../owed/use-owed';
import {
  coverRulerOf,
  incomePlanOf,
  paidTodayOf,
  type IncomePlanView,
} from '../plan/income-plan-view';
import { CoverRulerLine, NothingLandedHero, PaidTodayLine } from './landed-hero';
import { landingLine } from './landing-line';
import { TAKINGS_ROOM, TakingsLine, workTodayOf } from '../work/work-today';

/** The room the ruler, and the pay's line, add under Today's meter. */
const RULER_ROOM = 44;
const PAY_ROOM = 26;
/** Fewer days covered than this, and the companion says so, once, calmly. */
const LOW_DAYS = 7;
/** A landing this recent is still news. */
const NEWS_DAYS = 1;

const dateOf = (day: LocalDate) => new Date(`${day}T12:00:00`);

/** What Today adds for a plan that holds its incomes. */
export interface IncomeToday {
  readonly plan: IncomePlanView | null;
  /** In place of the number: no number is honest yet. */
  readonly empty: ReactNode;
  /** The one line under the meter: the ruler for money that lands, the pay on payday. */
  readonly under: { readonly node: ReactNode; readonly height: number } | null;
  /** "Money came in? I got paid": only while nothing has made a number. */
  readonly gotPaid: boolean;
  /** The companion's line for the day, when the money has one. */
  readonly say: string | null;
}

/**
 * Today for money that only lands and for a pay by the week: the empty hero before anything has
 * landed, the ruler of days covered after, "Paid today" on payday, and the companion's line.
 * A monthly salary gets nothing new here.
 */
export function useIncomeToday(snap: MoneySnapshot, day: DailyNumber): IncomeToday {
  const i18n = useI18n();
  const { t, weekdayDayShort } = i18n;
  const money = useMoneyFormat();
  const { people } = useOwed();
  const plan = useMemo(() => incomePlanOf(snap), [snap]);
  return useMemo((): IncomeToday => {
    // One line under the meter, never two: the ruler, then a seller's takings, then the pay.
    const work = workTodayOf(snap);
    const takings =
      work === null ? null : { node: <TakingsLine takings={work.takings} />, height: TAKINGS_ROOM };
    const none = { plan, empty: null, under: takings, gotPaid: false, say: null };
    if (plan === null) return none;
    if (plan.kind === 'pay') {
      const paid = paidTodayOf(snap, plan);
      return paid === null || takings !== null
        ? none
        : { ...none, under: { node: <PaidTodayLine next={paid.next} />, height: PAY_ROOM } };
    }
    const { view } = plan;
    // What work kept lands every closed day: news only when money came from someone.
    const landings = plan.landings.filter((l) => l.work !== true);
    // The ruler is for money that lands from others; a seller's own takings have their line.
    const lands = (snap.plan?.incomes ?? []).some((i) => i.amount <= 0 && i.fromWork !== true);
    // The oldest unpaid request: the person whose earliest open line is earliest.
    const firstDay = (p: (typeof people)[number]) =>
      p.lines.reduce((a, l) => (l.day < a ? l.day : a), p.lines[0]?.day ?? '');
    const oldest = people.reduce<(typeof people)[number] | null>(
      (a, p) => (a === null || firstDay(p) < firstDay(a) ? p : a),
      null,
    );
    const owes =
      oldest?.name != null
        ? ` ${t('companion.income.owes', { name: oldest.name, amount: money.short(oldest.total) })}`
        : '';
    if (view.state !== 'landed') {
      const next = view.nextNeed;
      const bill = next?.index == null ? undefined : snap.bills[next.index];
      return {
        plan,
        empty: (
          <NothingLandedHero
            short={view.state === 'short'}
            billsStillNeed={view.billsStillNeed}
            nextNeed={bill && next?.due ? { name: bill.name, due: next.due } : null}
          />
        ),
        under: null,
        gotPaid: true,
        say: t('companion.income.quiet'),
      };
    }
    const ruler = coverRulerOf(view);
    const latest = landings[landings.length - 1] ?? null;
    const since = latest === null ? null : diffDays(snap.today, latest.day);
    const to = ruler === null ? '' : weekdayDayShort(dateOf(ruler.to));
    const say =
      latest !== null && since !== null && since <= NEWS_DAYS
        ? landingLine(t, {
            name: latest.name || t('companion.income.someone'),
            amount: money.short(latest.amount),
            line: money.short(day.line),
            inHand: ruler?.inHand ?? 0,
            named: setAsideNamed(view),
          })
        : ruler !== null && ruler.covered < LOW_DAYS
          ? `${t('companion.income.low', { count: ruler.covered, date: to })}${owes}`
          : since !== null && since >= LOW_DAYS && ruler !== null
            ? `${t('companion.income.quietDays', { count: since, date: to })}${owes}`
            : null;
    return {
      plan,
      empty: null,
      under:
        ruler !== null && (lands || takings === null)
          ? { node: <CoverRulerLine today={snap.today} ruler={ruler} />, height: RULER_ROOM }
          : takings,
      gotPaid: false,
      say,
    };
  }, [plan, snap, day.line, people, t, weekdayDayShort, money]);
}
