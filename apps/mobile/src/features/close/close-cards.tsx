import { useCallback, useEffect, useMemo, useState, type ReactNode, type RefObject } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeInDown,
  ReduceMotion,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import type { CardVerdict } from '@6pm/domain';
import { gestures } from '@6pm/theme';

import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { easeOut } from '../../ui/motion/curves';
import { release, rubberband } from '../../ui/motion/physics';
import { unband } from '../../ui/motion/use-drag-dismiss';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { BalancedText } from '../../ui/type/balanced-text';
import { body, display, leading, mono } from '../../ui/type/fonts';
import { cardFling } from './card-fling';
import { BackCard, CloseCard, MIN_HEIGHT, type CloseCardContent } from './close-card';
import { CARD_BUTTON_HEIGHT, CloseCardButton } from './close-card-button';
import { FutureYouPill } from './future-you-pill';

/** Off the screen to the right (kept) and below (not mine). */
const AWAY_X = 560;
const AWAY_Y = 820;
/** The stack's height on a phone: the 340 pt card and the cards peeking under it. */
const STACK = 390;
/** What the cards behind take below the top card. */
const PEEK = STACK - 340;
const BUTTONS_GAP = 20;
const COMMIT_MS = 300;
/** How far a lifted card goes before the header has made way for the Future you pill. */
const LIFT = 140;
const reduceMotion = ReduceMotion.System;

/** A decision the stack makes: everything but `edited`, which the edit sheet makes. */
export type StackVerdict = Exclude<CardVerdict, 'edited'>;

/** Runs on the UI thread: how far a lift has gone, from 0 to 1. */
function lifted(dy: number): number {
  'worklet';
  return Math.min(1, Math.max(0, -dy / LIFT));
}

export interface CloseCardsProps {
  readonly cards: readonly CloseCardContent[];
  readonly kicker: string;
  readonly title: string;
  readonly hint: string;
  readonly undoText: string | null;
  readonly undoLabel: string;
  /** Shown in the hint's place when there is nothing to undo: an offer that fits this card. */
  readonly accessory?: ReactNode;
  readonly buttons: {
    readonly edit: string;
    readonly notMine: string;
    readonly keep: string;
    readonly spread: string;
    readonly futureYou: string;
  };
  /** The hint when the top card is money that came in (it spreads and saves, not keeps). */
  readonly moneyHint?: string | undefined;
  /** What the Future you pill says while money is lifted to it. */
  readonly pill?: { readonly label: string; readonly from: string; readonly to: string } | null;
  readonly onDecide: (id: string, verdict: StackVerdict) => void;
  readonly onEdit: (id: string) => void;
  readonly onUndo: () => void;
  /**
   * The iPhone Duo opened: the three choices are drawn big on the right page, so the stack draws
   * none under itself and hands its press to `pressRef`.
   */
  readonly pressRef?: RefObject<((choice: 'kept' | 'notMine' | 'edit') => void) | null> | undefined;
}

/**
 * The three round buttons and the stack of cards for one top card. It is keyed by the top card, so
 * each new top card mounts with its own drag at zero: nothing is reset after a fling, and the next
 * card is already where the old top card's drag had brought it.
 */
