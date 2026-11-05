import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  ReduceMotion,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import {
  cycleFutureYou,
  cycleMonth,
  futureYouResume,
  jarsEachPayday,
  potMonthsLeft,
  whatIfRange,
} from '@6pm/domain';
import { curves, durations } from '@6pm/theme';

import { readJarHistory, type JarHistoryEntry } from '../../data/jar-history';
import { useMoney, useMoneyActions, useMoneyStore } from '../../data/money-provider';
import { dailyInputOf, dayOf } from '../../data/money-store';
import { usePlanActions, type RemovedTopUp } from '../../data/plan-actions';
import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { useDesignInsets } from '../../ui/layout/design-insets';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { useOfferUndo } from '../../ui/undo/undo-host';
import { useRunAction } from '../companion/use-run-action';
import { AmountKeypadSheet } from '../quick-add/amount-keypad-sheet';
import { JarHero } from './jar-hero';
import { setJarAway, takeFlightSource } from './jar-flight';
import { JarActions, JarMoves } from './jar-page-parts';
import { useJarFormat } from './jar-words';
import { JarWhatIf } from './jar-what-if';
import { editJarRoute } from './pot-routes';
import { useJars } from './use-jars';

const enter = Easing.bezier(...curves.enter);
const PAGE_JAR_W = 140;

/**
 * A jar's page (Pots canvas, B): a full page over the sky, the jar growing out of the one tapped
 * on the shelf (52 × 66 → 140 × 184 on the entrance curve in 420 ms) and back into it on leaving.
 * What it holds and takes each payday beside it, Future you's what-if under it, then Add, Spend
 * from it and Edit, and the jar's moves.
 */
