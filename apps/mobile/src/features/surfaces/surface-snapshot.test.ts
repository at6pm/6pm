import { describe, expect, it } from '@jest/globals';

import {
  formatShort,
  futureYouPotRow,
  moneyFormat,
  moneyLocale,
  payCycleOn,
  VND,
  surfaceContextSchema,
  surfaceSnapshotSchema,
  type CategoryRow,
  type ClosedDayRow,
  type PotRow,
  type SpendRow,
  type SurfaceSnapshot,
} from '@6pm/domain';
import { t as translate, type Language } from '@6pm/i18n';
import { paletteFor } from '@6pm/theme';

import { dayOf, NO_JAR_FIELDS, type MoneySnapshot } from '../../data/money-store';
import { DEFAULT_PLAN } from '../../data/plan-settings';
import type { I18n } from '../../i18n/i18n';
import { contextStrings, hostOf, surfaceContext } from './surface-context';
import { displayFamily, SYSTEM_DISPLAY, widgetLook, widgetTokens } from './surface-palette';
import {
  glyphOf,
  moneyDayStart,
  nextMoneyDay,
  snapshotKey,
  surfaceSnapshot,
} from './surface-snapshot';

const stamp = '2026-10-09T05:00:00.000Z';
const food: CategoryRow = {
  id: 'food',
  name: 'Food',
  icon: 'restaurant',
  hue: 45,
  countsDaily: true,
  sort: 0,
  archivedAt: null,
};

let n = 0;
function spend(day: string, amount: number, extra: Partial<SpendRow> = {}): SpendRow {
  n += 1;
  return {
    id: `s${n}`,
    day,
    at: `${day}T0${n % 10}:00:00.000Z`,
    amount,
    categoryId: 'food',
    merchant: `Shop ${n}`,
    note: null,
    source: 'manual',
    status: 'kept',
    previousStatus: null,
    wallet: null,
    forWork: false,
    detail: null,
    foreignAmount: null,
    createdAt: stamp,
    updatedAt: stamp,
    ...extra,
  };
}

function money(today: string, cycleSpends: SpendRow[], serious = false): MoneySnapshot {
  return {
    today,
    plan: { ...DEFAULT_PLAN, income: 12_000_000, futureYou: 1_000_000, serious },
    cycle: payCycleOn(today, { kind: 'lastDay' }),
    categories: [food],
    cycleSpends,
    waitingBefore: [],
    bills: [],
    pots: [],
    potSaved: {},
    topUpsThisCycle: 0,
    setAsideThisCycle: {},
    closedDays: [],
    ...NO_JAR_FIELDS,
  };
}

const words =
  (language: Language): I18n['t'] =>
  (key, ...params) =>
    translate(language, key, ...params);
const en = words('en');
const vi = words('vi');

const golden = widgetLook({ max: false, look: 'paper', serious: false });
const writtenAt = new Date('2026-10-09T11:07:00.000Z');

function snapshotOf(
  m: MoneySnapshot,
  language: Language = 'en',
  extra: Partial<Parameters<typeof surfaceSnapshot>[0]> = {},
) {
  const t = language === 'vi' ? vi : en;
  const format = moneyFormat(moneyLocale(VND, language));
  return surfaceSnapshot({
    money: m,
    look: golden,
    maxLook: null,
    t,
    format,
    language,
    writtenAt,
    ...extra,
  });
}

/** Each money day's first stretch, from its 04:00: today's, then tomorrow's. */
function firstOfEachDay(snap: SurfaceSnapshot) {
  return snap.entries.filter((e) => new Date(e.from).getHours() === 4);
}

/** The stretch shown at a time of the snapshot's day ("13:00", "18:00"). */
function stretchAt(snap: SurfaceSnapshot, day: string, time: string) {
  const at = new Date(`${day}T${time}:00`).getTime();
  return [...snap.entries].reverse().find((e) => new Date(e.from).getTime() <= at);
}

function closedDay(day: string, closedAt: string, spent = 100_000, line = 300_000): ClosedDayRow {
  return { day, closedAt, late: false, spent, line, tomorrow: 300_000, note: null };
}