function CardStack({
  cards,
  buttons,
  onDecide,
  onEdit,
  stack,
  pressRef,
  lift,
}: Pick<CloseCardsProps, 'cards' | 'buttons' | 'onDecide' | 'onEdit' | 'pressRef'> & {
  /** The stack's height, which is how far above home the card can be pulled before it stops. */
  readonly stack: number;
  /** Mirrors the top card's drag up, for the header and the Future you pill above the stack. */
  readonly lift: SharedValue<number>;
}) {
  const top = cards[0];
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const moneyIn = top?.money !== undefined;
  // Money that came in goes up to Future you, when Future you has a goal to keep it in.
  const canUp = top?.money?.canSave === true;
  useAnimatedReaction(
    () => dy.get(),
    (y, was) => {
      lift.set(y);
      // A light tick as a lifted card crosses into Future you, and as it comes back out.
      const reach = -gestures.cardFling;
      if (canUp && was !== null && y < reach !== was < reach) scheduleOnRN(haptics.tick);
    },
    [canUp],
  );

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const id = top?.row.id;

  const decide = useCallback(
    (fling: 'kept' | 'notMine' | 'up') => {
      if (!id) return;
      onDecide(id, fling === 'up' ? 'saved' : fling === 'kept' && moneyIn ? 'spread' : fling);
    },
    [id, onDecide, moneyIn],
  );
  const edit = useCallback(() => {
    if (id) onEdit(id);
  }, [id, onEdit]);

  /** Home again, carrying whatever speed the finger let go with. */
  const settle = useCallback(
    (vx: number, vy: number) => {
      'worklet';
      dx.set(withSpring(0, { ...release.home, velocity: vx, reduceMotion }));
      dy.set(withSpring(0, { ...release.home, velocity: vy, reduceMotion }));
    },
    [dx, dy],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onStart((e) => {
          // A card caught mid-flight is picked up where it is.
          const y = dy.get();
          startX.set(dx.get() - e.translationX);
          startY.set((y < 0 && !canUp ? unband(y, stack) : y) - e.translationY);
        })
        .onUpdate((e) => {
          const y = startY.get() + e.translationY;
          dx.set(startX.get() + e.translationX);
          // Money that can go up rises freely; anything else resists being pulled up.
          dy.set(y >= 0 || canUp ? y : rubberband(y, stack));
        })
        .onEnd((e) => {
          const verdict = cardFling(dx.get(), dy.get(), e.velocityX, e.velocityY, undefined, canUp);
          if (verdict === null) {
            settle(e.velocityX, e.velocityY);
            return;
          }
          // The tap lands as the finger lets go, not when the card is gone.
          scheduleOnRN(haptics.tap);
          if (verdict === 'edit') {
            settle(e.velocityX, e.velocityY);
            scheduleOnRN(edit);
            return;
          }
          const done = (finished?: boolean) => {
            'worklet';
            if (finished) scheduleOnRN(decide, verdict);
          };
          const away = { ...release.away, reduceMotion };
          if (verdict === 'kept') {
            dx.set(withSpring(AWAY_X, { ...away, velocity: e.velocityX }, done));
          } else if (verdict === 'up') {
            dx.set(withSpring(0, { ...away, velocity: e.velocityX }));
            dy.set(withSpring(-AWAY_Y, { ...away, velocity: e.velocityY }, done));
          } else {
            dy.set(withSpring(AWAY_Y, { ...away, velocity: e.velocityY }, done));
          }
        }),
    [dx, dy, startX, startY, settle, edit, decide, stack, canUp],
  );

  // The buttons have no finger speed to carry, so the card leaves on the house ease-out.
  const press = (verdict: 'kept' | 'notMine' | 'edit' | 'up') => {
    if (!top) return;
    haptics.tap();
    if (verdict === 'edit') {
      settle(0, 0);
      edit();
      return;
    }
    const done = (finished?: boolean) => {
      'worklet';
      if (finished) scheduleOnRN(decide, verdict);
    };
    const leave = { duration: COMMIT_MS, easing: easeOut, reduceMotion };
    if (verdict === 'kept') dx.set(withTiming(AWAY_X, leave, done));
    else if (verdict === 'up') dy.set(withTiming(-AWAY_Y, leave, done));
    else dy.set(withTiming(AWAY_Y, leave, done));
  };
  // The big choices on the iPhone Duo's right page press this card, whichever card is on top.
  useEffect(() => {
    if (pressRef) pressRef.current = top ? press : null;
  });

  const topStyle = useAnimatedStyle(() => {
    const y = dy.get();
    // Lifted past the pill, money shrinks into it: full size to a third over 400 pt.
    const shrink = canUp && y < 0 ? Math.min(0.7, Math.max(0, (-y - LIFT) / 400)) : 0;
    return {
      transform: [
        { translateX: dx.get() },
        { translateY: y },
        { rotate: `${dx.get() / 18}deg` },
        { scale: 1 - shrink },
      ],
    };
  });
  // While money is lifted, the other choices step back and Future you steps forward.
  const stepBack = useAnimatedStyle(() => ({
    opacity: canUp ? 1 - 0.55 * lifted(dy.get()) : 1,
  }));
  const stepForward = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + 0.1 * lifted(dy.get()) }],
  }));

  const cardHeight = stack - PEEK;
  return (
    <>
      <View style={{ height: stack }}>
        {cards
          .slice(1, 3)
          .map((card, i) => (
            <BackCard
              key={card.row.id}
              content={card}
              index={i + 1}
              dx={dx}
              dy={dy}
              height={cardHeight}
            />
          ))
          .reverse()}
        {top ? (
          <GestureDetector gesture={pan}>
            <Animated.View
              style={[{ position: 'absolute', left: 4, right: 4, top: 0, zIndex: 10 }, topStyle]}
            >
              <CloseCard content={top} dx={dx} dy={dy} height={cardHeight} top />
            </Animated.View>
          </GestureDetector>
        ) : null}
      </View>

      {pressRef ? null : (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: canUp ? 22 : 30 }}>
          <Animated.View style={stepBack}>
            <CloseCardButton
              icon="edit"
              label={buttons.edit}
              primary={false}
              onPress={() => press('edit')}
            />
          </Animated.View>
          <Animated.View style={stepBack}>
            <CloseCardButton
              icon="south"
              label={buttons.notMine}
              primary={false}
              onPress={() => press('notMine')}
            />
          </Animated.View>
          {canUp ? (
            <Animated.View style={stepForward}>
              <CloseCardButton
                icon="arrow_upward"
                label={buttons.futureYou}
                primary={false}
                tone="futureYou"
                onPress={() => press('up')}
              />
            </Animated.View>
          ) : null}
          <Animated.View style={stepBack}>
            <CloseCardButton
              icon="check"
              label={moneyIn ? buttons.spread : buttons.keep}
              primary
              onPress={() => press('kept')}
            />
          </Animated.View>
        </View>
      )}
    </>
  );
}

