import { describe, expect, it } from 'vitest';

import type { MatchableJar } from '../close/jar-match';
import {
  atClock,
  closeLineFor,
  inQuietHours,
  pastQuietHours,
  planReminders,
  quietWayAt,
  remindAtFor,
  remindDayFor,
  type CloseNews,
  type NotificationKind,
  type OwedReminderLine,
  type ReminderPlanInput,
} from './reminder-day';

const jar = (over: Partial<MatchableJar> & Pick<MatchableJar, 'id'>): MatchableJar => ({
  kind: 'occasion',
  icon: 'flight',
  goal: 6_000_000,
  neededBy: null,
  paused: false,
  archivedAt: null,
  ...over,
});

const daLat = jar({ id: 'dalat', neededBy: '2027-01' });
const tetJar = jar({ id: 'tet', season: 'newYear', neededBy: '2027-02', goal: 9_000_000 });

const quiet: CloseNews = {
  jars: [],
  saved: {},
  readyShown: new Set(),
  tradition: null,
  seasonJarId: null,
  waiting: [],
  yearCard: false,
};

const allOn: Record<NotificationKind, boolean> = {
  close: true,
  payday: true,
  capture: true,
  reminders: true,
};

const plan = (over: Partial<ReminderPlanInput> = {}): ReminderPlanInput => ({
  now: new Date(2026, 10, 25, 12, 0),
  on: allOn,
  closeAt: '18:00',
  closedDays: new Set(),
  news: quiet,
  payday: null,
  owed: [],
  quietWays: [],
  ...over,
});

const linh = (remindAt: string | null, amount = 300_000): OwedReminderLine => ({
  key: 'linh',
  name: 'Linh',
  amount,
  remindAt,
});

describe("what a day's close reminder says", () => {
  it('names a jar whose month has come, before anything else', () => {
    const news: CloseNews = {
      ...quiet,
      jars: [daLat, tetJar],
      saved: { dalat: 4_000_000, tet: 7_200_000 },
      tradition: 'tet',
      seasonJarId: 'tet',
      waiting: [{ kind: 'pay', name: null }],
      yearCard: true,
    };
    // 31 Jan 2027: the Đà Lạt jar's month, the Tết countdown, the pay waiting.
    expect(closeLineFor('2027-01-31', news)).toEqual({
      kind: 'jarReady',
      jarId: 'dalat',
      reason: 'date',
    });
  });

  it('names a full jar too, and never one the close already celebrated', () => {
    const full = { ...quiet, jars: [daLat], saved: { dalat: 6_000_000 } };
    expect(closeLineFor('2026-11-25', full)).toEqual({
      kind: 'jarReady',
      jarId: 'dalat',
      reason: 'full',
    });
    expect(closeLineFor('2026-11-25', { ...full, readyShown: new Set(['dalat:full']) })).toEqual({
      kind: 'plain',
    });
  });

  it('counts down to Tết from 23 tháng Chạp with what the Tết jar holds', () => {
    const news = {
      ...quiet,
      jars: [tetJar],
      saved: { tet: 7_200_000 },
      tradition: 'tet' as const,
      seasonJarId: 'tet',
    };
    expect(closeLineFor('2027-01-29', news)).toEqual({ kind: 'plain' });
    expect(closeLineFor('2027-01-30', news)).toEqual({
      kind: 'countdown',
      left: 7,
      jarId: 'tet',
      held: 7_200_000,
    });
    // On mùng 1 the countdown is over, and the jar's own month has come.
    expect(closeLineFor('2027-02-06', news)).toEqual({
      kind: 'jarReady',
      jarId: 'tet',
      reason: 'date',
    });
  });

  it('counts down without a jar for someone who has none, and not at all for no tradition', () => {
    const news = { ...quiet, tradition: 'tet' as const };
    expect(closeLineFor('2027-02-01', news)).toEqual({
      kind: 'countdown',
      left: 5,
      jarId: null,
      held: 0,
    });
    expect(closeLineFor('2027-02-01', quiet)).toEqual({ kind: 'plain' });
  });

  it('names money waiting: the pay before a bonus before a payback', () => {
    const news: CloseNews = {
      ...quiet,
      waiting: [
        { kind: 'other', name: null },
        { kind: 'payback', name: 'Linh' },
        { kind: 'bonus', name: null },
      ],
    };
    expect(closeLineFor('2026-11-25', news)).toEqual({ kind: 'money', what: 'bonus', name: null });
    const payback = { ...quiet, waiting: [{ kind: 'payback' as const, name: 'Linh' }] };
    expect(closeLineFor('2026-11-25', payback)).toEqual({
      kind: 'money',
      what: 'payback',
      name: 'Linh',
    });
  });

  it('offers the year card only on 31 December and only when it is there', () => {
    expect(closeLineFor('2026-12-31', { ...quiet, yearCard: true })).toEqual({
      kind: 'yearCard',
      year: 2026,
    });
    expect(closeLineFor('2026-12-30', { ...quiet, yearCard: true })).toEqual({ kind: 'plain' });
    expect(closeLineFor('2026-12-31', quiet)).toEqual({ kind: 'plain' });
  });
});

