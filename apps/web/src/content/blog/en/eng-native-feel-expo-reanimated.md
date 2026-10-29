---
title: "Native feel in Expo: Reanimated 4, form sheets, haptics"
description: "How 6pm makes an Expo app feel native: Reanimated 4 worklets on the UI thread, velocity-aware springs, real iOS form sheets and a small haptics vocabulary."
slug: eng-native-feel-expo-reanimated
lang: en
pubDate: 2026-10-21
tags: [engineering, expo, react native, reanimated, gestures]
related: [eng-sky-shaders-react-native-skia, eng-widgets-controls-live-activities-expo, eng-why-we-open-sourced-our-money-app]
cta: "Read the motion code on GitHub, or feel it in the app."
hero: [close-caught, close-tomorrow]
---

# Native feel in Expo: Reanimated 4 worklets, real form sheets and haptics choreography

An Expo app can feel native if every animation runs on the UI thread, every gesture hands its velocity to the spring that finishes it, and you use the system's own sheets instead of drawing your own. In 6pm that means Reanimated 4 worklets, Gesture Handler, Expo Router form sheets, and four kinds of haptic, each used for one job.

6pm is a daily money app. Its core moment, "the close", is a stack of receipt cards you swipe through at 6pm: right to keep, left to edit, down for "not mine". The last card stamps the day CLOSED. If that swipe feels like a web page, the product fails. So our agent contract (the `CLAUDE.md` at the repo root) opens with this:

> **Native feel is the product.** UI-thread animation only (Reanimated worklets, Gesture Handler). Every state change animates with the prototype's curve. No layout jumps, no blank frames, no JS-thread `Animated`.

Here is how that rule turns into code. Versions, from the workspace catalog: Expo 58, React Native 0.88 (New Architecture, Hermes), `react-native-reanimated` 4.7.0, `react-native-worklets` 0.13.0, `react-native-gesture-handler` 3.2.1, `expo-router` 58.0.19, `expo-haptics` 58.0.6.

## Motion is data, not taste

The design started as an HTML prototype with CSS keyframes and cubic-beziers. Rather than eyeballing it, the curves, durations, springs and gesture thresholds live in one place, `@6pm/theme`:

```ts
// packages/theme/src/motion.ts (trimmed)
export const curves = {
  /** The house curve: a confident move with a small overshoot (cards, sheets, chips). */
  house: [0.2, 0.9, 0.25, 1.12],
  /** Entrances: screens, list items, hero cards. */
  enter: [0.2, 0.9, 0.2, 1],
  /** Wheel pickers snapping to a row. */
  snap: [0.2, 0.9, 0.25, 1],
} as const;

export const gestures = {
  cardFling: 90,
  rowConfirm: 90,
  rowRevealDelete: -48,
  rowCommitDelete: -150,
  sheetDismiss: 120,
  tabSwipe: 70,
  fabLongPressMs: 480,
} as const;
```

Screens import the numbers, never invent them, so motion can be reviewed like any other diff.

## Release physics: project where the finger was going

The biggest difference between "animated" and "native" is what happens when the finger lets go. UIKit decides with velocity, not just position: a quick short flick commits, a slow long drag doesn't. We use the same projection UIScrollView uses:

```ts
// apps/mobile/src/ui/motion/physics.ts
/**
 * Where a released finger was heading: the distance it would still travel if it kept slowing at
 * UIScrollView's normal rate. A quick short flick projects far and commits; a slow long drag
 * doesn't. `velocity` in points per second, as Gesture Handler reports it.
 */
export function project(velocity: number, decelerationRate = 0.998): number {
  'worklet';
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}
```

<!-- media: close-swipe-clip -->

The close card uses it to pick a verdict. Only the axis the finger mostly travelled counts, so a mostly downward drag that drifts right is "not mine", never "keep":

```ts
// apps/mobile/src/features/close/card-fling.ts
export function cardFling(x: number, y: number, velocityX: number, velocityY: number,
                          threshold?: number): CardFling {
  'worklet';
  // Read here, not as a default parameter: a worklet captures only names its body uses.
  const reach = threshold ?? gestures.cardFling;
  const px = x + project(velocityX);
  const py = y + project(velocityY);
  if (Math.abs(px) >= Math.abs(py)) {
    if (px > reach) return 'kept';
    if (px < -reach) return 'edit';
    return null;
  }
  return py > reach ? 'notMine' : null;
}
```

That comment about default parameters is a real gotcha: a worklet closure captures only what its body references, so a default parameter that reads an imported constant can come up undefined on the UI thread. The function is pure, so it has a unit test (`card-fling.test.ts`) that runs in Jest without a device.

## The swipe itself

The card stack is a `Gesture.Pan()` writing to two shared values. Three details make it feel physical:

```tsx
// apps/mobile/src/features/close/close-cards.tsx (trimmed)
Gesture.Pan()
  .onStart((e) => {
    // A card caught mid-flight is picked up where it is.
    const y = dy.get();
    startX.set(dx.get() - e.translationX);
    startY.set((y < 0 ? unband(y, stack) : y) - e.translationY);
  })
  .onUpdate((e) => {
    const y = startY.get() + e.translationY;
    dx.set(startX.get() + e.translationX);
    dy.set(y >= 0 ? y : rubberband(y, stack));
  })
  .onEnd((e) => {
    const verdict = cardFling(dx.get(), dy.get(), e.velocityX, e.velocityY);
    if (verdict === null) {
      settle(e.velocityX, e.velocityY);
      return;
    }
    // The tap lands as the finger lets go, not when the card is gone.
    scheduleOnRN(haptics.tap);
    // ...
    const away = { ...release.away, reduceMotion };
    if (verdict === 'kept') {
      dx.set(withSpring(AWAY_X, { ...away, velocity: e.velocityX }, done));
    } else {
      dy.set(withSpring(AWAY_Y, { ...away, velocity: e.velocityY }, done));
    }
  });
```

<!-- media: diagram-threads -->

1. **Interruptible.** Grab a card that is still springing home and it is picked up where it is. Because upward drags are rubber-banded, `onStart` runs the inverse (`unband`) to find the finger offset that produces the current position. No jump.
2. **Rubber, not walls.** Dragging up, the card follows less and less, the same curve iOS uses at a scroll view's edge:

   ```ts
   export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
     'worklet';
     return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
   }
   ```

3. **Velocity continuity.** Every release spring takes the finger's velocity, so there is no seam between drag and settle. The springs are duration-and-damping-ratio springs, which are far easier to match to a design than stiffness and mass:

   ```ts
   export const release = {
     home: { duration: 400, dampingRatio: 0.8 },
     sheet: { duration: 300, dampingRatio: 0.8 },
     away: { duration: 300, dampingRatio: 1, overshootClamping: true },
   } as const;
   ```

The card tilts as it moves (`rotate: dx / 18` degrees), computed in `useAnimatedStyle`. And because each new top card mounts with its own drag at zero, nothing is "reset" after a fling: the card behind is already where the stack had moved it.

The buttons under the card (Keep, Edit, Not mine) do the same thing without a finger. They have no velocity to carry, so they use `withTiming` on the house ease-out instead of a spring.

## Real sheets, not drawn ones

At first, every sheet in 6pm drew itself over a transparent modal with Reanimated. It looked right in screenshots and felt wrong in the hand. On 12 October we switched to the real thing. The reasoning is recorded in `docs/tech-decisions.md`:

> The native sheet drags from anywhere, pulls down from the top of a scroll, carries the finger's velocity, is interruptible, honours Reduce Motion, and slides away on `router.back()`; the hand-drawn one did none of that well.

With Expo Router that is a screen option:

```ts
// apps/mobile/src/ui/navigation/presentations.ts
export const sheet: ScreenOptions = {
  presentation: Platform.OS === 'ios' && Platform.isPad ? 'pageSheet' : 'formSheet',
  sheetAllowedDetents: [1],
  sheetCornerRadius: 40,
  sheetGrabberVisible: false,
  headerShown: false,
  contentStyle: { backgroundColor: 'transparent' },
};
```

That is `UISheetPresentationController` underneath (via react-native-screens). Trade-offs we accepted:

- **4 points.** The one detent is the tallest iOS allows. Its top edge sits on the safe area, 4 pt lower than the prototype's. iOS won't raise it, and we decided 4 pt was a better deal than fake physics.
- **Our own grabber.** We hide the system grabber and draw the prototype's, and each sheet paints its own background.
- **iPad gets a page sheet.** On iPad a form sheet is a small centred card, too short for a pinned footer, so there it becomes a page sheet.
- **Ask and Scan are page sheets on iPhone too.** The page behind scales back into a card, as Mail does when you compose, which suits a screen that is "a place of its own".

Two sheets stay hand-drawn because iOS cannot draw them: a floating card inset from the edges, and the Looks sheet, which sinks low over an undimmed page while you try a theme on. Below its tallest detent, iOS floats its sheet inset from the edges, so neither shape can be native. Those use a shared drag-to-dismiss hook that follows the same rules as the native sheet: decide by where the flick was heading (position plus projected velocity), spring home at `{300 ms, ratio 0.8}` or out at `{300 ms, ratio 1, clamped}` with the finger's velocity, and continue from wherever it is if grabbed mid-flight.

## The stamp

When the last card goes, the day prints: a receipt feeds down out of a slot, and 1.6 s later a red CLOSED stamp lands. The prototype's `stampIn` keyframes (scale 2.4 → 0.94 → 1, rotate −14° → −7°, opacity to 0.92) become one shared value driven by a sequence, with the keyframe maths in the animated style:

