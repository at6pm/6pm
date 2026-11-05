import { Platform } from 'react-native';

import type { NotificationKind } from '@6pm/domain';

/**
 * Loaded on first use: a build without the notifications module still opens, and simply sends
 * nothing.
 */
const notifications = () => import('expo-notifications');
type NotificationsModule = Awaited<ReturnType<typeof notifications>>;

/** The first catch, posted by the alert reader or the Wallet shortcut while 6pm is away. */
export const FIRST_CATCH_ID = 'first-catch';

/** Each kind's id prefix: the close reminder's names its day ('close-reminder:2026-10-16'). */
const PREFIXES: Readonly<Record<NotificationKind, readonly string[]>> = {
  // The one repeating daily reminder builds before per-day reminders used, too.
  close: ['close-reminder'],
  payday: ['payday:'],
  capture: ['capture-quiet:'],
  reminders: ['owed-remind:'],
};

/** The kind a scheduled notification is, or null when it is not one 6pm schedules. */
export function kindOfNotification(identifier: string): NotificationKind | null {
  for (const [kind, prefixes] of Object.entries(PREFIXES) as [NotificationKind, string[]][]) {
    if (prefixes.some((prefix) => identifier.startsWith(prefix))) return kind;
  }
  return null;
}

/**
 * Android's channel for each kind, so the person can tune or silence one apart from the others
 * (and from 6pm's quiet caught notifications). The close reminder and reminders the person set
 * ring and show as a banner; payday and capture ring without one.
 */
export const CHANNELS: Readonly<Record<NotificationKind, string>> = {
  close: 'close',
  payday: 'payday',
  capture: 'capture',
  reminders: 'reminders',
};

async function makeChannels(
  Notifications: NotificationsModule,
  names: Readonly<Record<NotificationKind, string>>,
): Promise<void> {
  if (Platform.OS !== 'android') return;
  const { HIGH, DEFAULT } = Notifications.AndroidImportance;
  const importance: Readonly<Record<NotificationKind, number>> = {
    close: HIGH,
    payday: DEFAULT,
    capture: DEFAULT,
    reminders: HIGH,
  };
  for (const kind of Object.keys(CHANNELS) as NotificationKind[]) {
    // No sound named: each channel rings with the phone's own notification sound.
    await Notifications.setNotificationChannelAsync(CHANNELS[kind], {
      name: names[kind],
      importance: importance[kind],
    });
  }
}

/** One notification to schedule, its words already chosen. */
export interface NotificationRequest {
  readonly id: string;
  readonly kind: NotificationKind;
  readonly at: Date;
  readonly body: string;
  /** Where its tap leads, read back by the tap handler. */
  readonly data?: Readonly<Record<string, string>>;
}

/** Rebuilds run one after another, so two at once never leave a mix of both. */
let rebuilding: Promise<void> = Promise.resolve();

function inTurn(work: (Notifications: NotificationsModule) => Promise<void>): Promise<void> {
  const run = rebuilding.then(async () => work(await notifications()));
  rebuilding = run.catch(() => undefined);
  return run;
}

async function cancelKinds(
  Notifications: NotificationsModule,
  kinds: ReadonlySet<NotificationKind>,
): Promise<void> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  const ids = new Set<string>(kinds.has('close') ? ['close-reminder'] : []);
  for (const request of pending) {
    const kind = kindOfNotification(request.identifier);
    if (kind !== null && kinds.has(kind)) ids.add(request.identifier);
  }
  await Promise.all([...ids].map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

const EVERY_KIND: ReadonlySet<NotificationKind> = new Set(
  Object.keys(CHANNELS) as NotificationKind[],
);

/**
 * Replaces what 6pm has scheduled of the given kinds (every kind when not given) with `requests`,
 * each in its kind's Android channel, named in the app's language.
 */
export function scheduleNotifications(
  requests: readonly NotificationRequest[],
  channelNames: Readonly<Record<NotificationKind, string>>,
  kinds: ReadonlySet<NotificationKind> = EVERY_KIND,
): Promise<void> {
  return inTurn(async (Notifications) => {
    await cancelKinds(Notifications, kinds);
    await makeChannels(Notifications, channelNames);
    for (const request of requests) {
      if (!kinds.has(request.kind)) continue;
      await Notifications.scheduleNotificationAsync({
        identifier: request.id,
        content: {
          body: request.body,
          sound: 'default',
          ...(request.data ? { data: { ...request.data } } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: request.at,
          ...(Platform.OS === 'android' ? { channelId: CHANNELS[request.kind] } : {}),
        },
      });
    }
  });
}

/** Takes back one scheduled notification, in turn with the rebuilds. */
export function cancelNotification(id: string): Promise<void> {
  return inTurn((Notifications) => Notifications.cancelScheduledNotificationAsync(id));
}

/** Nothing scheduled any more: after Delete all data, until onboarding sets it up again. */
export function cancelNotifications(): Promise<void> {
  return inTurn((Notifications) => cancelKinds(Notifications, EVERY_KIND));
}

/** What is scheduled now, for developer builds to check: id, when, and the words. */
export async function scheduledNotifications(): Promise<
  readonly { readonly id: string; readonly trigger: unknown; readonly body: string | null }[]
> {
  const Notifications = await notifications();
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  return pending.map((request) => ({
    id: request.identifier,
    trigger: request.trigger,
    body: request.content.body,
  }));
}
