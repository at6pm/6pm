import { useEffect, useState } from 'react';
import { View } from 'react-native';
import {
  Easing,
  ReduceMotion,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import {
  AUTOMATION_ROW_Y,
  NOTIFICATION_CARD_OPEN_HEIGHT,
  NotificationTriggerCard,
} from './walkthrough/alert-cards';
import { iosInk } from './walkthrough/frame-ink';
import { Touch } from './walkthrough/moving-parts';
import { SETTLED } from './walkthrough/timeline';

/** The trigger card's width in the drawn iPhone (402 pt, inset 16 each side). */
const CARD_WIDTH = 370;
/** The panel's grey edge round the card: the Shortcuts editor's grouped background. */
const INSET = 10;
/** Where Automation's switch sits on the card: its row's middle, the switch's centre. */
const SWITCH = { x: CARD_WIDTH - 16 - 51 / 2, y: AUTOMATION_ROW_Y } as const;
/** When the finger turns it on, on the drawing's clock. */
const TURNS_ON_AT = 0.42;
/** The drawing plays once, a moment after the card has risen in, then holds Automation on. */
const PLAY_MS = 2600;
const START_AFTER_MS = 450;

/**
 * The trigger of "Catch a bank alert" as Shortcuts shows it once › is tapped, drawn small: 6pm
 * and the banks on it, then Automation and Notify. Once, as it appears, a finger turns Automation
 * on and leaves Notify off; with Reduce Motion it is drawn already on. The drawing is the walk-
 * through's own trigger card, so it stays what the person will see.
 */
export function AutomationDrawing() {
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const t = useSharedValue(reduceMotion ? SETTLED : 0);
  useEffect(() => {
    if (reduceMotion) return;
    t.set(
      withDelay(
        START_AFTER_MS,
        withTiming(SETTLED, {
          duration: PLAY_MS,
          easing: Easing.linear,
          reduceMotion: ReduceMotion.Never,
        }),
      ),
    );
  }, [t, reduceMotion]);
  const scale = width / CARD_WIDTH;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ borderRadius: 20, backgroundColor: iosInk.grouped, padding: INSET }}
    >
      {/* The room is kept from the first frame; the card is drawn once its width is known. */}
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={{ aspectRatio: CARD_WIDTH / NOTIFICATION_CARD_OPEN_HEIGHT }}
      >
        {width > 0 ? (
          <View
            style={{
              width: CARD_WIDTH,
              height: NOTIFICATION_CARD_OPEN_HEIGHT,
              transformOrigin: 'top left',
              transform: [{ scale }],
            }}
          >
            <View
              style={{ flex: 1, borderRadius: 26, backgroundColor: iosInk.bg, overflow: 'hidden' }}
            >
              <NotificationTriggerCard t={t} open own turnsOnAt={TURNS_ON_AT} />
            </View>
            <Touch
              t={t}
              stops={[
                { at: 0.1, x: SWITCH.x - 90, y: SWITCH.y - 50 },
                { at: TURNS_ON_AT, x: SWITCH.x, y: SWITCH.y, tap: true },
              ]}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}
