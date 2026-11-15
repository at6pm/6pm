import { useWindowDimensions } from 'react-native';
import {
  useKeyboardHandler,
  useReanimatedFocusedInput,
  useReanimatedKeyboardAnimation,
} from 'react-native-keyboard-controller';
import {
  scrollTo,
  useAnimatedProps,
  useAnimatedReaction,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import type { ScrollDismiss } from '../motion/use-sheet-drag';

/** Space kept between a field and the top of the keyboard. */
const CLEAR = 24;

/**
 * The keyboard inside a drawn `EdgeSheet`. The sheet rises with the keyboard only as far as
 * `room` (from its top to the safe area); what the keyboard still covers becomes the scroll's
 * bottom inset, and a field it would cover is scrolled into view as the keyboard rises. All on the
 * UI thread. The system's own keyboard insets cannot be used here: iOS measures the scroll before
 * the sheet has risen, so it would scroll by the whole keyboard.
 */
export function useSheetKeyboard(scroll: ScrollDismiss, room: SharedValue<number>) {
  const { height: screen } = useWindowDimensions();
  const keyboard = useReanimatedKeyboardAnimation();
  const { input } = useReanimatedFocusedInput();
  const hidden = useSharedValue(0);
  const target = useSharedValue(0);
  // Where the sheet and the scroll were when the field was measured.
  const markLift = useSharedValue(0);
  const markOffset = useSharedValue(0);

  const reveal = (height: number) => {
    'worklet';
    const layout = input.get()?.layout;
    if (layout === undefined || height <= 0) return;
    const lift = Math.min(height, room.get());
    const moved = lift - markLift.get() + (scroll.offset.get() - markOffset.get());
    const bottom = layout.absoluteY + layout.height - moved;
    const over = bottom - (screen - height - CLEAR);
    if (over > 0) scrollTo(scroll.ref, 0, scroll.offset.get() + over, true);
  };

  useAnimatedReaction(
    () => input.get()?.target ?? null,
    (now, before) => {
      if (now === null || now === before) return;
      markLift.set(Math.min(-keyboard.height.get(), room.get()));
      markOffset.set(scroll.offset.get());
      if (target.get() > 0) reveal(target.get());
    },
  );

  useKeyboardHandler(
    {
      onStart: (e) => {
        'worklet';
        target.set(e.height);
        hidden.set(Math.max(0, e.height - room.get()));
        if (e.height > 0) {
          reveal(e.height);
          return;
        }
        // Closing: the content comes back down to where it can rest.
        if (scroll.offset.get() > scroll.extent.get()) {
          scrollTo(scroll.ref, 0, scroll.extent.get(), true);
        }
      },
      onEnd: (e) => {
        'worklet';
        if (e.height > 0) reveal(e.height);
      },
    },
    [],
  );

  return useAnimatedProps(() => {
    const bottom = hidden.get();
    return {
      contentInset: { top: 0, left: 0, right: 0, bottom },
      scrollIndicatorInsets: { top: 0, left: 0, right: 0, bottom },
    };
  });
}
