import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  ReduceMotion,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import type { OpenFailure } from '@6pm/domain';

import type { RemovedImport } from '../../data/import-actions';
import { curves } from '@6pm/theme';

import misa from '../../../assets/import/misa.png';
import moneyLover from '../../../assets/import/moneylover.png';
import momo from '../../../assets/import/momo.png';
import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { release, rubberband } from '../../ui/motion/physics';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading } from '../../ui/type/fonts';
import { GUIDE_APPS, SKETCHES, SketchPhone, type GuideApp } from './guide-sketches';
import { inkWash } from '../diary/diary-colours';
import { landingPage } from '../home/pager';
import { FileCard, ImportFoot, PillButton, PrivacyLine } from './import-parts';
import { ImportUndoList, type RemovedImports } from './import-undo';

/** Files, Zalo or Mail can open a CSV or Excel file in 6pm ("Open in 6pm") on the iPhone. */
const SHARES_IN = Platform.OS === 'ios';
/** How long each step shows before the next plays. */
const STEP_MS = 2800;
const enter = Easing.bezier(...curves.enter);
const LAST_APP_KEY = 'import.guideApp';
/** How far a sketch slides aside as a step changes on its own or on a tap. */
const ASIDE = 30;
/** The shown sketch's height on the stage: the phone's 244 pt, drawn 1.38 times. */
const SKETCH_H = 244 * 1.38;
/** A drag starts once it is this far sideways, and leaves vertical scrolls alone. */
const SWIPE_START = 12;
const ICON = { moneyLover, misa, momo } as const;

/** The app whose guide was open last, so the row opens on it again. */
function useLastApp(): [GuideApp, (app: GuideApp) => void] {
  const db = useSQLiteContext();
  const [app, setApp] = useState<GuideApp>(() => {
    const row = db.getFirstSync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
      LAST_APP_KEY,
    ]);
    return GUIDE_APPS.find((a) => a === row?.value) ?? 'moneyLover';
  });
  const choose = useCallback(
    (next: GuideApp) => {
      setApp(next);
      db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
        LAST_APP_KEY,
        next,
      ]);
    },
    [db],
  );
  return [app, choose];
}

/** What went wrong with a file, in words; a lock is asked for, never shown as an error. */
function errorKey(error: OpenFailure) {
  switch (error) {
    case 'empty':
      return 'import.error.empty' as const;
    case 'unsupported':
      return 'import.error.unsupported' as const;
    case 'damaged':
    case 'locked':
    case 'wrongPassword':
      return 'import.error.damaged' as const;
  }
}

/**
 * The stage's state: the step it is leaving (`from`), the one it is going to (`to`) and how far
 * along it is (`p`, 0 to 1), plus how far a sketch moves for a whole step (`aside`): 30 pt when a
 * step plays or is tapped, the stage's width while a finger drags it. With nowhere to go (`to` is
 * `from`), `p` is how far the shown sketch gives under the finger, in steps.
 */
interface StageMotion {
  readonly from: SharedValue<number>;
  readonly to: SharedValue<number>;
  readonly p: SharedValue<number>;
  readonly aside: SharedValue<number>;
  /** The sketch's size against its design, under 1 only when the stage is too short for it. */
  readonly fit: SharedValue<number>;
}

/** One sketch on the stage: the shown one large, the others slid aside and faded. */
function Stage({
  app,
  index,
  motion,
}: {
  readonly app: GuideApp;
  readonly index: number;
  readonly motion: StageMotion;
}) {
  const sketch = SKETCHES[app][index];
  const { from, to, p, aside, fit } = motion;
  const style = useAnimatedStyle(() => {
    const f = from.get();
    const t = to.get();
    const q = p.get();
    const way = Math.sign(t - f);
    if (way === 0 && index === t) {
      return {
        opacity: 1,
        transform: [{ translateX: -q * aside.get() }, { scale: 1.38 * fit.get() }],
      };
    }
    // Where it sits, in steps from the middle: the arriving sketch comes in from the side it is
    // on, the leaving one goes out the other, and the rest wait faded on their own side.
    const d = index === t ? way * (1 - q) : index === f ? -way * q : index < t ? -1 : 1;
    const off = Math.min(1, Math.abs(d));
    return {
      opacity: 1 - off,
      transform: [
        { translateX: Math.max(-1, Math.min(1, d)) * aside.get() },
        { scale: (1.38 - 0.08 * off) * fit.get() },
      ],
    };
  });
  if (!sketch) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', left: '50%', top: '50%', marginLeft: -70, marginTop: -122 },
        style,
      ]}
    >
      <SketchPhone app={app} sketch={sketch} />
    </Animated.View>
  );
}

