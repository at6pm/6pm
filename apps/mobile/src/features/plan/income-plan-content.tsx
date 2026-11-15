import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { cycleMonth, diffDays, futureYouPotRow, parts, type SplitPartKind } from '@6pm/domain';

import type { MoneySnapshot } from '../../data/money-store';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { useTheme } from '../../ui/theme/theme';
import { ordinalDay } from '../onboarding/step-parts';
import { potsRoute } from '../pots/pot-routes';
import { OfferedChip } from '../sharing/offered-chip';
import {
  InHandPanel,
  landedLines,
  MathsSlip,
  nthOf,
  PanelLink,
  StillToSetAside,
  StretchBillsPanel,
  stretchLines,
} from './income-panels';
import {
  landedNeedOf,
  type IncomePlanView,
  type LandedPlanView,
  type PayPlanView,
} from './income-plan-view';
import { PanelSwitch, type PanelKind } from './panel-switch';
import { PlanHeader } from './plan-header';
import { usePlanFormat, type PlanFormat } from './plan-format';
import { planRoutes } from './plan-routes';
import { billViews, planJarsOf } from './plan-view';
import { PotsPanel } from './pots-panel';
import { splitColours } from './split-colours';
import { SplitHero, type HeroPart, type HeroSplit, type SplitWords } from './split-hero';
import { BillsPanel, SplitPanel } from './split-panels';

type T = ReturnType<typeof useI18n>['t'];
type Short = (amount: number) => string;

/** What the hero draws and says, and the extras it carries. */
interface Hero {
  readonly kicker: string;
  readonly split: HeroSplit;
  readonly words: SplitWords;
  readonly note: string | null;
  readonly gap: { readonly share: number; readonly label: string } | null;
  readonly inHand: { readonly days: number; readonly fresh: number } | null;
}

const LABELS = (t: T): SplitWords['label'] => ({
  bills: t('potsPlan.part.bills'),
  pots: t('potsPlan.part.pots'),
  before: t('potsPlan.part.before'),
  free: t('potsPlan.part.free'),
  over: t('potsPlan.part.over'),
  inHand: t('income.part.inHand'),
});

/** Future you's jar as a row: its icon and hue mark Future you and the jars still to set aside. */
const FUTURE_YOU_JAR = futureYouPotRow('');

const NO_AMOUNTS: SplitWords['amount'] = {
  bills: '',
  pots: '',
  before: '',
  free: '',
  over: '',
  inHand: '',
};

/** The hero for a pay: this pay, its slices and what it frees, over the days to the next. */
function payHero(view: PayPlanView, snap: MoneySnapshot, f: PlanFormat, t: T, short: Short): Hero {
  const { stretch, day } = view;
  const month = f.monthLong(cycleMonth(snap.cycle));
  const weekly = stretch.base === 4;
  const sinceDays = diffDays(snap.today, stretch.payOn);
  const parts: HeroPart[] = [
    ...(stretch.whole
      ? []
      : [
          { kind: 'bills' as const, amount: stretch.billSlice },
          { kind: 'pots' as const, amount: stretch.jarSlice },
        ]),
    { kind: 'free', amount: Math.max(0, stretch.free) },
    ...(view.inHand > 0 ? [{ kind: 'inHand' as const, amount: view.inHand }] : []),
  ];
  const gap = stretch.bills.reduce((sum, b) => sum + b.gap, 0);
  return {
    kicker: stretch.extra
      ? weekly
        ? t('income.kicker.nth', {
            month,
            nth: nthOf(t, stretch.ofMonth),
            weekday: f.weekdayName(stretch.payOn),
          })
        : t('income.kicker.extra', { month })
      : t('income.kicker.nextPay', { month, date: f.dayAhead(stretch.next) }),
    split: {
      parts,
      days: view.days,
      dayRow: true,
      lastDay: false,
      daysSincePayday: sinceDays,
      overspent: day.overspent,
    },
    words: {
      pay: t('income.thisPay'),
      payAmount: short(stretch.pay),
      paid: stretch.extra
        ? f.dayAheadMonth(stretch.payOn)
        : sinceDays === 0
          ? t('potsPlan.paidToday')
          : sinceDays === 1
            ? t('potsPlan.paidYesterday')
            : t('potsPlan.paidOn', { date: f.dayMonth(stretch.payOn) }),
      label: LABELS(t),
      amount: {
        ...NO_AMOUNTS,
        bills: short(stretch.billSlice),
        pots: short(stretch.jarSlice),
        free: short(Math.max(0, stretch.free)),
        inHand: short(view.inHand),
      },
      day: day.overspent
        ? t('potsPlan.day.usedUp')
        : t('potsPlan.day.perDay', { amount: short(day.line) }),
      daySub: stretch.waiting
        ? t('income.day.whileWaiting')
        : stretch.extra
          ? t('income.day.asAnyPay', { weekday: f.weekdayName(stretch.payOn) })
          : t('income.day.to', { date: f.dayAhead(stretch.next) }),
    },
    note: stretch.whole ? t('income.whole', { month }) : null,
    gap:
      gap > 0 && stretch.billSlice > 0
        ? { share: gap / stretch.billSlice, label: t('income.bills.gap', { amount: short(gap) }) }
        : null,
    inHand:
      view.inHand > 0
        ? {
            days: view.inHandDays,
            fresh: day.line > 0 ? Math.floor(view.inHandNew / day.line) : 0,
          }
        : null,
  };
}