/**
 * The cards step: drag the top card right to keep, left to edit, down if it isn't yours, or use
 * the three buttons. A flung card leaves at the finger's speed and is decided once it is gone.
 */
export function CloseCards(props: CloseCardsProps) {
  const { palette } = useTheme();
  const lift = useSharedValue(0);
  const top = props.cards[0];
  const pill = top?.money?.canSave ? props.pill : null;
  // The header makes way for the Future you pill as money is lifted to it.
  const makeWay = useAnimatedStyle(() => ({ opacity: pill ? 1 - 0.86 * lifted(lift.get()) : 1 }));
  // The room under the header for the cards and their buttons. A phone always has the full
  // stack; a short screen shrinks the card. Measured here, above the keyed stack, so a new top
  // card never waits a frame for it.
  const [room, setRoom] = useState<number | null>(null);
  const stack =
    room === null
      ? STACK
      : Math.min(
          STACK,
          Math.max(
            MIN_HEIGHT + PEEK,
            room - (props.pressRef ? 0 : BUTTONS_GAP + CARD_BUTTON_HEIGHT),
          ),
        );
  return (
    <View style={{ flex: 1, gap: 20, paddingTop: 22 }}>
      {pill ? <FutureYouPill {...pill} lift={lift} reach={LIFT} /> : null}
      <Animated.View style={[{ gap: 6 }, makeWay]}>
        <Text style={{ ...mono(11, 400, 0.14), color: palette.inkSoft }}>{props.kicker}</Text>
        <BalancedText style={{ ...leading(display(40, 500, -0.01), 40.8), color: palette.ink }}>
          {props.title}
        </BalancedText>
        {props.undoText ? (
          <Animated.View entering={FadeInDown.duration(250)} style={{ alignSelf: 'flex-start' }}>
            <PressScale
              hitSlop={6}
              onPress={props.onUndo}
              style={{
                height: 32,
                paddingLeft: 9,
                paddingRight: 13,
                borderRadius: 99,
                backgroundColor: palette.glass,
                boxShadow: palette.glassShadow,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Symbol name="undo" size={18} color={palette.ink} />
              <Text
                numberOfLines={1}
                style={{ ...body(14, 600), color: palette.ink, flexShrink: 1 }}
              >
                {props.undoText}
              </Text>
              <Text style={{ ...body(14, 500), color: palette.ink, opacity: 0.55 }}>
                · {props.undoLabel}
              </Text>
            </PressScale>
          </Animated.View>
        ) : props.accessory ? (
          <Animated.View entering={FadeInDown.duration(250)} style={{ alignSelf: 'flex-start' }}>
            {props.accessory}
          </Animated.View>
        ) : (
          // One line the height of the undo pill it trades places with; a longer language shrinks.
          <Animated.Text
            key={top?.money ? 'money' : 'spend'}
            entering={FadeIn.duration(200)}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={{ ...body(15), lineHeight: 32, color: palette.inkSoft }}
          >
            {top?.money && props.moneyHint ? props.moneyHint : props.hint}
          </Animated.Text>
        )}
      </Animated.View>
      <View
        onLayout={(e: LayoutChangeEvent) => setRoom(e.nativeEvent.layout.height)}
        style={{ flex: 1, gap: BUTTONS_GAP, opacity: room === null ? 0 : 1 }}
      >
        <CardStack
          key={props.cards[0]?.row.id ?? 'none'}
          cards={props.cards}
          buttons={props.buttons}
          onDecide={props.onDecide}
          onEdit={props.onEdit}
          stack={stack}
          pressRef={props.pressRef}
          lift={lift}
        />
      </View>
    </View>
  );
}