/** The bar under the playing step, filling over its 2.8 s. */
function StepBar({ run, held }: { readonly run: number; readonly held: boolean }) {
  const { palette } = useTheme();
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = 0;
    if (held) return;
    width.value = withTiming(1, { duration: STEP_MS, easing: Easing.linear });
    return () => cancelAnimation(width);
  }, [run, held, width]);
  const style = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }));
  return (
    <Animated.View
      style={[
        { position: 'absolute', left: 0, bottom: 0, height: 2, backgroundColor: palette.accent },
        style,
      ]}
    />
  );
}

/**
 * "Bring your history": each app's export path, step by step, drawn large in its colours. Steps
 * play on their own; a tap on one, or a swipe across the sketch or the steps to the next or the one
 * before (never past this app's), holds the timer from it. Then pick the file.
 */
export function ImportGuide({
  error,
  onPick,
  removed,
  onRemoved,
}: {
  readonly error: OpenFailure | null;
  readonly onPick: () => void;
  /** Bring-ins taken out while the sheet is open, kept to bring back. */
  readonly removed: RemovedImports;
  readonly onRemoved: (id: string, removed: RemovedImport | null) => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const still = useReducedMotion();
  const [app, setApp] = useLastApp();
  const steps = SKETCHES[app];
  const last = steps.length - 1;
  const [at, setAt] = useState(0);
  const atRef = useRef(0);
  const [run, setRun] = useState(0);
  // A finger on the stage: the steps wait for it.
  const [held, setHeld] = useState(false);
  const motion: StageMotion = {
    from: useSharedValue(0),
    to: useSharedValue(0),
    p: useSharedValue(0),
    aside: useSharedValue(still ? 0 : ASIDE),
    fit: useSharedValue(1),
  };
  const { from, to, p, aside } = motion;
  const stageWidth = useSharedValue(0);
  const dragging = useSharedValue(false);

  /** Plays the change to `step` on its own: a slide and fade, or with Reduce Motion a fade. */
  const show = (step: number) => {
    const base = p.get() >= 0.5 ? to.get() : from.get();
    cancelAnimation(p);
    aside.set(still ? 0 : ASIDE);
    from.set(base);
    to.set(step);
    p.set(0);
    if (base === step) return;
    const settle = (done: boolean | undefined) => {
      'worklet';
      if (!done) return;
      from.set(step);
      p.set(0);
    };
    p.set(
      still
        ? withTiming(1, { duration: 200, reduceMotion: ReduceMotion.Never }, settle)
        : withTiming(1, { duration: 450, easing: enter, reduceMotion: ReduceMotion.Never }, settle),
    );
  };
  const moveTo = (step: number) => {
    atRef.current = step;
    setAt(step);
    setRun((n) => n + 1);
  };
  const restart = (step: number) => {
    moveTo(step);
    show(step);
  };
  useEffect(() => {
    if (held) return;
    const timer = setTimeout(() => {
      const next = (atRef.current + 1) % SKETCHES[app].length;
      moveTo(next);
      show(next);
    }, STEP_MS);
    return () => clearTimeout(timer);
  }, [app, run, held]);
  const ext = app === 'moneyLover' ? 'CSV' : 'XLSX';

  /** Where a swipe let go: a tick for a new step, and the timer runs again from it. */
  const landed = (step: number) => {
    if (step !== atRef.current) haptics.tick();
    setHeld(false);
    moveTo(step);
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-SWIPE_START, SWIPE_START])
    .failOffsetY([-SWIPE_START, SWIPE_START])
    .onStart(() => {
      // Grabbed mid-change: it finishes where it was going, then follows the finger.
      const base = p.get() >= 0.5 ? to.get() : from.get();
      cancelAnimation(p);
      from.set(base);
      to.set(base);
      p.set(0);
      if (!still) aside.set(stageWidth.get());
      dragging.set(true);
      scheduleOnRN(setHeld, true);
    })
    .onUpdate((e) => {
      const w = stageWidth.get();
      if (w <= 0) return;
      const base = from.get();
      // Steps the finger has carried the stage forward (a swipe to the left goes on).
      const x = -e.translationX / w;
      const next = base + Math.sign(x);
      if (x !== 0 && next >= 0 && next <= last) {
        to.set(next);
        p.set(Math.min(1, Math.abs(x)));
      } else {
        to.set(base);
        p.set(rubberband(x * w, w) / w);
      }
    })
    .onFinalize((e, success) => {
      // A touch that never became a drag (a tap on a step) leaves the stage to the tap.
      if (!dragging.get()) return;
      dragging.set(false);
      const w = stageWidth.get();
      const base = from.get();
      const x = w > 0 ? -e.translationX / w : 0;
      const step = !success
        ? base
        : landingPage({
            position: base + Math.max(-1, Math.min(1, x)),
            velocity: e.velocityX,
            width: w,
            current: base,
            lo: 0,
            hi: last,
          });
      const way = Math.sign(to.get() - base);
      // The finger's speed, in steps a second along the way it is going.
      const velocity = w > 0 && way !== 0 ? (-e.velocityX / w) * way : 0;
      const settle = (done: boolean | undefined) => {
        'worklet';
        if (!done) return;
        from.set(step);
        to.set(step);
        p.set(0);
      };
      if (step !== base) {
        to.set(step);
        p.set(
          still
            ? withTiming(1, { duration: 200, reduceMotion: ReduceMotion.Never }, settle)
            : withSpring(
                1,
                { ...release.away, velocity, reduceMotion: ReduceMotion.Never },
                settle,
              ),
        );
      } else {
        p.set(
          still
            ? withTiming(0, { duration: 200, reduceMotion: ReduceMotion.Never }, settle)
            : withSpring(
                0,
                { ...release.home, velocity, reduceMotion: ReduceMotion.Never },
                settle,
              ),
        );
      }
      scheduleOnRN(landed, step);
    });
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 6, paddingHorizontal: 16, gap: 14 }}>
        <View
          style={{
            flexDirection: 'row',
            padding: 3,
            borderRadius: 14,
            backgroundColor: palette.chipBg,
          }}
        >
          {GUIDE_APPS.map((a) => (
            <PressScale
              key={a}
              accessibilityRole="tab"
              accessibilityState={{ selected: a === app }}
              onPress={() => {
                haptics.tick();
                // Another app's steps: its first shows at once, with nothing to slide from.
                cancelAnimation(p);
                from.set(0);
                to.set(0);
                p.set(0);
                setApp(a);
                moveTo(0);
              }}
              style={{
                flex: 1,
                height: 42,
                borderRadius: 11,
                backgroundColor: a === app ? palette.chipBg : 'transparent',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingHorizontal: 4,
              }}
            >
              <Image source={ICON[a]} style={{ width: 22, height: 22, borderRadius: 6 }} />
              <Text numberOfLines={1} style={{ ...body(13.5, 650), color: palette.ink }}>
                {t(`import.app.${a}`)}
              </Text>
            </PressScale>
          ))}
        </View>
        <GestureDetector gesture={pan}>
          <View
            onLayout={(e) => stageWidth.set(e.nativeEvent.layout.width)}
            style={{ flex: 1, minHeight: 0, gap: 14 }}
          >
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {steps.map((step, i) => (
                <PressScale
                  key={`${app}-${i}`}
                  accessibilityRole="button"
                  accessibilityLabel={t('import.guide.step', {
                    n: i + 1,
                    caption: t(step.caption),
                  })}
                  accessibilityState={{ selected: i === at }}
                  onPress={() => {
                    haptics.tick();
                    restart(i);
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 14,
                    backgroundColor: i === at ? palette.chipBg : palette.hair,
                    paddingTop: 9,
                    paddingHorizontal: 10,
                    paddingBottom: 11,
                    gap: 3,
                    overflow: 'hidden',
                  }}
                >
                  <Text style={{ ...leading(display(18, 600), 18, true), color: palette.accent }}>
                    {i + 1}
                  </Text>
                  <Text
                    style={{
                      ...leading(body(12, 600), 15),
                      color: palette.ink,
                      opacity: i === at ? 1 : 0.6,
                    }}
                  >
                    {t(step.caption)}
                  </Text>
                  {i === at ? <StepBar run={run} held={held} /> : null}
                </PressScale>
              ))}
            </View>
            <View
              onLayout={(e) => motion.fit.set(Math.min(1, e.nativeEvent.layout.height / SKETCH_H))}
              style={{ flex: 1, minHeight: 0 }}
            >
              {steps.map((_, i) => (
                <Stage key={`${app}-${i}`} app={app} index={i} motion={motion} />
              ))}
            </View>
          </View>
        </GestureDetector>
        {/* Only the iPhone opens a shared CSV or Excel file in 6pm; on Android the card is for
            what went wrong with a pick. */}
        {error || SHARES_IN ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 20,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: error ? palette.accent : inkWash(palette.dark).dashed,
            }}
          >
            <FileCard ext={ext} />
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ ...body(13.5), lineHeight: 18.2, color: palette.inkSoft }}>
                {error ? t(errorKey(error)) : t('import.guide.share')}
              </Text>
              {error ? (
                <PressScale accessibilityRole="button" onPress={() => restart(0)} hitSlop={8}>
                  <Text style={{ ...body(13.5, 650), color: palette.accent }}>
                    {t('import.error.again')}
                  </Text>
                </PressScale>
              ) : null}
            </View>
          </View>
        ) : null}
        <ImportUndoList removed={removed} onRemoved={onRemoved} />
      </View>
      <ImportFoot>
        <PillButton icon="folder_open" label={t('import.guide.pick')} onPress={onPick} />
        <PrivacyLine />
      </ImportFoot>
    </View>
  );
}
