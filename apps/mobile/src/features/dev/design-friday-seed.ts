import { randomUUID } from 'expo-crypto';

import { parts, payCycleOn, type LocalDate } from '@6pm/domain';

import type { Language } from '@6pm/i18n';

import type { MoneyStore } from '../../data/money-store';
import { writePlan } from '../../data/plan-settings';
import { buildDesignFriday, FRIDAY_PAYDAY } from './design-friday-fixture';

/**
 * Developer tool: fills the database with the prototype's Friday (a month's pay on the 31st, four
 * bills, a dated jar, what was spent earlier this cycle and the six spends of the day) placed on
 * today's date, so every screen can be compared with the design renders. Replaces everything in
 * the money tables.
 * The fixture is local: its names follow `language` and its amounts the currency (see
 * `buildDesignFriday`); the categories are named in `language`, as onboarding names a new
 * install's. In đồng its amounts are the prototype's own (income 17,4tr, 750k a month into the
 * dated jar, 2.365.000₫ spent before its Friday).
 */
export async function seedDesignFriday(
  store: MoneyStore,
  today: LocalDate,
  code = 'VND',
  language: Language = 'en',
): Promise<void> {
  const fixture = buildDesignFriday(today, code, language);
  const { db, tables } = store;
  const now = new Date();
  const iso = now.toISOString();
  await db.withTransactionAsync(async () => {
    for (const table of [
      'spends',
      'merchant_rules',
      'bills',
      'pot_moves',
      'pots',
      'closed_days',
      'categories',
    ]) {
      await db.runAsync(`DELETE FROM ${table}`, []);
    }
    await writePlan(db, {
      income: fixture.income,
      payday: FRIDAY_PAYDAY,
      futureYou: fixture.futureYou,
      closeAt: '18:00',
      persona: 'cheeky',
      serious: false,
      currency: fixture.currency.code,
    });
    for (const [i, category] of fixture.categories.entries()) {
      await tables.categories.put({ ...category, countsDaily: true, sort: i, archivedAt: null });
    }
    const cycle = payCycleOn(today, FRIDAY_PAYDAY);
    for (const [i, { name, icon, amount, dueDay, paid }] of fixture.bills.entries()) {
      await tables.bills.put({
        id: randomUUID(),
        name,
        icon,
        hue: 60 + i * 70,
        amount,
        dueDay,
        paidCycle: paid ? cycle.start : null,
        sort: i,
        archivedAt: null,
        kind: 'other',
        lastMonth: null,
        paidAmount: null,
        askedCycle: null,
      });
    }
    await tables.pots.put({
      id: randomUUID(),
      kind: 'occasion',
      name: fixture.jar.name,
      icon: 'celebration',
      hue: 20,
      goal: fixture.jar.goal,
      neededBy: fixture.jar.neededBy,
      share: null,
      paused: false,
      createdAt: iso,
      archivedAt: null,
    });
    for (const { day, spent, line, tomorrow } of fixture.closedDays) {
      await tables.closedDays.put({
        day,
        closedAt: new Date(`${day}T18:20:00`).toISOString(),
        late: false,
        spent,
        line,
        tomorrow,
        note: null,
      });
    }
    for (const spend of fixture.spends) {
      const [h = 0, m = 0] = spend.time.split(':').map(Number);
      const { year: y, month: mo, day: dd } = parts(spend.day);
      const at = new Date(y, mo - 1, dd, h, m).toISOString();
      await tables.spends.put({
        id: randomUUID(),
        day: spend.day,
        at,
        amount: spend.amount,
        categoryId: spend.categoryId,
        merchant: spend.merchant,
        note: null,
        source: spend.source,
        status: spend.status,
        previousStatus: null,
        wallet: null,
        forWork: false,
        detail: spend.detail,
        foreignAmount: null,
        createdAt: iso,
        updatedAt: iso,
      });
    }
  });
  await store.loadInTurn(today);
}
