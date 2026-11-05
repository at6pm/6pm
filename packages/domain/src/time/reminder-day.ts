import { readyJarFor, readyKey, type JarReadyReason, type MatchableJar } from '../close/jar-match';
import type { Money } from '../money/currency';
import { closeRemindersAhead, hoursOf, type ClockTime } from './close-time';
import { addDays, diffDays, hourOf, localDateOf, parts, type LocalDate } from './local-date';
import { seasonDay, type LunarTradition } from './lunar';

/**
 * The kinds of notification 6pm sends, each with its own switch and Android channel: the close
 * reminder, payday, capture health (the first catch and a way gone quiet), and reminders the
 * person set (who owes them).
 */
export const NOTIFICATION_KINDS = ['close', 'payday', 'capture', 'reminders'] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

/** Nothing but the close reminder is sent from this hour… */
export const QUIET_FROM_HOUR = 22;
/** …until this one. */
export const QUIET_UNTIL_HOUR = 8;

/** Payday's notification, on the payday morning. */
export const PAYDAY_AT: ClockTime = '08:30';
/** A way gone quiet, on the morning of its third quiet day. */
export const QUIET_WAY_AT: ClockTime = '09:00';
/** A reminder the person set about who owes them. */
export const REMIND_AT: ClockTime = '10:00';

/** Days with nothing from a way before it is asked about. */
export const QUIET_WAY_AFTER_DAYS = 3;
/** A way is asked about at most once in this many days. */
export const QUIET_WAY_EVERY_DAYS = 7;

/** Days of reminders the person set kept scheduled ahead (iOS keeps 64 pending in all). */
const REMINDER_DAYS_AHEAD = 40;

/** The instant `time` strikes on `day`, on the phone's clock. */
export function atClock(day: LocalDate, time: ClockTime): Date {
  const hours = hoursOf(time);
  const hour = Math.floor(hours);
  const minute = Math.round((hours - hour) * 60);
  const { year, month, day: date } = parts(day);
  return new Date(year, month - 1, date, hour, minute);
}

/** Whether an instant is in the night's quiet hours (22:00 to 08:00). */
export function inQuietHours(at: Date): boolean {
  const hour = hourOf(at);
  return hour >= QUIET_FROM_HOUR || hour < QUIET_UNTIL_HOUR;
}

/** The first moment at or after `at` outside the quiet hours: 08:00 the same or the next morning. */
export function pastQuietHours(at: Date): Date {
  if (!inQuietHours(at)) return at;
  const day = localDateOf(at);
  const morning = hourOf(at) < QUIET_UNTIL_HOUR ? day : addDays(day, 1);
  return atClock(morning, `${String(QUIET_UNTIL_HOUR).padStart(2, '0')}:00`);
}

/** Money in waiting for the close, as the close will ask about it (`moneyInAsk`). */
export interface WaitingMoney {
  readonly kind: 'pay' | 'bonus' | 'payback' | 'other';
  /** Who paid back, for a payback of owed lines that names someone. */
  readonly name: string | null;
}

/** What one day's close reminder says besides "It's six." Most important first. */
export type CloseLine =
  | { readonly kind: 'jarReady'; readonly jarId: string; readonly reason: JarReadyReason }
  | {
      readonly kind: 'countdown';
      /** Days to mùng 1. */
      readonly left: number;
      /** The season's jar, when there is one holding something. */
      readonly jarId: string | null;
      readonly held: Money;
    }
  | { readonly kind: 'money'; readonly what: WaitingMoney['kind']; readonly name: string | null }
  | { readonly kind: 'yearCard'; readonly year: number }
  | { readonly kind: 'plain' };

/** What is known ahead about the coming days, for their close reminders' words. */
export interface CloseNews {
  readonly jars: readonly MatchableJar[];
  readonly saved: Readonly<Record<string, Money>>;
  /** The ready moments the close already showed on this phone (`readyKey`). */
  readonly readyShown: ReadonlySet<string>;
  /** Whose Lunar New Year the person keeps; null for none. */
  readonly tradition: LunarTradition | null;
  /** The season's jar, when there is one. */
  readonly seasonJarId: string | null;
  /** Money in caught and not yet placed: still waiting on every day until a close places it. */
  readonly waiting: readonly WaitingMoney[];
  /** The year card can be opened: it rides in 31 December's reminder. */
  readonly yearCard: boolean;
}

const MONEY_ORDER: readonly WaitingMoney['kind'][] = ['pay', 'bonus', 'payback', 'other'];

/**
 * The one line a day's close reminder carries, in order: a jar ready (full, or its month come),
 * the Lunar New Year countdown, money waiting to be placed (the pay, then a bonus, then a
 * payback, then anything else), the year card on 31 December, else the plain line.
 */
