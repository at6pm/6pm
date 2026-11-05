import {
  Easing,
  Keyframe,
  withDelay,
  withTiming,
  type LayoutAnimation,
} from 'react-native-reanimated';

import { curves } from '@6pm/theme';

/** The PAID stamp pressing down: (.3, 1.5, .5, 1), 500 ms, as the close stamps KEEP. */
export const stampIn = new Keyframe({
  0: { opacity: 0, transform: [{ rotate: '-16deg' }, { scale: 2.2 }] },
  60: {
    opacity: 1,
    transform: [{ rotate: '-8deg' }, { scale: 0.94 }],
    easing: Easing.bezier(...curves.jarCheck),
  },
  100: { opacity: 0.92, transform: [{ rotate: '-8deg' }, { scale: 1 }] },
}).duration(500);

/** A paid strip flying off its card, 400 ms. */
export function flyOff(): LayoutAnimation {
  'worklet';
  const ease = { duration: 400, easing: Easing.bezier(0.4, 0, 0.2, 1) };
  return {
    initialValues: {
      opacity: 1,
      transform: [{ translateX: 0 }, { translateY: 0 }, { rotate: '0deg' }],
    },
    animations: {
      opacity: withDelay(300, withTiming(0, { duration: 100 })),
      transform: [
        { translateX: withTiming(300, ease) },
        { translateY: withTiming(-30, ease) },
        { rotate: withTiming('14deg', ease) },
      ],
    },
  };
}

/** How long a settled strip stays on its card, stamped, before it flies off. */
export const STAMP_HOLD_MS = 650;
