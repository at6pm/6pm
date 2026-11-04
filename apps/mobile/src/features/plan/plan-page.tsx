import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useScrollOffset,
  type AnimatedRef,
  type SharedValue,
} from 'react-native-reanimated';

import { cycleMonth, type PlanSplit, type SplitPartKind } from '@6pm/domain';

import type { MoneySnapshot } from '../../data/money-store';
import { useMoney, useMoneyStore } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { useDesignInsets } from '../../ui/layout/design-insets';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { useHeaderMeasure, type HeaderShape } from '../home/header-measure';
import { useHomePageScroll } from '../home/home-scroll';
import { markPaydayShown, paydayShown } from './payday-shown';
import { usePlanFormat, type PlanFormat } from './plan-format';
import { planRoutes } from './plan-routes';
import { beforeEditable, billViews, planJarsOf, planSplitOf, type BillView } from './plan-view';
import { PotsPanel } from './pots-panel';
import { splitColours } from './split-colours';
import { SplitHero, type SplitWords } from './split-hero';
import { BillsPanel, MathsPanel, SplitPanel } from './split-panels';

/** Plan's header, for the sky to keep the look's art clear of it. */
const HEADER: HeaderShape = {
  parents: { eyebrow: 'block', row: 'block', title: 'row', button: 'row' },
  texts: ['eyebrow', 'title'],
  title: 'title',
  button: 'button',
  padRight: 6,
};

/** The jars fill and the Pots part pulses once the split has drawn in. */
const PAYDAY_AFTER_MS = 900;
/** Long enough for every jar to have filled; a Pots panel opened later shows them full. */
const FILL_LASTS_MS = 2000;

export interface PlanPageProps {
  readonly scrollRef: AnimatedRef<Animated.ScrollView>;
  /** Whether the Plan tab is the one on show; true when the shell does not say. */
  readonly active?: boolean;
}

/** Plan: the pay split into Bills, Pots and Free, the one number it leaves, and each part's detail. */
export function PlanPage({ scrollRef, active = true }: PlanPageProps) {
  const { top } = useDesignInsets();
  const snap = useMoney();
  // The page's own scroll offset, not the shared one the other tabs write.
  const y = useScrollOffset(scrollRef);
  const onScroll = useHomePageScroll('plan');
  return (
    <Animated.ScrollView
      ref={scrollRef}
      onScroll={onScroll}
      scrollEventThrottle={16}
      scrollsToTop={active}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: 'transparent' }}
      contentContainerStyle={{
        paddingTop: top(62),
        paddingHorizontal: 16,
        paddingBottom: 124,
        gap: 14,
      }}
    >
      {snap.plan ? <PlanContent snap={snap} y={y} active={active} /> : null}
    </Animated.ScrollView>
  );
}

/** The part open under the hero when Plan first shows: Pots the day after payday, else Free. */
const openingPart = (split: PlanSplit): SplitPartKind =>
  split.daysSincePayday <= 1 ? 'pots' : 'free';