/** The kicker for money that lands: the month, and the day it lasts to. */
function lastsKicker(
  view: LandedPlanView,
  snap: MoneySnapshot,
  f: PlanFormat,
  i18n: ReturnType<typeof useI18n>,
) {
  const month = f.monthLong(cycleMonth(snap.cycle));
  const on = view.view.on;
  return on.slice(0, 7) === snap.today.slice(0, 7)
    ? i18n.t('income.kicker.lastsTo', { month, day: ordinalDay(i18n, parts(on).day) })
    : i18n.t('income.kicker.lastsToDate', { month, date: f.dayMonthShort(on) });
}

/** The hero for money that lands: drawn empty in the order money will fill it, or as days. */
function landedHero(
  view: LandedPlanView,
  snap: MoneySnapshot,
  f: PlanFormat,
  i18n: ReturnType<typeof useI18n>,
  short: Short,
): Hero {
  const { t } = i18n;
  const v = view.view;
  const kicker = lastsKicker(view, snap, f, i18n);
  const base = { lastDay: false, daysSincePayday: 1, overspent: false };
  if (v.state !== 'landed') {
    const billsTotal = v.items.filter((i) => i.kind === 'bill').reduce((s, i) => s + i.amount, 0);
    const jarsTotal = v.items.filter((i) => i.kind !== 'bill').reduce((s, i) => s + i.amount, 0);
    return {
      kicker,
      split: {
        ...base,
        days: [],
        // Drawn in the order money will fill it; a part with nothing to set aside is left out.
        parts: [
          ...(billsTotal > 0 ? [{ kind: 'bills' as const, amount: billsTotal, dashed: true }] : []),
          ...(jarsTotal > 0 ? [{ kind: 'pots' as const, amount: jarsTotal, dashed: true }] : []),
          { kind: 'free', amount: Math.max(billsTotal, jarsTotal, 1), dashed: true },
        ],
      },
      words: {
        pay: t('income.landed.label'),
        payAmount: v.state === 'empty' ? t('income.landed.nothingYet') : short(v.landed + v.inHand),
        paid:
          v.state === 'empty'
            ? f.dayAheadMonth(snap.today)
            : t('income.landed.count', { count: v.landings }),
        label: LABELS(t),
        amount: {
          ...NO_AMOUNTS,
          bills: short(billsTotal),
          pots: short(jarsTotal),
          free: t('income.part.theRest'),
        },
        ...emptyWords(v, t, short),
      },
      note: null,
      gap: null,
      inHand: null,
    };
  }
  const to = f.dayMonthShort(v.on);
  return {
    kicker,
    split: {
      ...base,
      days: view.days,
      parts: [
        // The coming months' bills and jars the days reach are kept with this month's.
        { kind: 'bills', amount: v.bills + v.ahead - v.aheadJars },
        { kind: 'pots', amount: v.jars + v.aheadJars },
        // What pays no whole day in hand stays with the free money.
        { kind: 'free', amount: v.atLine + v.leftOver },
        ...(v.beyond > 0 ? [{ kind: 'inHand' as const, amount: v.beyond }] : []),
      ],
    },
    words: {
      pay: t('income.landed.label'),
      payAmount: short(v.landed),
      paid: t('income.landed.count', { count: v.landings }),
      label: LABELS(t),
      amount: {
        ...NO_AMOUNTS,
        bills: short(v.bills + v.ahead - v.aheadJars),
        pots: short(v.jars + v.aheadJars),
        free: short(v.atLine + v.leftOver),
        inHand: short(v.beyond),
      },
      day: t('potsPlan.day.perDay', { amount: short(v.line) }),
      daySub:
        v.inHandDays > 0
          ? t('income.landed.toThenInHand', { date: to, count: v.inHandDays })
          : t('income.day.to', { date: to }),
    },
    note: null,
    gap: null,
    inHand: v.beyond > 0 ? { days: v.inHandDays, fresh: v.inHandDays } : null,
  };
}

