import {
  closeRemindersAhead,
  DEFAULT_CLOSE_AT,
  type LocalDate,
  type NotificationKind,
} from '@6pm/domain';

import { t, type Language } from '@6pm/i18n';

import {
  cancelNotifications,
  FIRST_CATCH_ID,
  scheduleNotifications,
} from '../reminders/notification-schedule';

/**
 * Loaded on first use: a build without the notifications module still opens, and onboarding then
 * simply goes on without a reminder.
 */
const notifications = () => import('expo-notifications');

/** Every close reminder's id: this, then the money day it asks to close ('close-reminder:2026-10-16'). */
export const CLOSE_REMINDER_PREFIX = 'close-reminder:';

/** The one repeating daily reminder builds before this one scheduled. */
const REPEATING_REMINDER_ID = 'close-reminder';

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Whether a notification is a close reminder, either kind. */
export function isCloseReminder(identifier: string): boolean {
  return identifier === REPEATING_REMINDER_ID || identifier.startsWith(CLOSE_REMINDER_PREFIX);
}

/** The money day a close reminder asks to close, or null when its id does not name one. */
export function closeReminderDay(identifier: string): LocalDate | null {
  if (!identifier.startsWith(CLOSE_REMINDER_PREFIX)) return null;
  const day = identifier.slice(CLOSE_REMINDER_PREFIX.length);
  return DAY.test(day) ? day : null;
}

/** "It's six. Time to close your day." at 18:00, "It's 19:30. …" at any other close time. */
export function closeReminderText(language: Language, closeAt: string): string {
  return closeAt === DEFAULT_CLOSE_AT
    ? t(language, 'reminder.close.six')
    : t(language, 'reminder.close.at', { time: closeAt });
}

/**
 * Asks the phone for permission to send the daily close reminder. Shows the system alert the first time;
 * afterwards returns what the user already chose without asking again.
 */
export async function askForReminders(): Promise<boolean> {
  const Notifications = await notifications();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const answer = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return answer.granted;
}

/** Each kind's Android channel name, in the app's language. */
export function channelNames(language: Language): Record<NotificationKind, string> {
  return {
    close: t(language, 'reminder.close.channel'),
    payday: t(language, 'notify.channel.payday'),
    capture: t(language, 'notify.channel.capture'),
    reminders: t(language, 'notify.channel.reminders'),
  };
}

const CLOSE_ONLY: ReadonlySet<NotificationKind> = new Set(['close']);

/**
 * Schedules the close reminder once on each of the coming money days, at the close time, leaving
 * out days already closed, in its plain words. Onboarding and a restore set it up this way; the
 * reminder sync then rebuilds every notification with the day's news in it.
 */
export function scheduleCloseReminder(
  language: Language,
  closeAt: string,
  closedDays: Iterable<LocalDate> = [],
): Promise<void> {
  const body = closeReminderText(language, closeAt);
  const requests = closeRemindersAhead(new Date(), closeAt, new Set(closedDays)).map((slot) => ({
    id: `${CLOSE_REMINDER_PREFIX}${slot.day}`,
    kind: 'close' as const,
    at: slot.at,
    body,
  }));
  return scheduleNotifications(requests, channelNames(language), CLOSE_ONLY);
}

/** No more reminders: after Delete all data, until onboarding sets one again. */
export function cancelCloseReminder(): Promise<void> {
  return cancelNotifications();
}

/** Every test alert's notification id starts with this (the surfaces module posts it). */
export const TEST_ALERT_ID_PREFIX = 'test-alert:';

/** How one notification is shown while 6pm is open, and whether the companion says it instead. */
export interface PresentationWhileOpen {
  readonly banner: boolean;
  readonly list: boolean;
  readonly sound: boolean;
  /** A close reminder the companion says in the island instead of iOS showing its banner. */
  readonly say: boolean;
}

/**
 * How a notification that arrives while 6pm is open is shown. A close reminder is said by the
 * companion and kept off the screen, or is neither shown nor said when `quiet` says so (the day
 * it asks about is closed, or the close is already open). The first catch is not shown: 6pm open
 * shows the catch itself. A test alert the person just sent is always shown as a banner with its
 * sound, 6pm open or not: it is sent from inside 6pm, and the Shortcuts automation it proves runs
 * on a notification the phone shows. Every other notification shows as usual.
 */
export function presentationWhileOpen(
  identifier: string,
  quiet: (identifier: string) => boolean,
): PresentationWhileOpen {
  if (identifier.startsWith(TEST_ALERT_ID_PREFIX)) {
    return { banner: true, list: true, sound: true, say: false };
  }
  const ours = isCloseReminder(identifier);
  const silent = (ours && quiet(identifier)) || identifier === FIRST_CATCH_ID;
  return { banner: !ours && !silent, list: !silent, sound: !ours && !silent, say: ours && !silent };
}

/**
 * While 6pm is open, the reminder is not shown as a banner over the app: `onArrive` gets it
 * instead, so the companion can say it in the island (`presentationWhileOpen` decides each
 * notification). Returns the unsubscribe.
 */
export function takeOverRemindersWhileOpen(
  onArrive: () => void,
  quiet: (identifier: string) => boolean,
): () => void {
  let removed = false;
  let remove = () => {
    removed = true;
  };
  void notifications()
    .then((Notifications) => {
      if (removed) return;
      Notifications.setNotificationHandler({
        handleNotification: (n) => {
          const shown = presentationWhileOpen(n.request.identifier, quiet);
          if (shown.say) onArrive();
          return Promise.resolve({
            shouldShowBanner: shown.banner,
            shouldShowList: shown.list,
            shouldPlaySound: shown.sound,
            shouldSetBadge: false,
          });
        },
      });
      remove = () => Notifications.setNotificationHandler(null);
    })
    .catch(() => undefined);
  return () => remove();
}