```tsx
// apps/mobile/src/features/close/close-receipt.tsx (trimmed)
const stampEase = Easing.bezier(0.3, 1.5, 0.5, 1);
const STAMP_MS = { delay: 1600, land: 300, rest: 200 };

stamp.value = withDelay(
  STAMP_MS.delay,
  withSequence(
    withTiming(0.6, { duration: STAMP_MS.land, easing: stampEase }, () =>
      runOnJS(haptics.tap)(),
    ),
    withTiming(1, { duration: STAMP_MS.rest }),
  ),
);

const stampStyle = useAnimatedStyle(() => {
  const t = stamp.value;
  const scale = t < 0.6 ? 2.4 - (t / 0.6) * (2.4 - 0.94) : 0.94 + ((t - 0.6) / 0.4) * 0.06;
  return {
    opacity: Math.min(0.92, t / 0.6),
    transform: [{ rotate: `${-14 + 7 * Math.min(1, t / 0.6)}deg` }, { scale }],
  };
});
```

<!-- media: close-stamp-clip -->

The haptic fires in the timing's completion callback, the instant the stamp hits paper. That timing is the whole trick: a thump 100 ms late reads as a bug.

## Haptics: four words, used consistently

The prototype had one `buzz()`. iOS offers several feelings, so we split it into a tiny vocabulary and never call `expo-haptics` directly from a screen:

```ts
// apps/mobile/src/ui/haptics.ts
export const haptics = {
  /** Tab scrub, wheel row, a swipe crossing its threshold. */
  tick: () => void Haptics.selectionAsync(),
  /** Keep / edit / not mine, FAB long-press, sheet dismissed, undo. */
  tap: () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  /** Something let go of for good: a row flung away to delete. */
  commit: () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  /** The close done, the reveal settling, a purchase made. */
  success: () => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
};
```

From a gesture worklet, haptics hop to the JS thread with `scheduleOnRN` (Reanimated 4 moved thread hopping into `react-native-worklets`). Two rules we follow:

- **Fire on the finger, not on the animation.** The card's tap lands as the finger lets go, not 300 ms later when the card leaves.
- **Success is rare.** Only finishing things gets the success pattern: the close, the reveal of tomorrow's number, a purchase. If everything buzzes, nothing does.

## Numbers that roll instead of jumping

"Every state change animates" includes text. The daily number is an odometer: each digit is a column that rolls, 1000 ms plus 80 ms per position, on the entrance curve. When the number grows a digit (99 → 100), the new column opens from zero width while the others glide over, using Reanimated layout animations written as worklets:

```ts
// apps/mobile/src/ui/odometer.tsx
const slide = LinearTransition.duration(durations.screen).easing(ease);
```

<!-- media: number-roll-clip -->

No re-render can make the number jump, because the layout change itself is animated on the UI thread.

## Reduce Motion is part of the design

Respecting the accessibility setting is not an afterthought you add with a flag at the end. In 6pm:

- Release springs pass `reduceMotion: ReduceMotion.System`, so iOS's setting is honoured in the spring itself.
- The motion contract in `docs/tech-decisions.md` says springs become short fades, atmosphere freezes and nothing loops.
- The animated sky's clock stays at zero under Reduce Motion, which holds every drift, twinkle and grain step on its first frame.
- Native sheets honour it for free, one more reason to use them.

## What we learned

- **Put the physics in pure worklet functions.** `project`, `rubberband`, `unband` and `cardFling` are a few lines each, run on the UI thread, and are unit-tested in Jest.
- **Prefer the platform when it exists.** We drew our sheets first, then moved every sheet iOS can present to `presentation: 'formSheet'`. The 4 pt we lost bought interruptibility, scroll hand-off and accessibility.
- **Haptics are timing.** The right pattern at the wrong moment is worse than none.

## FAQ

### Can a React Native app feel as smooth as a native one?

Yes, if animation and gesture handling run on the UI thread. Reanimated worklets and Gesture Handler do that; the JS-thread `Animated` API and state-driven re-renders don't.

### Should I use native form sheets or a JS bottom sheet in Expo?

Use Expo Router's `presentation: 'formSheet'` where it fits: you get UISheetPresentationController's drag, scroll hand-off, velocity and Reduce Motion for free. Draw your own only for shapes iOS can't present.

### How do you decide if a swipe should commit?

Project the release velocity with UIScrollView's deceleration rate, add it to the current offset, and compare against a threshold on the dominant axis. A short fast flick commits; a slow drag springs back.

## Try it

All of this is open source under Apache 2.0: [github.com/at6pm/6pm](https://github.com/at6pm/6pm) (see `apps/mobile/src/ui/motion`, `apps/mobile/src/features/close` and `packages/theme/src/motion.ts`). Swipe the close yourself: 6pm is on [the App Store](https://apps.apple.com/app/id6504689878). More at [at6pm.app](https://at6pm.app).