describe('quiet hours', () => {
  it('runs from 22:00 to 08:00', () => {
    expect(inQuietHours(new Date(2026, 10, 25, 21, 59))).toBe(false);
    expect(inQuietHours(new Date(2026, 10, 25, 22, 0))).toBe(true);
    expect(inQuietHours(new Date(2026, 10, 26, 7, 59))).toBe(true);
    expect(inQuietHours(new Date(2026, 10, 26, 8, 0))).toBe(false);
  });

  it('moves anything in them to 08:00 the next morning', () => {
    expect(pastQuietHours(new Date(2026, 10, 25, 23, 30))).toEqual(new Date(2026, 10, 26, 8, 0));
    expect(pastQuietHours(new Date(2026, 10, 26, 6, 0))).toEqual(new Date(2026, 10, 26, 8, 0));
    const noon = new Date(2026, 10, 26, 12, 0);
    expect(pastQuietHours(noon)).toBe(noon);
  });

  it('still lets the close reminder ring at a late close time', () => {
    const late = planReminders(plan({ closeAt: '23:30', now: new Date(2026, 10, 25, 22, 0) }));
    expect(late[0]).toMatchObject({ kind: 'close', at: new Date(2026, 10, 25, 23, 30) });
  });

  it('sends a reminder the person set for the night in the morning instead', () => {
    const owed = [linh(new Date(2026, 10, 28, 23, 0).toISOString())];
    const [first] = planReminders(plan({ on: { ...allOn, close: false }, owed }));
    expect(first).toMatchObject({ kind: 'reminders', at: new Date(2026, 10, 29, 8, 0) });
  });
});

describe('at most two a day', () => {
  it('sends one close reminder naming the jar on a day with a jar due and the countdown', () => {
    const news: CloseNews = {
      ...quiet,
      jars: [daLat, tetJar],
      saved: { dalat: 4_000_000, tet: 7_200_000 },
      tradition: 'tet',
      seasonJarId: 'tet',
    };
    const day = planReminders(plan({ now: new Date(2027, 0, 31, 9, 0), news })).filter(
      (n) => n.day === '2027-01-31',
    );
    expect(day).toHaveLength(1);
    expect(day[0]).toMatchObject({ kind: 'close', line: { kind: 'jarReady', jarId: 'dalat' } });
  });

  it('keeps payday and the close reminder, and leaves that close reminder plain', () => {
    const news = { ...quiet, waiting: [{ kind: 'pay' as const, name: null }] };
    const all = planReminders(plan({ payday: '2026-11-30', news }));
    const payday = all.filter((n) => n.day === '2026-11-30');
    expect(payday.map((n) => n.kind)).toEqual(['payday', 'close']);
    expect(payday[0]?.at).toEqual(new Date(2026, 10, 30, 8, 30));
    expect(payday[1]).toMatchObject({ line: { kind: 'plain' } });
    // The day before still names the pay waiting.
    expect(all.find((n) => n.id === 'close-reminder:2026-11-29')).toMatchObject({
      line: { kind: 'money', what: 'pay' },
    });
  });

  it('lets a reminder the person set win over payday, and the close reminder keeps its news', () => {
    const news = { ...quiet, waiting: [{ kind: 'pay' as const, name: null }] };
    const owed = [linh(atClock('2026-11-30', '10:00').toISOString())];
    const day = planReminders(plan({ payday: '2026-11-30', news, owed })).filter(
      (n) => n.day === '2026-11-30',
    );
    expect(day.map((n) => n.kind)).toEqual(['reminders', 'close']);
    expect(day[1]).toMatchObject({ line: { kind: 'money', what: 'pay' } });
  });

  it('puts payday ahead of a way gone quiet', () => {
    const quietWays = [{ way: 'alert', lastCatch: '2026-11-27', bank: 'MB', told: null }];
    const day = planReminders(plan({ payday: '2026-11-30', quietWays })).filter(
      (n) => n.day === '2026-11-30',
    );
    expect(day.map((n) => n.kind)).toEqual(['payday', 'close']);
  });

  it('names everyone due a reminder on one day in one notification, most owed first', () => {
    const at = atClock('2026-11-28', '10:00').toISOString();
    const owed: OwedReminderLine[] = [
      linh(at, 100_000),
      { key: 'nam', name: 'Nam', amount: 250_000, remindAt: at },
      linh(at, 200_000),
    ];
    const day = planReminders(plan({ owed })).filter((n) => n.kind === 'reminders');
    expect(day).toHaveLength(1);
    expect(day[0]).toMatchObject({
      id: 'owed-remind:2026-11-28',
      people: [
        { key: 'linh', name: 'Linh', amount: 300_000 },
        { key: 'nam', name: 'Nam', amount: 250_000 },
      ],
    });
  });
});