export function JarPage({
  id,
  offerAfterLeaving,
}: {
  readonly id: string;
  /** The undo for putting the jar away, shown once the page has gone. */
  readonly offerAfterLeaving: ReturnType<typeof useOfferUndo>;
}) {
  const router = useRouter();
  const { palette } = useTheme();
  const { t } = useI18n();
  const snap = useMoney();
  const store = useMoneyStore();
  const actions = usePlanActions();
  const money = useMoneyActions();
  const run = useRunAction();
  const offerUndo = useOfferUndo();
  const format = useJarFormat();
  const { top, bottom } = useDesignInsets();
  const jars = useJars();
  const jar = jars.own.find((j) => j.id === id) ?? null;

  // The flight: 0 is the jar where it was tapped (and the page not yet there), 1 the page.
  const [from] = useState(() => takeFlightSource(id));
  const shown = useSharedValue(0);
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const ready = useSharedValue(from === null ? 1 : 0);
  const startScale = from === null ? 0.92 : from.width / PAGE_JAR_W;
  const leaving = useRef(false);
  const timing = { duration: durations.jarOpen, easing: enter, reduceMotion: ReduceMotion.System };
  const jarView = useRef<ComponentRef<typeof View>>(null);
  const placeJar = () => {
    if (ready.value === 1 && from !== null) return;
    if (from === null) {
      shown.value = withTiming(1, timing);
      return;
    }
    jarView.current?.measureInWindow((x, y, w, h) => {
      dx.value = from.x + from.width / 2 - (x + w / 2);
      dy.value = from.y + from.height / 2 - (y + h / 2);
      ready.value = 1;
      setJarAway(id);
      shown.value = withTiming(1, timing);
    });
  };
  const leave = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    // Landed back on the jar tapped: that one shows again under it, then the page goes.
    const back = () => {
      setJarAway(null);
      router.back();
    };
    shown.value = withTiming(0, timing, (done) => {
      if (done) scheduleOnRN(back);
    });
  }, [router, shown]);

  // However the page goes, the jar it grew from is never left hidden.
  useEffect(() => () => setJarAway(null), []);

  // The jar is gone (deleted elsewhere, or put away here): nothing left to show.
  useEffect(() => {
    if (jar === null && !leaving.current) {
      leaving.current = true;
      router.back();
    }
  }, [jar, router]);

  const sky = useAnimatedStyle(() => ({ opacity: shown.value }));
  const content = useAnimatedStyle(() => ({
    opacity: interpolate(shown.value, [0.3, 1], [0, 1], 'clamp'),
    transform: [{ translateY: interpolate(shown.value, [0, 1], [14, 0]) }],
  }));
  const flight = useAnimatedStyle(() => ({
    opacity: ready.value,
    transform: [
      { translateX: dx.value * (1 - shown.value) },
      { translateY: dy.value * (1 - shown.value) },
      { scale: startScale + (1 - startScale) * shown.value },
    ],
  }));

  // A swipe from the left edge takes the page away, as a pushed page goes.
  const drag = useSharedValue(0);
  const swipe = Gesture.Pan()
    .hitSlop({ left: 0, width: 28 })
    .activeOffsetX(10)
    .failOffsetY([-14, 14])
    .onUpdate((e) => {
      drag.value = Math.max(0, e.translationX);
    })
    .onEnd((e) => {
      if (e.translationX > 90 || e.velocityX > 700) scheduleOnRN(leave);
      drag.value = withTiming(0, { duration: 300, easing: enter });
    });
  const dragged = useAnimatedStyle(() => ({ transform: [{ translateX: drag.value }] }));

  // Future you's what-if: the slice under the thumb, from 0 to M5's range, set when it opened.
  const input = dailyInputOf(snap);
  const committed = snap.plan?.futureYou ?? 0;
  const [opened] = useState(() => ({ slice: committed, line: dayOf(snap)?.line ?? 0 }));
  const [candidate, setCandidate] = useState(committed);
  useEffect(() => setCandidate(committed), [committed]);
  const income = snap.plan?.income ?? 0;
  const range = whatIfRange(income, Math.max(opened.slice, committed), format.money.currency);
  const position = useSharedValue(range.max > 0 ? candidate / range.max : 0);
  const max = range.max;
  const fyLevel = useDerivedValue(() => {
    if (!(income > 0)) return 0.62;
    const pct = Math.round(((position.value * max) / income) * 100);
    return Math.max(0, Math.min(1, (42 + pct * 1.6) / 100));
  });

  // The jar's moves, read again whenever its money moves.
  const [moves, setMoves] = useState<readonly JarHistoryEntry[]>([]);
  const pot = jar?.pot ?? null;
  const notDailyKey = snap.categories
    .filter((c) => !c.countsDaily)
    .map((c) => c.id)
    .join(',');
  useEffect(() => {
    if (pot === null) return;
    let live = true;
    readJarHistory(store.db, pot, new Set(notDailyKey.split(',').filter(Boolean))).then(
      (read) => {
        if (live) setMoves(read);
      },
      () => undefined,
    );
    return () => {
      live = false;
    };
  }, [store, pot, notDailyKey, snap.potMoves, snap.cycleSpends]);

  const [adding, setAdding] = useState(false);
  if (jar === null || pot === null) return null;

  const slice = input ? cycleFutureYou(input) : committed;
  const eachNow = jar.futureYou
    ? (jarsEachPayday({
        pots: snap.pots,
        setAside: snap.setAsideThisCycle,
        slice: input?.futureYouSkipped === true ? slice : candidate,
      })[jar.id] ?? 0)
    : jar.each;
  const months = pot.neededBy === null ? null : potMonthsLeft(snap.cycle, pot.neededBy);
  const now = cycleMonth(snap.cycle);

  const putAway = () => {
    leave();
    void run(() => actions.archivePot(jar.id)).then((ok) => {
      if (!ok) return;
      offerAfterLeaving(t('pots.new.deleted', { name: jar.name }), t('pots.new.undo'), () => {
        void run(() => actions.restorePot(jar.id));
      });
    });
  };
  const resume = () => {
    haptics.tap();
    if (jar.futureYou) {
      void run(() => actions.setFutureYou(futureYouResume(income, format.money.currency)));
    } else void run(() => actions.updatePot(jar.id, { paused: false }));
  };
  const edit = () => {
    haptics.tap();
    router.push(editJarRoute(jar.id));
  };
  const undoLabel = t('pots.new.undo');
  // A line swiped off the jar's moves (M4, M13), with Undo in the island.
  const remove = async (line: JarHistoryEntry) => {
    const short = format.money.short(line.amount);
    if (line.kind === 'topUp') {
      const done: { removed: RemovedTopUp | null } = { removed: null };
      const ok = await run(async () => {
        done.removed = await actions.removeTopUp(line.moveId);
      });
      const undo = done.removed;
      if (!ok || undo === null) return;
      offerUndo(t('pots.move.removedTopUp', { amount: short }), undoLabel, () => {
        void run(() => actions.restoreTopUp(undo));
      });
    } else if (line.kind === 'spent') {
      const spend = await store.tables.spends.get(line.spendId);
      if (!spend || spend.fromPot !== jar.id) return;
      const taken = { fromPot: spend.fromPot, fromPotAmount: spend.fromPotAmount };
      const ok = await run(() => money.takeFromJar(spend.id, null));
      if (!ok) return;
      offerUndo(t('pots.move.removedSpent', { name: line.merchant ?? short }), undoLabel, () => {
        void run(() => money.restoreJarTake(spend.id, taken));
      });
    } else if (line.kind === 'started') {
      const done = { held: 0 };
      const ok = await run(async () => {
        done.held = await actions.removeOpening(jar.id);
      });
      const opening = done.held;
      if (!ok || opening <= 0) return;
      offerUndo(t('pots.move.removedStarted', { name: jar.name }), undoLabel, () => {
        void run(() => actions.updatePot(jar.id, { opening }));
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* The page's sky takes the touches its content leaves: Android's gesture handler passes a
          touch on a view with no background to whatever is beneath, here Today's rows and Scan. */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: palette.sheetSolid,
            experimental_backgroundImage: palette.skyDeep,
          },
          sky,
        ]}
      />
      <GestureDetector gesture={swipe}>
        <Animated.View style={[{ flex: 1 }, dragged]}>
          <ScrollView
            style={{ flex: 1 }}
            contentInsetAdjustmentBehavior="never"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: top(60),
              paddingHorizontal: 18,
              paddingBottom: bottom(30) + 24,
              gap: 16,
            }}
          >
            <Animated.View
              style={[
                { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
                content,
              ]}
            >
              <PressScale
                accessibilityRole="button"
                accessibilityLabel={t('pots.page.back')}
                onPress={() => {
                  haptics.tap();
                  leave();
                }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: palette.glass,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Symbol name="arrow_back" size={22} color={palette.ink} />
              </PressScale>
              <Text
                numberOfLines={1}
                style={{ ...body(17, 650), flex: 1, textAlign: 'center', color: palette.ink }}
              >
                {jar.name}
              </Text>
              <View style={{ width: 44 }} />
            </Animated.View>
            <JarHero
              jar={jar}
              jarRef={jarView}
              onJarLayout={placeJar}
              flight={flight}
              content={content}
              level={jar.futureYou && jar.target <= 0 ? fyLevel : jar.level}
              each={eachNow}
              months={months}
              now={now}
              format={format}
              onResume={resume}
              onEdit={edit}
              onPutAway={putAway}
            />
            <Animated.View style={[{ gap: 16 }, content]}>
              {jar.futureYou && input ? (
                <JarWhatIf
                  input={input}
                  baseline={opened.line}
                  candidate={candidate}
                  range={range}
                  hue={pot.hue}
                  position={position}
                  onCandidate={setCandidate}
                  onCommit={(amount) => {
                    setCandidate(amount);
                    if (amount !== committed) void run(() => actions.setFutureYou(amount));
                  }}
                />
              ) : null}
              <JarActions
                actions={[
                  {
                    icon: 'add',
                    label: t('pots.page.add'),
                    primary: true,
                    onPress: () => {
                      haptics.tap();
                      setAdding(true);
                    },
                  },
                  {
                    icon: 'shopping_bag',
                    label: t('pots.page.spend'),
                    onPress: () => {
                      haptics.tap();
                      router.push({ pathname: '/quick-add', params: { fromPot: jar.id } });
                    },
                  },
                  { icon: 'tune', label: t('pots.page.edit'), onPress: edit },
                ]}
              />
              <JarMoves
                lines={moves}
                format={format}
                byChoice={jar.futureYou || pot.neededBy === null}
                categoryName={(c) => snap.categories.find((x) => x.id === c)?.name ?? ''}
                onRemove={(line) => void remove(line)}
              />
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </GestureDetector>
      {adding ? (
        <AmountKeypadSheet
          title={t('pots.page.addTitle', { name: jar.name })}
          decimals={format.money.currency.minorDigits > 0}
          onAmount={(amount) => {
            void run(() => actions.topUp(jar.id, amount)).then((ok) => {
              if (ok) haptics.success();
            });
          }}
          onClose={() => setAdding(false)}
        />
      ) : null}
    </View>
  );
}