/**
 * What the hero says before the bills and jars are set aside: what is still needed first (bills,
 * else Future you or the jars), then what comes after; with nothing to set aside, that it is all
 * for the days.
 */
function emptyWords(
  v: LandedPlanView['view'],
  t: T,
  short: Short,
): Pick<SplitWords, 'day' | 'daySub'> {
  const need = landedNeedOf(v);
  switch (need.kind) {
    case 'bills':
      return {
        day:
          v.state === 'empty'
            ? t('income.landed.billsNeed', { amount: short(need.amount) })
            : t('income.landed.billsStillNeed', { amount: short(need.amount) }),
        daySub: need.thenFutureYou ? t('income.landed.thenDays') : t('income.landed.thenDaysOnly'),
      };
    case 'futureYou':
      return {
        day: t('income.landed.futureYouNeeds', { amount: short(need.amount) }),
        daySub: t('income.landed.thenDaysOnly'),
      };
    case 'jars':
      return {
        day: t('income.landed.jarsNeed', { amount: short(need.amount) }),
        daySub: t('income.landed.thenDaysOnly'),
      };
    case 'none':
      return { day: t('income.landed.allYours'), daySub: t('income.landed.nothingToSetAside') };
  }
}

/**
 * Plan for a plan that holds its incomes: paid by the week or the fortnight, the hero is this pay
 * (its slices, what it frees, In hand); for money that only lands, the split drawn empty until
 * something lands, then the landing as days. The month's own split is left to a monthly salary.
 */