describe('remind me', () => {
  it('lands in 3 days, in a week, or on payday, at 10:00', () => {
    expect(remindDayFor('threeDays', '2026-11-25', '2026-11-30')).toBe('2026-11-28');
    expect(remindDayFor('week', '2026-11-25', '2026-11-30')).toBe('2026-12-02');
    expect(remindDayFor('payday', '2026-11-25', '2026-11-30')).toBe('2026-11-30');
    expect(remindAtFor('threeDays', '2026-11-25', '2026-11-30')).toEqual(
      new Date(2026, 10, 28, 10, 0),
    );
  });

  it('fires once, at 10:00 on the third day', () => {
    const owed = [linh(remindAtFor('threeDays', '2026-11-25', '2026-11-30').toISOString())];
    const reminders = planReminders(plan({ owed })).filter((n) => n.kind === 'reminders');
    expect(reminders).toEqual([
      expect.objectContaining({
        day: '2026-11-28',
        at: new Date(2026, 10, 28, 10, 0),
        people: [{ key: 'linh', name: 'Linh', amount: 300_000 }],
      }),
    ]);
  });

  it('sends nothing once the line is settled (gone from the open lines) or the time has passed', () => {
    expect(planReminders(plan({ owed: [] })).some((n) => n.kind === 'reminders')).toBe(false);
    const past = [linh(new Date(2026, 10, 24, 10, 0).toISOString())];
    expect(planReminders(plan({ owed: past })).some((n) => n.kind === 'reminders')).toBe(false);
    expect(planReminders(plan({ owed: [linh(null)] })).some((n) => n.kind === 'reminders')).toBe(
      false,
    );
  });
});

describe('a way gone quiet', () => {
  it('is asked about at 09:00 on the third quiet day', () => {
    expect(quietWayAt('2026-11-25', null)).toEqual(new Date(2026, 10, 28, 9, 0));
  });

  it('is asked about at most once a week', () => {
    expect(quietWayAt('2026-11-25', new Date(2026, 10, 24, 9, 0))).toEqual(
      new Date(2026, 11, 1, 9, 0),
    );
    expect(quietWayAt('2026-11-25', new Date(2026, 10, 10, 9, 0))).toEqual(
      new Date(2026, 10, 28, 9, 0),
    );
  });

  it('counts a notice still waiting to go as not yet told', () => {
    const quietWays = [
      { way: 'alert', lastCatch: '2026-11-24', bank: 'MB', told: '2026-11-27T02:00:00.000Z' },
    ];
    const [first] = planReminders(plan({ quietWays, on: { ...allOn, close: false } }));
    expect(first).toMatchObject({
      kind: 'capture',
      id: 'capture-quiet:alert',
      day: '2026-11-27',
      days: 3,
    });
  });
});

describe('the switches', () => {
  const everything = plan({
    payday: '2026-11-30',
    owed: [linh(atClock('2026-11-28', '10:00').toISOString())],
    quietWays: [{ way: 'applePay', lastCatch: '2026-11-24', bank: null, told: null }],
  });
  const kinds = (input: ReminderPlanInput) => new Set(planReminders(input).map((n) => n.kind));

  it('sends every kind while every switch is on', () => {
    expect(kinds(everything)).toEqual(new Set(['close', 'payday', 'reminders', 'capture']));
  });

  it('turning Capture off stops only the capture ones', () => {
    expect(kinds({ ...everything, on: { ...allOn, capture: false } })).toEqual(
      new Set(['close', 'payday', 'reminders']),
    );
  });

  it('turning the close reminder off leaves the others', () => {
    expect(kinds({ ...everything, on: { ...allOn, close: false } })).toEqual(
      new Set(['payday', 'reminders', 'capture']),
    );
  });

  it('skips days already closed', () => {
    const closed = planReminders(plan({ closedDays: new Set(['2026-11-25']) }));
    expect(closed.some((n) => n.id === 'close-reminder:2026-11-25')).toBe(false);
    expect(closed.some((n) => n.id === 'close-reminder:2026-11-26')).toBe(true);
  });
});
