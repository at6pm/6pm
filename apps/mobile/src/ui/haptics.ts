import * as Haptics from 'expo-haptics';

/** A buzz the phone can't give (no motor, haptics off, Android's vibrator busy) is simply skipped. */
function felt(buzz: Promise<void>): void {
  buzz.catch(() => undefined);
}

/**
 * The design's one `buzz()` split into the three feelings iOS offers, so each moment gets the
 * right weight: a tick for crossing a threshold, a tap for an action, a success for finishing.
 */
export const haptics = {
  /** Tab scrub, wheel row, a swipe crossing its threshold. */
  tick: () => felt(Haptics.selectionAsync()),
  /** Keep / edit / not mine, FAB long-press, sheet dismissed, undo. */
  tap: () => felt(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Something let go of for good: a row flung away to delete. */
  commit: () => felt(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  /** The close done, the reveal settling, a purchase made. */
  success: () => felt(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
};