describe('surfaceSnapshot', () => {
  const today = '2026-10-09';
  const spends = [
    spend(today, 25_000, { merchant: 'Bánh mì Cô Ba' }),
    spend(today, 45_000, { merchant: 'Phở Hòa', source: 'qr', status: 'pending' }),
    spend(today, 45_000, { merchant: 'Trà sữa' }),
    spend(today, 30_000),
    spend(today, 20_000, { status: 'skipped' }),
    spend(today, 15_000),
    spend('2026-10-08', 120_000),
  ];

  it('shows the same number as Today, and tomorrow’s line from the next 04:00', () => {
    const m = money(today, spends);
    const snap = snapshotOf(m);
    const day = dayOf(m);
    expect(day).not.toBeNull();
    if (day === null) return;
    expect(surfaceSnapshotSchema.parse(snap)).toEqual(snap);
    const [now, next] = firstOfEachDay(snap);
    expect(now?.safeShort).toBe(formatShort(Math.max(0, day.safe), 'en'));
    expect(now?.safeText).toBe(`${formatShort(day.safe, 'en')} left`);
    expect(now?.tomorrowText).toBe(`Tomorrow ≈ ${formatShort(day.tomorrow, 'en')}`);
    expect(now?.from).toBe(new Date(2026, 9, 9, 4, 0, 0).toISOString());
    expect(next?.from).toBe(new Date(2026, 9, 10, 4, 0, 0).toISOString());
    // Nothing spent yet tomorrow: the whole line is safe.
    expect(next?.safeShort).toBe(formatShort(day.tomorrow, 'en'));
    expect(next?.list).toEqual([]);
    expect(next?.ringFraction).toBe(1);
  });

  it('fills the ring with what is left of the line, and empties it once the day is over', () => {
    const m = money(today, spends);
    const day = dayOf(m);
    if (day === null) throw new Error('no day');
    expect(snapshotOf(m).entries[0]?.ringFraction).toBeCloseTo(1 - day.spent / day.line);
    const over = money(today, [spend(today, 5_000_000)]);
    expect(snapshotOf(over).entries[0]?.safeShort).toBe('0k');
    expect(snapshotOf(over).entries[0]?.ringFraction).toBe(0);
  });

  it('lists three of today’s spends, newest first, then "+N more"; skipped ones are left out', () => {
    const entry = snapshotOf(money(today, spends)).entries[0];
    expect(entry?.list.map((r) => r.name)).toEqual(['Bánh mì Cô Ba', 'Phở Hòa', 'Trà sữa']);
    expect(entry?.list.map((r) => r.amountText)).toEqual(['25.000₫', '45.000₫', '45.000₫']);
    expect(entry?.list.map((r) => r.icon)).toEqual([
      glyphOf('bakery_dining'),
      glyphOf('ramen_dining'),
      glyphOf('emoji_food_beverage'),
    ]);
    expect(entry?.list.map((r) => r.pending)).toEqual([false, true, false]);
    expect(entry?.moreText).toBe('+2 more');
    expect(entry?.moreAmountText).toBe('45.000₫');
    expect(entry?.pendingText).toBe('1 pending');
  });

  it('carries the day’s spend against its line for the large widget’s bar', () => {
    const m = money(today, spends);
    const day = dayOf(m);
    if (day === null) throw new Error('no day');
    const [now, next] = firstOfEachDay(snapshotOf(m));
    expect(now?.spentText).toBe(`${formatShort(day.spent, 'en')} spent`);
    expect(now?.lineText).toBe(`of ${formatShort(day.line, 'en')}`);
    expect(now?.spentFraction).toBeCloseTo(day.spent / day.line);
    expect(next?.spentFraction).toBe(0);
    expect(next?.moreAmountText).toBe('');
  });

  it('gives the companion the mood of each hour: waving in the morning, sleepy late', () => {
    const snap = snapshotOf(money(today, spends));
    expect(snap.palettes[7]?.tokens['mood']).toBe('wave');
    expect(snap.palettes[13]?.tokens['mood']).toBe('calm');
    expect(snap.palettes[23]?.tokens['mood']).toBe('sleepy');
    const over = snapshotOf(money(today, [spend(today, 5_000_000)]));
    expect(over.palettes[13]?.tokens['mood']).toBe('nod');
  });

  it('carries the tile colours of every listed hue', () => {
    const snap = snapshotOf(money(today, spends));
    expect(snap.strings['tile.45.from']).toMatch(/^#[0-9a-f]{6}$/);
    expect(snap.strings['tile.45.glyph']).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('starts a fresh cycle when the next money day is payday', () => {
    const eve = '2026-10-30';
    const m = money(eve, [spend(eve, 400_000), spend('2026-10-20', 900_000)]);
    const next = nextMoneyDay(m);
    expect(next.today).toBe('2026-10-31');
    expect(next.cycle.start).not.toBe(m.cycle.start);
    expect(next.cycleSpends).toEqual([]);
    const fresh = dayOf(next);
    if (fresh === null) throw new Error('no day');
    expect(firstOfEachDay(snapshotOf(m))[1]?.safeShort).toBe(formatShort(fresh.safe, 'en'));
  });

  it('writes no entries before the month is set up, and the words to ask for it', () => {
    const snap = snapshotOf({ ...money(today, []), plan: null });
    expect(snap.entries).toEqual([]);
    expect(snap.strings['setUp']).toBe('Open 6pm to set up');
  });

  it('words everything in the app’s language', () => {
    const snap = snapshotOf(money(today, spends), 'vi');
    expect(snap.entries[0]?.tomorrowText.startsWith('Ngày mai ≈ ')).toBe(true);
    expect(snap.entries[0]?.moreText).toBe('+2 khoản nữa');
    expect(snap.strings['scanQr']).toBe('Quét QR');
  });

  it('draws free widgets in Golden Hour and Max widgets in the user’s look', () => {
    const free = snapshotOf(money(today, spends));
    expect(free.maxLook).toBeNull();
    expect(free.palettes).toHaveLength(24);
    expect(free.palettes[18]?.tokens).toMatchObject(
      widgetTokens(paletteFor({ look: 'golden', hour: 18, serious: false })),
    );
    const paper = widgetLook({ max: true, look: 'paper', serious: false });
    const max = surfaceSnapshot({
      money: money(today, spends),
      look: paper,
      maxLook: 'paper',
      t: en,
      format: moneyFormat(moneyLocale(VND, 'en')),
      writtenAt,
    });
    expect(max.maxLook).toBe('paper');
    expect(max.palettes[18]?.tokens).toMatchObject(
      widgetTokens(paletteFor({ look: 'paper', hour: 18, serious: false })),
    );
    expect(max.strings['font.display']).toBe('Grandstander');
    expect(free.strings['font.display']).toBe('BricolageGrotesque');
    const face = (look: 'lacquer' | 'basic') => displayFamily({ look, serious: false });
    expect([face('lacquer'), face('basic')]).toEqual(['Prata-Regular', SYSTEM_DISPLAY]);
  });

  it('uses the serious palette in serious mode', () => {
    const look = widgetLook({ max: true, look: 'neon', serious: true });
    const snap = surfaceSnapshot({
      money: money(today, spends, true),
      look,
      maxLook: 'neon',
      t: en,
      format: moneyFormat(moneyLocale(VND, 'en')),
      writtenAt,
    });
    expect(snap.serious).toBe(true);
    expect(snap.palettes[12]?.tokens).toMatchObject(
      widgetTokens(paletteFor({ look: 'neon', hour: 12, serious: true })),
    );
  });

  it('compares equal when only the write time differs', () => {
    const m = money(today, spends);
    const a = snapshotOf(m);
    const b = surfaceSnapshot({
      money: m,
      look: golden,
      maxLook: null,
      t: en,
      format: moneyFormat(moneyLocale(VND, 'en')),
      writtenAt: new Date(writtenAt.getTime() + 60_000),
    });
    expect(snapshotKey(a)).toBe(snapshotKey(b));
    expect(moneyDayStart('2026-10-09').getHours()).toBe(4);
  });
});

describe('the postcards', () => {
  const today = '2026-10-09';
  const spends = [
    spend(today, 25_000, { merchant: 'Bánh mì Cô Ba' }),
    spend(today, 45_000, { merchant: 'Phở Hòa', source: 'qr', status: 'pending' }),
  ];

  it('turns six times a day, from each money day’s 04:00, for today and tomorrow', () => {
    const snap = snapshotOf(money(today, spends));
    expect(surfaceSnapshotSchema.parse(snap)).toEqual(snap);
    const times = snap.entries.map((e) => {
      const d = new Date(e.from);
      return `${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    });
    expect(times).toEqual([
      '9 4:00',
      '9 7:00',
      '9 10:00',
      '9 13:00',
      '9 16:30',
      '9 18:00',
      '9 21:00',
      '10 4:00',
      '10 7:00',
      '10 10:00',
      '10 13:00',
      '10 16:30',
      '10 18:00',
      '10 21:00',
    ]);
  });

  it('says the day before the close, and asks for the close from six', () => {
    const snap = snapshotOf(money(today, spends));
    const noon = stretchAt(snap, today, '13:00')?.card;
    expect(noon).toMatchObject({
      phase: 'day',
      kicker: 'FRIDAY · SAFE TO SPEND',
      kickerShort: 'FRI · TODAY',
      subShort: 'left today',
      lockSub: 'close at 18:00',
      tonight: 'Close at 18:00',
      sunKind: 'noon',
    });
    expect(noon?.sub).toMatch(/^70k used · 2 caught$/);
    expect(noon?.inline).toMatch(/^Fri 9 · .+ left$/);
    expect(noon?.inlineHidden).toBe('Fri 9 · ••• left');
    const six = stretchAt(snap, today, '18:30')?.card;
    expect(six).toMatchObject({
      phase: 'due',
      kicker: 'IT’S SIX · CLOSE YOUR DAY',
      sub: '1 waiting for the close',
      tonight: '1 to confirm',
      sunKind: 'dusk',
    });
  });

  it('follows the close the person set', () => {
    const m = money(today, spends);
    const late = { ...m, plan: m.plan ? { ...m.plan, closeAt: '19:30' } : null };
    const snap = snapshotOf(late);
    expect(stretchAt(snap, today, '18:30')?.card?.phase).toBe('day');
    expect(stretchAt(snap, today, '19:30')?.card).toMatchObject({ phase: 'due' });
  });

  it('carries tomorrow’s number once the day is closed', () => {
    const closedAt = new Date(`${today}T18:04:00`).toISOString();
    const m = { ...money(today, spends), closedDays: [closedDay(today, closedAt)] };
    const snap = snapshotOf(m);
    const night = stretchAt(snap, today, '21:00');
    const tomorrow = dayOf(nextMoneyDay(m));
    expect(night?.card).toMatchObject({
      phase: 'closed',
      kicker: 'CLOSED · TOMORROW',
      sub: 'Closed at 18:04',
      tonight: 'Closed 18:04',
      used: 0,
      sunKind: 'night',
    });
    expect(night?.safeShort).toBe(formatShort(Math.max(0, tomorrow?.safe ?? 0), 'en'));
    expect(night?.card?.inline).toBe(`Closed · ${night?.safeShort} tomorrow`);
  });

  it('words the postcards in Vietnamese', () => {
    const snap = snapshotOf(money(today, spends), 'vi');
    const noon = stretchAt(snap, today, '13:00')?.card;
    expect(noon?.kicker).toBe('THỨ SÁU · ĐƯỢC TIÊU HÔM NAY');
    expect(snap.strings['streakLine1']).toBe('TỐI');
    expect(snap.month?.title).toBe('THÁNG 10 · CHỐT LÚC SÁU GIỜ');
  });

  it('counts the evenings closed in a row and draws each as the sky it closed under', () => {
    const at = (day: string, time: string) => new Date(`${day}T${time}:00`).toISOString();
    const history = [
      closedDay('2026-10-05', at('2026-10-05', '18:04')),
      closedDay('2026-10-06', at('2026-10-06', '19:40')),
      closedDay('2026-10-07', at('2026-10-07', '18:10'), 400_000),
      closedDay('2026-10-08', at('2026-10-08', '18:30')),
    ];
    const snap = snapshotOf(money(today, spends), 'en', { closedHistory: history });
    expect(snap.streak?.count).toBe(4);
    expect(snap.streak?.open).toBe(true);
    expect(snap.streak?.bands).toHaveLength(4);
    const [first, second] = snap.streak?.bands ?? [];
    expect(first).toEqual(
      paletteFor({ look: 'golden', hour: 18 + 4 / 60, serious: false }).st.slice(0, 3),
    );
    expect(second).not.toEqual(first);
  });

  it('draws the month as suns, with how many came in under the line', () => {
    const at = new Date(`2026-10-08T18:04:00`).toISOString();
    const m = {
      ...money(today, spends),
      closedDays: [
        closedDay('2026-10-06', at),
        closedDay('2026-10-07', at, 400_000),
        closedDay('2026-10-08', at),
      ],
    };
    const snap = snapshotOf(m, 'en', { since: '2026-10-05' });
    expect(snap.month?.headline).toBe('3 sunsets, 2 inside the line.');
    expect(snap.month?.title).toBe('OCTOBER · CLOSED AT SIX');
    expect(snap.month?.cells.slice(7, 12)).toEqual(['miss', 'sun', 'half', 'sun', 'today']);
  });

  it('puts Future you first and counts the Tết jar down to mùng 1', () => {
    const tet: PotRow = {
      ...futureYouPotRow(stamp),
      id: 'tet',
      kind: 'occasion',
      name: 'Tết',
      icon: 'local_florist',
      hue: 25,
      goal: 7_000_000,
      neededBy: '2027-02',
      season: 'newYear',
    };
    const m = {
      ...money(today, spends),
      pots: [tet, futureYouPotRow(stamp)],
      potSaved: { tet: 3_100_000, futureYou: 18_900_000 },
    };
    const snap = snapshotOf(m, 'en', { tradition: 'tet' });
    expect(snap.jars?.map((j) => j.id)).toEqual(['futureYou', 'tet']);
    expect(snap.jars?.[1]).toMatchObject({
      name: 'Tết',
      label: 'TẾT',
      countText: '120',
      countUnit: 'days',
      dayText: 'Sat 6 Feb',
      newYear: true,
      path: '/app/pot/tet',
    });
    expect(snap.jars?.[1]?.ofText).toBe('3.1M of 7M');
    expect(snap.jars?.[1]?.level).toBeCloseTo(3.1 / 7);
  });

  it('carries the hide-amounts choice and the look’s widget materials', () => {
    const snap = snapshotOf(money(today, spends), 'en', { hideAmounts: true });
    expect(snap.hideAmounts).toBe(true);
    expect(snap.look?.id).toBe('golden');
    expect(snap.look?.jar.icon).toBe(true);
    expect(snap.links?.today).toBe('/app?tab=today');
  });
});

describe('surfaceContext', () => {
  it('keeps {amount} in the safe-after line for the domain to fill', () => {
    expect(contextStrings(en)).toMatchObject({
      today: 'Today',
      yesterday: 'Yesterday',
      safeAfter: 'Safe today is now {amount}',
    });
    expect(contextStrings(vi)['safeAfter']).toContain('{amount}');
  });

  it('keeps the placeholders the alert listener fills in its caught notification', () => {
    const strings = contextStrings(vi);
    expect(strings['alertCaught']).toContain('{amount}');
    expect(strings['alertCaught']).toContain('{name}');
    expect(strings['alertCameIn']).toContain('{name}');
    expect(strings['alertCaughtNoName']).toContain('{amount}');
    expect(strings['alertFrom']).toContain('{bank}');
    expect(contextStrings(en)['alertConfirm']).toBe('Confirm');
  });

  it('reads the host from the API base', () => {
    expect(hostOf('https://6pm-dev.oddeggs.studio/api')).toBe('6pm-dev.oddeggs.studio');
    expect(hostOf(undefined)).toBeNull();
  });

  it('files with the categories, the rules and today’s number', () => {
    const m = money('2026-10-09', []);
    const rule = {
      merchantKey: 'pho hoa',
      merchant: 'Phở Hòa',
      categoryId: 'food',
      learnedTimes: 2,
      setByUser: false,
    };
    const context = surfaceContext({
      money: m,
      rules: [rule],
      language: 'en',
      host: '6pm.oddeggs.studio',
      strings: contextStrings(en),
    });
    expect(surfaceContextSchema.parse(context)).toEqual(context);
    expect(context.safeToday).toBe(dayOf(m)?.safe);
    expect(context.rules).toEqual([{ key: 'pho hoa', categoryId: 'food' }]);
  });
});