export function IncomePlanContent({
  snap,
  view,
  y,
  active,
}: {
  readonly snap: MoneySnapshot;
  readonly view: IncomePlanView;
  readonly y: SharedValue<number>;
  readonly active: boolean;
}) {
  const { palette } = useTheme();
  const i18n = useI18n();
  const { t } = i18n;
  const money = useMoneyFormat();
  const router = useRouter();
  const format = usePlanFormat(snap.today);
  const colours = splitColours(palette);
  const bills = useMemo(() => billViews(snap), [snap]);
  const { jars, eachPayday } = useMemo(() => planJarsOf(snap), [snap]);
  const [selected, setSelected] = useState<PanelKind>('free');
  const [grow, setGrow] = useState(0);
  // The split draws in when Plan is first on show, and again with each new pay or landing.
  const drawKey =
    view.kind === 'pay' ? view.stretch.payOn : `${view.view.state}:${view.view.landings}`;
  const [drawn, setDrawn] = useState<string | null>(null);
  useEffect(() => {
    if (!active || drawn === drawKey) return;
    setDrawn(drawKey);
    setGrow((g) => g + 1);
  }, [active, drawKey, drawn]);

  const short = (amount: number) => money.short(amount);
  // The slip's figures in full, a minus sign where a row takes away.
  const signed = (amount: number) => `${amount < 0 ? '−' : ''}${money.number(Math.abs(amount))}`;
  const hero =
    view.kind === 'pay'
      ? payHero(view, snap, format, t, short)
      : landedHero(view, snap, format, i18n, short);
  const shownKinds = new Set<SplitPartKind>(hero.split.parts.map((p) => p.kind));
  const panel: PanelKind = selected !== 'free' && shownKinds.has(selected) ? selected : 'free';

  return (
    <>
      <PlanHeader kicker={hero.kicker} y={y} />
      <SplitHero
        split={hero.split}
        bills={bills}
        jars={jars}
        words={hero.words}
        colours={colours}
        selected={panel}
        onSelect={(kind) => {
          if (kind === panel || kind === 'before' || kind === 'over') return;
          haptics.tap();
          setSelected(kind);
        }}
        grow={grow}
        pulse={0}
        note={hero.note}
        gap={hero.gap}
        inHand={hero.inHand}
      />
      <PanelSwitch active={panel} grow={grow}>
        {(kind) => (view.kind === 'pay' ? payPanel(kind, view) : landedPanel(kind, view))}
      </PanelSwitch>
    </>
  );

  /** A pay's panels: its bills' slices, the jars, In hand, and Today's maths. */
  function payPanel(kind: PanelKind, pay: PayPlanView) {
    const s = snap;
    const f = format;
    const { stretch } = pay;
    if (kind === 'bills') {
      const gapBill = stretch.bills.find((b) => b.gap > 0);
      const gapRow = gapBill ? s.bills[gapBill.index] : undefined;
      const gapNote =
        gapBill && gapRow
          ? t(stretch.joinedGap ? 'income.bills.gapJoined' : 'income.bills.gapShort', {
              name: gapRow.name,
              weekday: f.weekdayName(stretch.next),
              amount: short(gapBill.usual),
            })
          : null;
      return (
        <SplitPanel
          title={t('potsPlan.bills.title')}
          note={t('income.bills.thisPay', { amount: short(stretch.billSlice) })}
        >
          <StretchBillsPanel
            bills={stretch.bills}
            rows={s.bills}
            colours={colours}
            gapNote={gapNote}
            dueOf={(b) =>
              b.whole
                ? t('income.bills.whole', { date: f.dayAhead(b.due) })
                : t('income.bills.slice', { nth: nthOf(t, b.count), date: f.dayAhead(b.due) })
            }
          />
        </SplitPanel>
      );
    }
    if (kind === 'pots') {
      return (
        <SplitPanel
          title={t('potsPlan.pots.title')}
          note={t('potsPlan.pots.eachPayday', { amount: short(eachPayday) })}
        >
          <PotsPanel jars={jars} justPaid={false} fill={0} colours={colours} />
        </SplitPanel>
      );
    }
    if (kind === 'inHand') {
      return (
        <SplitPanel
          title={t('income.part.inHand')}
          note={t('income.inHand.note', { amount: short(pay.inHand), count: pay.inHandDays })}
        >
          <InHandPanel
            days={pay.inHandDays}
            fresh={pay.day.line > 0 ? Math.floor(pay.inHandNew / pay.day.line) : 0}
            text={
              pay.inHandNew > 0
                ? t('income.inHand.extraPay', {
                    base: stretch.base,
                    amount: short(pay.inHandNew),
                    count: pay.inHandDays,
                  })
                : t('income.inHand.month', { count: pay.inHandDays })
            }
            onMove={() => router.push(potsRoute)}
            footer={
              // The day a pay beyond the count lands, the fifth Friday is offered (once).
              stretch.extra && stretch.payOn === snap.today ? (
                <OfferedChip
                  moments={[`fifth:${stretch.payOn}`]}
                  card="fifth"
                  of={stretch.payOn}
                  size="small"
                  label={t('shareCards.chip')}
                />
              ) : null
            }
          />
        </SplitPanel>
      );
    }
    return (
      <SplitPanel title={t('potsPlan.maths.title')} note={f.dayAheadMonth(s.today)}>
        <MathsSlip
          colours={colours}
          lines={stretchLines(pay.rows, {
            t,
            full: signed,
            billName: (index) => s.bills[index]?.name ?? '',
            weekly: stretch.base === 4,
            payWeekday: f.weekdayName(stretch.payOn),
            next: f.dayAhead(stretch.next),
          })}
        />
      </SplitPanel>
    );
  }

  /** Money that lands, its panels: what is still to set aside, or the maths and "Make it last until". */
  function landedPanel(kind: PanelKind, landed: LandedPlanView) {
    const s = snap;
    const f = format;
    const v = landed.view;
    if (kind === 'bills') {
      return (
        <SplitPanel title={t('potsPlan.bills.title')} note={short(v.bills)}>
          <BillsPanel bills={bills} colours={colours} format={f} />
        </SplitPanel>
      );
    }
    if (kind === 'pots') {
      return (
        <SplitPanel title={t('potsPlan.pots.title')} note={short(v.jars)}>
          <PotsPanel jars={jars} justPaid={false} fill={0} colours={colours} />
        </SplitPanel>
      );
    }
    if (kind === 'inHand') {
      return (
        <SplitPanel
          title={t('income.part.inHand')}
          note={t('income.inHand.note', { amount: short(v.beyond), count: v.inHandDays })}
        >
          <InHandPanel
            days={v.inHandDays}
            fresh={v.inHandDays}
            text={t('income.inHand.landed', { date: f.dayMonthShort(v.on), count: v.inHandDays })}
            onMove={null}
          />
        </SplitPanel>
      );
    }
    if (v.state !== 'landed' && v.items.length === 0) {
      // Nothing to set aside: no "0 of 0", only the day the money lasts to.
      return <View style={{ marginHorizontal: 16, marginBottom: 12 }}>{lastUntilLink()}</View>;
    }
    if (v.state !== 'landed') {
      const done = v.items.filter((i) => i.covered >= i.amount).length;
      return (
        <SplitPanel
          title={t('income.stillToSetAside')}
          note={t('income.stillOf', { done, total: v.items.length })}
        >
          <StillToSetAside
            items={v.items}
            name={(item) =>
              item.kind === 'bill'
                ? (s.bills[item.index ?? 0]?.name ?? '')
                : item.kind === 'futureYou'
                  ? t('pots.futureYou')
                  : t('income.otherJars')
            }
            icon={(item) => {
              const bill = item.kind === 'bill' ? s.bills[item.index ?? 0] : undefined;
              const jar = bill ?? FUTURE_YOU_JAR;
              return { name: jar.icon, hue: jar.hue };
            }}
            sub={(item) =>
              item.due !== null
                ? t('income.dueOn', { date: f.dayAheadMonth(item.due) })
                : t('income.thisMonth')
            }
          />
        </SplitPanel>
      );
    }
    return (
      <SplitPanel title={t('potsPlan.maths.title')} note={f.dayAheadMonth(s.today)}>
        <MathsSlip
          colours={colours}
          lines={landedLines(landed.rows, {
            t,
            full: signed,
            landingName: (index) =>
              landed.landings[index]?.work
                ? t('work.landing')
                : (landed.landings[index]?.name ?? ''),
            futureYouOnly: v.items.every((i) => i.kind !== 'jars'),
            on: f.dayMonthShort(v.on),
            line: money.number(v.line),
            date: (day) => f.dayMonthShort(day),
          })}
        />
        <View style={{ marginHorizontal: 16, marginBottom: 12 }}>{lastUntilLink()}</View>
      </SplitPanel>
    );
  }

  /** "Make it last until", and the day the money lasts to now. */
  function lastUntilLink() {
    const until = snap.plan?.lastUntil ?? null;
    return (
      <PanelLink
        icon="date_range"
        label={t('onboarding.landed.lastUntil')}
        value={
          until === null || until < snap.today
            ? t('income.until.endOf', { month: format.monthLong(cycleMonth(snap.cycle)) })
            : format.dayMonthShort(until)
        }
        onPress={() => router.push(planRoutes.lastUntil)}
      />
    );
  }
}
