import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { localDateOf, type FunnelEvent } from '@6pm/domain';

import { moneyActions } from '../../data/money-actions';
import { createMoneyStore, type MoneyStore } from '../../data/money-store';
import { DEFAULT_PLAN, writePlan } from '../../data/plan-settings';
import { openMemoryDb } from '../backup/test/memory-db';
import {
  createFunnel,
  readFunnelSwitch,
  writeFunnelSwitch,
  type FunnelSendResult,
} from './funnel-counts';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

/** Spends are stamped with the real clock, so the funnel runs on it too. */
const TODAY = localDateOf(new Date());
const DAY_MS = 86_400_000;

describe('funnel counts on the phone', () => {
  let store: MoneyStore;
  let sent: FunnelEvent[][];
  let answer: FunnelSendResult;
  let clock: Date;

  const funnel = () =>
    createFunnel({
      db: store.db,
      send: (events) => {
        sent.push([...events]);
        return Promise.resolve(answer);
      },
      now: () => clock,
    });
  const steps = () => sent.flat().map((e) => e.step);

  beforeEach(() => {
    store = createMoneyStore(openMemoryDb(), TODAY);
    sent = [];
    answer = 'counted';
    clock = new Date();
  });

  it('counts a new copy’s first open once', async () => {
    const counts = funnel();
    await counts.report();
    await counts.report();
    expect(sent).toEqual([[{ step: 'first_open' }]]);
  });

  it('sends what the records show: the first catch by its way, and the first close', async () => {
    const counts = funnel();
    await counts.report();
    await writePlan(store.db, { ...DEFAULT_PLAN, startedOn: TODAY });
    await store.tables.categories.put({
      id: 'food',
      name: 'food',
      icon: 'restaurant',
      hue: 40,
      countsDaily: true,
      sort: 0,
      archivedAt: null,
    });
    await store.load(TODAY);
    const actions = moneyActions(store);
    await actions.addSpend({
      amount: 45_000,
      categoryId: 'food',
      merchant: 'Phở Hòa',
      source: 'alert',
      status: 'caught',
    });
    await actions.closeDay({
      day: TODAY,
      closedAt: new Date().toISOString(),
      late: false,
      spent: 45_000,
      line: 200_000,
      tomorrow: 210_000,
      note: null,
    });
    await counts.report();
    expect(sent[1]).toEqual([
      { step: 'first_capture', detail: 'alert', day: 0 },
      { step: 'capture', detail: 'alert', day: 0 },
      { step: 'capture_day', day: 0 },
      { step: 'auto_capture_day', day: 0 },
      { step: 'first_close', day: 0 },
      { step: 'close', day: 0 },
    ]);
    const payload = JSON.stringify(sent);
    expect(payload).not.toContain('Phở');
    expect(payload).not.toContain('45000');
  });

  it('counts the days it was opened again', async () => {
    const counts = funnel();
    await counts.report();
    clock = new Date(clock.getTime() + DAY_MS);
    await counts.report();
    clock = new Date(clock.getTime() + 6 * DAY_MS);
    await counts.report();
    expect(steps()).toEqual(
      expect.arrayContaining(['first_open', 'open', 'week_capture_days', 'week_closes']),
    );
    expect(sent.flat().filter((e) => e.step === 'open')).toEqual([
      { step: 'open', day: 1 },
      { step: 'open', day: 7 },
    ]);
  });

  it('counts nothing tied to a first open for a copy set up before counts began', async () => {
    await writePlan(store.db, { ...DEFAULT_PLAN, startedOn: TODAY });
    const counts = funnel();
    await counts.report();
    await counts.note({ step: 'max_shown', detail: 'looks' });
    await counts.report();
    expect(sent).toEqual([[{ step: 'max_shown', detail: 'looks' }]]);
  });

  it('sends a noted step once, however often it is noted', async () => {
    const counts = funnel();
    await counts.note({ step: 'onboarding_step', detail: 'welcome' });
    await counts.note({ step: 'onboarding_step', detail: 'welcome' });
    await counts.report();
    await counts.note({ step: 'onboarding_step', detail: 'welcome' });
    await counts.report();
    expect(steps()).toEqual(['first_open', 'onboarding_step']);
  });

  it('keeps steps for later when the server does not answer, and drops a refused report', async () => {
    const counts = funnel();
    answer = 'later';
    await counts.report();
    answer = 'counted';
    await counts.report();
    expect(sent).toEqual([[{ step: 'first_open' }], [{ step: 'first_open' }]]);

    answer = 'refused';
    await counts.note({ step: 'max_bought', detail: 'yearly' });
    await counts.report();
    answer = 'counted';
    await counts.report();
    expect(sent).toHaveLength(3);
  });

  it('sends nothing while switched off, and never sends later what was reached meanwhile', async () => {
    expect(await readFunnelSwitch(store.db)).toBe(true);
    await writeFunnelSwitch(store.db, false);
    const counts = funnel();
    await counts.note({ step: 'onboarding_step', detail: 'welcome' });
    await counts.report();
    expect(sent).toEqual([]);

    await writeFunnelSwitch(store.db, true);
    await counts.report();
    await counts.note({ step: 'max_shown', detail: 'ask' });
    await counts.report();
    expect(sent).toEqual([[{ step: 'max_shown', detail: 'ask' }]]);
  });

  it('sends nothing with AI kept on the phone', async () => {
    await store.db.runAsync("INSERT INTO settings (key, value) VALUES ('ai.mode', 'device')", []);
    const counts = funnel();
    await counts.note({ step: 'max_shown', detail: 'ask' });
    await counts.report();
    expect(sent).toEqual([]);
  });
});