export function closeLineFor(day: LocalDate, news: CloseNews): CloseLine {
  const ready = readyJarFor(news.jars, news.saved, day, news.readyShown);
  if (ready !== null) return { kind: 'jarReady', jarId: ready.jar.id, reason: ready.reason };
  const season = seasonDay(day, news.tradition);
  if (season?.kind === 'countdown') {
    const held = news.seasonJarId === null ? 0 : (news.saved[news.seasonJarId] ?? 0);
    return {
      kind: 'countdown',
      left: season.left,
      jarId: held > 0 ? news.seasonJarId : null,
      held: Math.max(0, held),
    };
  }
  for (const what of MONEY_ORDER) {
    const money = news.waiting.find((w) => w.kind === what);
    if (money) return { kind: 'money', what, name: what === 'payback' ? money.name : null };
  }
  if (news.yearCard && day.slice(5) === '12-31') {
    return { kind: 'yearCard', year: parts(day).year };
  }
  return { kind: 'plain' };
}

/** When "Remind me" on an owed line comes back. */
export type RemindChoice = 'threeDays' | 'week' | 'payday';

/** The day a "Remind me" lands on: in 3 days, in a week, or on the coming payday. */
export function remindDayFor(choice: RemindChoice, today: LocalDate, payday: LocalDate): LocalDate {
  if (choice === 'threeDays') return addDays(today, 3);
  if (choice === 'week') return addDays(today, 7);
  return payday > today ? payday : addDays(today, 1);
}

/** The instant a "Remind me" fires: 10:00 on its day. */
export function remindAtFor(choice: RemindChoice, today: LocalDate, payday: LocalDate): Date {
  return atClock(remindDayFor(choice, today, payday), REMIND_AT);
}

/**
 * When to ask about a way that caught before and then went quiet: 09:00 on its third quiet day,
 * and never within a week of the last time it was asked about (`told`, an instant already past).
 */
export function quietWayAt(lastCatch: LocalDate, told: Date | null): Date {
  let day = addDays(lastCatch, QUIET_WAY_AFTER_DAYS);
  if (told !== null) {
    const again = addDays(localDateOf(told), QUIET_WAY_EVERY_DAYS);
    if (again > day) day = again;
  }
  return atClock(day, QUIET_WAY_AT);
}

/** An owed line as reminders read it. */
export interface OwedReminderLine {
  /** Who owes it: `personKey` of the name, or the line's own key with no name. */
  readonly key: string;
  readonly name: string | null;
  readonly amount: Money;
  /** When the person asked to be reminded: an instant, or null for never. */
  readonly remindAt: string | null;
}

/** One person a reminder names. */
export interface OwedReminder {
  readonly key: string;
  readonly name: string | null;
  readonly amount: Money;
}

/** A way that runs by itself and has caught before. */
export interface QuietWayInput {
  /** The source it catches with (`alert`, `applePay`). */
  readonly way: string;
  /** The day it last caught something, or was last seen running. */
  readonly lastCatch: LocalDate;
  /** The bank the alerts came from, for "Nothing from MB". */
  readonly bank: string | null;
  /** When it was last asked about: an instant, or null for never. */
  readonly told: string | null;
}

export type PlannedNotification =
  | {
      readonly kind: 'close';
      readonly id: string;
      readonly day: LocalDate;
      readonly at: Date;
      readonly line: CloseLine;
    }
  | { readonly kind: 'payday'; readonly id: string; readonly day: LocalDate; readonly at: Date }
  | {
      readonly kind: 'reminders';
      readonly id: string;
      readonly day: LocalDate;
      readonly at: Date;
      /** Most owed first. */
      readonly people: readonly OwedReminder[];
    }
  | {
      readonly kind: 'capture';
      readonly id: string;
      readonly day: LocalDate;
      readonly at: Date;
      readonly way: string;
      readonly bank: string | null;
      /** Days since it last caught: 3, or more when the week between asks pushed it on. */
      readonly days: number;
    };

export interface ReminderPlanInput {
  readonly now: Date;
  /** Each kind's switch. */
  readonly on: Readonly<Record<NotificationKind, boolean>>;
  /** The close time, or null before there is a plan. */
  readonly closeAt: ClockTime | null;
  readonly closedDays: ReadonlySet<LocalDate>;
  readonly news: CloseNews;
  /** The coming payday, or null when it varies (the person says when the money came). */
  readonly payday: LocalDate | null;
  /** Open owed lines; those with a `remindAt` are reminded. */
  readonly owed: readonly OwedReminderLine[];
  readonly quietWays: readonly QuietWayInput[];
}

