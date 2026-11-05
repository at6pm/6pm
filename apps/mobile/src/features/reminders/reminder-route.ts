import { moneyDayOf, type LocalDate } from '@6pm/domain';

import type { MoneySnapshot } from '../../data/money-store';
import { closeReminderDay, isCloseReminder } from '../onboarding/close-reminder';

type Snapshot = Pick<MoneySnapshot, 'plan' | 'today' | 'closedDays'>;

const isClosed = (snapshot: Pick<MoneySnapshot, 'closedDays'>, day: LocalDate) =>
  snapshot.closedDays.some((closed) => closed.day === day);

/**
 * When a notification was delivered. iOS reports seconds since 1970 and Android milliseconds; any
 * delivery in this century reads as more than 10¹¹ only in milliseconds.
 */
export function deliveredAtOf(date: number): Date {
  return new Date(date < 1e11 ? date * 1000 : date);
}

/** The money day a close reminder asks to close: named in its id, or the day it was delivered. */
function reminderDayOf(identifier: string, deliveredAt: Date): LocalDate {
  return closeReminderDay(identifier) ?? moneyDayOf(deliveredAt);
}

/** Where a tapped notification leads, when it leads anywhere. */
export type NotificationRoute =
  | '/close'
  | `/missed-day?day=${string}`
  | '/pots'
  | '/owed'
  | `/owed?ask=${string}`
  | `/capture-guide?source=${'alerts' | 'wallet'}`;

/** The capture guide each watched way's set-up is in. */
const GUIDE_OF: Readonly<Record<string, 'alerts' | 'wallet'>> = {
  alert: 'alerts',
  applePay: 'wallet',
};

/**
 * Where tapping a notification leads. Tonight's close reminder opens the close when there is a
 * plan and today has not been closed yet. A reminder about an earlier day (left in Notification
 * Centre and tapped the morning after) opens that missed day while it is still open, never today's
 * close. Payday opens the jars; a reminder the person set opens who owes them, with the one
 * person's Ask ready; a way gone quiet opens its set-up. Anything else (the first catch, a day
 * already closed, a phone not yet set up) just opens the app where it was.
 */
export function routeForTappedNotification(
  identifier: string,
  deliveredAt: Date,
  snapshot: Snapshot,
  data: Readonly<Record<string, unknown>> = {},
): NotificationRoute | null {
  if (snapshot.plan === null) return null;
  if (identifier.startsWith('payday:')) return '/pots';
  if (identifier.startsWith('owed-remind:')) {
    return typeof data.person === 'string' && data.person !== ''
      ? `/owed?ask=${encodeURIComponent(data.person)}`
      : '/owed';
  }
  if (identifier.startsWith('capture-quiet:')) {
    const guide = GUIDE_OF[identifier.slice('capture-quiet:'.length)];
    return guide ? `/capture-guide?source=${guide}` : null;
  }
  if (!isCloseReminder(identifier)) return null;
  const day = reminderDayOf(identifier, deliveredAt);
  if (day < snapshot.today) return isClosed(snapshot, day) ? null : `/missed-day?day=${day}`;
  return isClosed(snapshot, snapshot.today) ? null : '/close';
}

/**
 * Whether a close reminder arriving while 6pm is open says nothing: the day it asks about is
 * already closed, or the close is open on screen.
 */
export function closeReminderStaysQuiet(
  identifier: string,
  snapshot: Pick<MoneySnapshot, 'today' | 'closedDays'>,
  pathname: string,
): boolean {
  if (pathname === '/close') return true;
  return isClosed(snapshot, closeReminderDay(identifier) ?? snapshot.today);
}