function PlanContent({
  snap,
  y,
  active,
}: {
  readonly snap: MoneySnapshot;
  readonly y: SharedValue<number>;
  readonly active: boolean;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const router = useRouter();
  const { db } = useMoneyStore();
  const format = usePlanFormat(snap.today);
  const colours = splitColours(palette);
  const measure = useHeaderMeasure('plan', HEADER);
  const split = useMemo(() => planSplitOf(snap), [snap]);
  const bills = useMemo(() => billViews(snap), [snap]);
  const { jars, eachPayday } = useMemo(() => planJarsOf(snap), [snap]);
  const [selected, setSelected] = useState<SplitPartKind>(() =>
    split ? openingPart(split) : 'free',
  );
  const [grow, setGrow] = useState(0);
  const [payday, setPayday] = useState(0);
  const [filling, setFilling] = useState(false);
  const drawnFor = useRef<string | null>(null);
  const cycleStart = snap.cycle.start;
  const justPaid = split !== null && split.daysSincePayday <= 1;
  const filled = jars.some((j) => j.setAside > 0);

  // The split draws in the first time Plan is on show, and again when a new cycle starts.
  useEffect(() => {
    if (!active || drawnFor.current === cycleStart) return;
    drawnFor.current = cycleStart;
    setGrow((g) => g + 1);
    if (split) setSelected(openingPart(split));
  }, [active, cycleStart, split]);

  // The first open after payday: the Pots part pulses gold and the jars fill, once per payday.
  useEffect(() => {
    if (!active || !justPaid || !filled) return undefined;
    let live = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    void paydayShown(db, cycleStart).then((shown) => {
      if (!live || shown) return;
      void markPaydayShown(db, cycleStart);
      timer = setTimeout(() => {
        setPayday((p) => p + 1);
        setFilling(true);
        haptics.success();
        timer = setTimeout(() => setFilling(false), FILL_LASTS_MS);
      }, PAYDAY_AFTER_MS);
    });
    return () => {
      live = false;
      if (timer) clearTimeout(timer);
    };
  }, [active, justPaid, filled, db, cycleStart]);

  // The header drifts down at a third of the scroll and is gone by 70 pt, as in the prototype.
  const header = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, 1 - y.value / 70)),
    transform: [{ translateY: Math.min(y.value, 80) * 0.3 }],
  }));
  if (!split) return null;
  const words = splitWords(split, bills, snap, format, t, (amount) => money.short(amount));
  const panel = selected === 'bills' || selected === 'pots' ? selected : 'free';
  const paidCount = bills.filter((b) => b.paid).length;

  return (
    <>
      <Animated.View
        onLayout={measure.layout('block')}
        style={[{ paddingHorizontal: 6, gap: 2 }, header]}
      >
        <Text
          onLayout={measure.layout('eyebrow')}
          onTextLayout={measure.lines('eyebrow')}
          style={{ ...body(13, 600, 0.06), textTransform: 'uppercase', color: palette.inkSoft }}
        >
          {kickerOf(split, snap, format, t)}
        </Text>
        <View
          onLayout={measure.layout('row')}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Text
            accessibilityRole="header"
            onLayout={measure.layout('title')}
            onTextLayout={measure.lines('title')}
            style={{ ...body(34, 700, -0.03), color: palette.ink }}
          >
            {t('potsPlan.title')}
          </Text>
          <PressScale
            onLayout={measure.layout('button')}
            accessibilityRole="button"
            accessibilityLabel={t('potsPlan.tune')}
            hitSlop={4}
            onPress={() => {
              haptics.tap();
              router.push(planRoutes.month);
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: palette.glass,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Symbol name="tune" size={20} color={palette.ink} />
          </PressScale>
        </View>
      </Animated.View>

      <SplitHero
        split={split}
        bills={bills}
        jars={jars}
        words={words}
        colours={colours}
        selected={selected}
        onSelect={(kind) => {
          // "Before" is the answer to "spent since payday": tapping it changes it while the
          // joined cycle lasts (M2a), with Today's maths open underneath.
          if (kind === 'before' && beforeEditable(snap)) {
            haptics.tap();
            setSelected('free');
            router.push(planRoutes.sincePayday);
            return;
          }
          if (kind === selected) return;
          haptics.tap();
          setSelected(kind);
        }}
        grow={grow}
        pulse={payday}
      />

      {panel === 'bills' ? (
        <SplitPanel
          key="bills"
          title={t('potsPlan.bills.title')}
          note={
            bills.length === 0
              ? t('potsPlan.bills.none')
              : paidCount === bills.length
                ? t('potsPlan.bills.allPaid')
                : t('potsPlan.bills.paidOf', { paid: paidCount, total: bills.length })
          }
        >
          <BillsPanel bills={bills} colours={colours} format={format} />
        </SplitPanel>
      ) : panel === 'pots' ? (
        <SplitPanel
          key="pots"
          title={t('potsPlan.pots.title')}
          note={t('potsPlan.pots.eachPayday', { amount: money.short(eachPayday) })}
        >
          <PotsPanel
            jars={jars}
            justPaid={justPaid}
            fill={filling ? payday : 0}
            first={split.first}
            colours={colours}
          />
        </SplitPanel>
      ) : (
        <SplitPanel key="free" title={t('potsPlan.maths.title')} note={words.daySub}>
          <MathsPanel
            split={split}
            colours={colours}
            onChangeBefore={
              beforeEditable(snap) ? () => router.push(planRoutes.sincePayday) : undefined
            }
          />
        </SplitPanel>
      )}
    </>
  );
}

type T = ReturnType<typeof useI18n>['t'];

function kickerOf(split: PlanSplit, snap: MoneySnapshot, format: PlanFormat, t: T): string {
  const month = format.monthLong(cycleMonth(snap.cycle));
  if (split.lastDay) return t('potsPlan.kickerTomorrow', { month });
  if (split.first) return t('potsPlan.kickerFirst', { month });
  return t('potsPlan.kicker', { month, payday: format.dayMonth(snap.cycle.payday) });
}

/** What the hero says: the pay, when it came, each part's label and amount, and the day. */
function splitWords(
  split: PlanSplit,
  bills: readonly BillView[],
  snap: MoneySnapshot,
  format: PlanFormat,
  t: T,
  short: (amount: number) => string,
): SplitWords {
  const left = split.maths.find((r) => r.kind === 'left')?.amount ?? split.free;
  const allPaid = bills.length > 0 && bills.every((b) => b.paid);
  const daySub = split.lastDay
    ? t('potsPlan.day.paydayTomorrow')
    : t('potsPlan.day.toPayday', { count: split.daysLeft });
  return {
    pay: t('potsPlan.pay'),
    payAmount: short(split.pay),
    paid:
      split.daysSincePayday === 0
        ? t('potsPlan.paidToday')
        : split.daysSincePayday === 1
          ? t('potsPlan.paidYesterday')
          : t('potsPlan.paidOn', { date: format.dayMonth(snap.cycle.start) }),
    label: {
      bills: t('potsPlan.part.bills'),
      pots: t('potsPlan.part.pots'),
      before: t('potsPlan.part.before'),
      free: t('potsPlan.part.free'),
      over: t('potsPlan.part.over'),
    },
    amount: {
      bills: split.lastDay && allPaid ? t('potsPlan.part.billsPaid') : short(split.bills),
      pots: split.overspent
        ? t('potsPlan.part.potsSafe')
        : split.lastDay
          ? t('potsPlan.part.potsTomorrow')
          : short(split.pots),
      before: short(split.before),
      free: split.lastDay
        ? t('potsPlan.part.freeLeft', { amount: short(left) })
        : short(split.free),
      over: short(split.over),
    },
    day: split.overspent
      ? t('potsPlan.day.usedUp')
      : t(split.lastDay ? 'potsPlan.day.today' : 'potsPlan.day.perDay', {
          amount: short(split.line),
        }),
    daySub,
  };
}
