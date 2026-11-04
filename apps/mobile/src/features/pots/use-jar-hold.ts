import { randomUUID } from 'expo-crypto';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { Easing, ReduceMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { currencyOf, potTopUp, potTopUpStep, sharedTopUp } from '@6pm/domain';
import { curves } from '@6pm/theme';

import { usePlanActions } from '../../data/plan-actions';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { useRunAction } from '../companion/use-run-action';
import { useTogetherRun } from '../together/together-provider';
import type { ShelfJar } from './use-jars';

/** The hold's first step lands after the ring has drawn; then one more every 400 ms. */
const RING_MS = 500;
const STEP_MS = 400;
const PRESS_MS = 250;
const pressEase = Easing.bezier(...curves.jarFill);

/**
 * Hold a jar to top it up (Pots canvas, A1): it sinks to .94 and a ring draws round it for half a
 * second, then one step goes in (a medium buzz), and another every 400 ms (light) until the finger
 * lifts or the jar is full. Each step floats a "+100k" chip. A tap opens the jar instead.
 */
export function useJarHold(jar: ShelfJar, onOpen: () => void) {
  const actions = usePlanActions();
  const run = useRunAction();
  const runTogether = useTogetherRun();
  const home = useMoneyFormat();
  const pressed = useSharedValue(0);
  const ring = useSharedValue(0);
  const [chips, setChips] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const latest = useRef(jar);
  latest.current = jar;

  const money = jar.kind === 'shared' ? jar.money : home;
  const step = useMemo(
    () =>
      jar.kind === 'shared'
        ? potTopUpStep(jar.target, currencyOf(jar.pot.currency))
        : potTopUpStep(jar.target, home.currency),
    [jar, home.currency],
  );

  const stop = () => {
    if (timer.current !== null) clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);

  const add = (first: boolean) => {
    const j = latest.current;
    const amount =
      j.kind === 'shared'
        ? sharedTopUp(j.target, j.saved, step)
        : potTopUp(j.target, j.saved, step);
    if (amount <= 0) {
      stop();
      return;
    }
    if (first) haptics.commit();
    else haptics.tap();
    setChips((n) => n + 1);
    if (j.kind === 'shared') {
      void runTogether({
        kind: 'addContribution',
        id: randomUUID(),
        potId: j.id,
        amount,
        addedAt: new Date().toISOString(),
      });
    } else {
      void run(() => actions.topUp(j.id, amount));
    }
  };
  const start = () => {
    stop();
    add(true);
    timer.current = setInterval(() => add(false), STEP_MS);
  };

  const gesture = useMemo(() => {
    const hold = Gesture.LongPress()
      .minDuration(RING_MS)
      .maxDistance(10)
      .onBegin(() => {
        pressed.value = withTiming(1, {
          duration: PRESS_MS,
          easing: pressEase,
          reduceMotion: ReduceMotion.System,
        });
        ring.value = withTiming(1, {
          duration: RING_MS,
          easing: Easing.linear,
          reduceMotion: ReduceMotion.System,
        });
      })
      .onStart(() => {
        scheduleOnRN(start);
      })
      .onFinalize(() => {
        pressed.value = withTiming(0, {
          duration: PRESS_MS,
          easing: pressEase,
          reduceMotion: ReduceMotion.System,
        });
        ring.value = 0;
        scheduleOnRN(stop);
      });
    const tap = Gesture.Tap()
      .maxDuration(RING_MS)
      .onEnd((_e, success) => {
        if (success) scheduleOnRN(onOpen);
      });
    return Gesture.Exclusive(hold, tap);
    // The handlers read the jar through `latest`, so the gesture is made once per jar.
  }, [jar.id, onOpen, step]);

  return { gesture, pressed, ring, chips, chipLabel: `+${money.short(step)}` };
}