/** Which of a day's other notifications wins the one place beside the close reminder. */
const RANK: Readonly<Record<Exclude<NotificationKind, 'close'>, number>> = {
  reminders: 3,
  payday: 2,
  capture: 1,
};

type Other = Exclude<PlannedNotification, { kind: 'close' }>;

function owedByDay(lines: readonly OwedReminderLine[], now: Date): Other[] {
  const people = new Map<string, { at: Date; reminder: OwedReminder }>();
  for (const line of lines) {
    if (line.remindAt === null) continue;
    const set = new Date(line.remindAt);
    if (Number.isNaN(set.getTime())) continue;
    const at = pastQuietHours(set);
    if (at.getTime() <= now.getTime()) continue;
    const known = people.get(line.key);
    const amount = (known?.reminder.amount ?? 0) + line.amount;
    const earliest = known && known.at.getTime() < at.getTime() ? known.at : at;
    people.set(line.key, {
      at: earliest,
      reminder: { key: line.key, name: known?.reminder.name ?? line.name, amount },
    });
  }
  const last = addDays(localDateOf(now), REMINDER_DAYS_AHEAD);
  const days = new Map<LocalDate, { at: Date; people: OwedReminder[] }>();
  for (const { at, reminder } of people.values()) {
    const day = localDateOf(at);
    if (day > last) continue;
    const known = days.get(day);
    if (known) {
      known.people.push(reminder);
      if (at.getTime() < known.at.getTime()) known.at = at;
    } else {
      days.set(day, { at, people: [reminder] });
    }
  }
  return [...days].map(([day, { at, people: named }]) => ({
    kind: 'reminders',
    id: `owed-remind:${day}`,
    day,
    at,
    people: [...named].sort((a, b) => b.amount - a.amount),
  }));
}

/**
 * Everything to schedule from `now`, as a list rebuilt whole each time. One ping a day is the
 * ritual, so the close reminder (at the time the person chose, on each day not closed yet) carries
 * the day's news in its words; beside it at most one other notification a day, the most useful
 * winning: a reminder the person set, then payday, then a way gone quiet. Nothing but the close
 * reminder goes out between 22:00 and 08:00. On the day payday's notification goes, the close
 * reminder stays plain: the morning already said it. A switch turned off sends nothing of its kind.
 */
export function planReminders(input: ReminderPlanInput): PlannedNotification[] {
  const { now, on } = input;
  const others: Other[] = [];
  const ahead = (at: Date) => at.getTime() > now.getTime() && !inQuietHours(at);

  if (on.payday && input.payday !== null) {
    const at = atClock(input.payday, PAYDAY_AT);
    if (ahead(at))
      others.push({ kind: 'payday', id: `payday:${input.payday}`, day: input.payday, at });
  }
  if (on.reminders) others.push(...owedByDay(input.owed, now));
  if (on.capture) {
    for (const way of input.quietWays) {
      const told = way.told === null ? null : new Date(way.told);
      const past = told !== null && !Number.isNaN(told.getTime()) && told <= now ? told : null;
      const at = quietWayAt(way.lastCatch, past);
      if (!ahead(at)) continue;
      others.push({
        kind: 'capture',
        id: `capture-quiet:${way.way}`,
        day: localDateOf(at),
        at,
        way: way.way,
        bank: way.bank,
        days: diffDays(localDateOf(at), way.lastCatch),
      });
    }
  }

  // At most one beside the close reminder each day: the best ranked, the earliest on a tie.
  const kept = new Map<LocalDate, Other>();
  for (const other of others) {
    const known = kept.get(other.day);
    const better =
      known === undefined ||
      RANK[other.kind] > RANK[known.kind] ||
      (RANK[other.kind] === RANK[known.kind] && other.at.getTime() < known.at.getTime());
    if (better) kept.set(other.day, other);
  }

  const planned: PlannedNotification[] = [...kept.values()];
  if (on.close && input.closeAt !== null) {
    // A jar named ready on one day is shown by that day's close: the days after say their own news.
    const shown = new Set(input.news.readyShown);
    for (const slot of closeRemindersAhead(now, input.closeAt, input.closedDays)) {
      const paydaySent = kept.get(slot.day)?.kind === 'payday';
      const line: CloseLine = paydaySent
        ? { kind: 'plain' }
        : closeLineFor(slot.day, { ...input.news, readyShown: shown });
      if (line.kind === 'jarReady') shown.add(readyKey(line.jarId, line.reason));
      planned.push({
        kind: 'close',
        id: `close-reminder:${slot.day}`,
        day: slot.day,
        at: slot.at,
        line,
      });
    }
  }
  return planned.sort((a, b) => a.at.getTime() - b.at.getTime());
}
