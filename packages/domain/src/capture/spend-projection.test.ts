import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
  mergeProjected,
  projectSpend,
  sightingKey,
  splitProjected,
  type RowAsSeen,
  type SeenOnRow,
} from './spend-projection';

// One booking paid by card, told four ways. Every name, code and amount here is made up.

const at = (minute: number, second = 0) =>
  new Date(Date.UTC(2026, 10, 14, 3, minute, second)).toISOString();

const bankAlert: SeenOnRow = {
  key: 'alert-1',
  source: 'alert',
  channel: 'alert',
  witness: 'bank',
  amount: 1_217_400,
  currency: 'VND',
  at: at(31, 12),
  atKind: 'delivered',
  payee: 'KS DOI THONG',
};
const siteMail: SeenOnRow = {
  key: 'mail-1',
  source: 'email',
  channel: 'email',
  witness: 'shop',
  amount: 1_200_000,
  currency: 'VND',
  at: at(34),
  atKind: 'sent',
  payee: 'Khách sạn Đồi Thông',
};
const bankMail: SeenOnRow = {
  key: 'mail-2',
  source: 'email',
  channel: 'email',
  witness: 'bank',
  amount: 1_217_400,
  currency: 'VND',
  at: at(30, 58),
  atKind: 'printed',
  payee: 'KS DOI THONG',
};
const walletTap: SeenOnRow = {
  key: 'tap-1',
  source: 'applePay',
  channel: 'wallet',
  witness: 'wallet',
  at: at(31),
  atKind: 'now',
  payee: 'Doi Thong',
};

/** The row a first sighting makes, as `ingest` writes it. */
const firstRow = (s: SeenOnRow): RowAsSeen => ({
  amount: s.amount ?? 0,
  merchant: s.payee ?? '',
  at: s.at,
  categoryId: `category-of-${s.key}`,
  status: 'caught',
});

/** Sightings arriving one by one, each merged into the row the first one made. */
function arrive(order: readonly SeenOnRow[]): RowAsSeen {
  const [first, ...rest] = order;
  if (!first) throw new Error('nothing arrived');
  let row = firstRow(first);
  const seen: SeenOnRow[] = [first];
  for (const s of rest) {
    row = { ...row, ...mergeProjected(row, seen, s, `category-of-${s.key}`, 'VND') };
    seen.push(s);
  }
  return row;
}

describe('projectSpend', () => {
  it('takes the amount from the bank, the name from the shop, the time from the most exact', () => {
    expect(projectSpend([siteMail, bankAlert, bankMail, walletTap], 'VND')).toMatchObject({
      amount: 1_217_400,
      payee: 'Khách sạn Đồi Thông',
      at: at(30, 58),
      from: { amount: 'mail-2', payee: 'mail-1', at: 'mail-2' },
    });
  });

  it('lets what the person typed win over anything read', () => {
    const typed: SeenOnRow = {
      key: 'typed-1',
      source: 'manual',
      channel: 'typed',
      witness: 'person',
      amount: 1_200_000,
      currency: 'VND',
      at: at(25),
      payee: 'Đà Lạt hotel',
    };
    expect(projectSpend([bankAlert, siteMail, typed], 'VND')).toMatchObject({
      amount: 1_200_000,
      payee: 'Đà Lạt hotel',
      at: at(25),
    });
  });

  it('passes over a name that says nothing about who was paid, unless nothing names anyone', () => {
    const memo = { ...bankAlert, payee: 'CHUYEN TIEN' };
    expect(projectSpend([memo, walletTap], 'VND').payee).toBe('Doi Thong');
    expect(projectSpend([memo, { ...walletTap, payee: '' }], 'VND').payee).toBe('CHUYEN TIEN');
  });

  it('counts only amounts in the home currency', () => {
    const abroad = { ...siteMail, amount: 4_900, currency: 'USD' };
    expect(projectSpend([abroad], 'VND').amount).toBeNull();
    expect(projectSpend([abroad, bankAlert], 'VND').amount).toBe(1_217_400);
  });

  it('prefers a shop’s own spelling to capitals between two names that say as much', () => {
    const capitals = { ...siteMail, key: 'mail-3', payee: 'CLOUDFLARE', at: at(1) };
    const spelt = { ...siteMail, key: 'mail-4', payee: 'Cloudflare', at: at(2) };
    expect(projectSpend([capitals, spelt], 'VND').payee).toBe('Cloudflare');
    expect(projectSpend([spelt, capitals], 'VND').payee).toBe('Cloudflare');
  });

  it('reads a sighting kept before sightings said who spoke by its source', () => {
    const old: SeenOnRow = { key: 'old', source: 'alert', amount: 50_000, at: at(1) };
    const shop: SeenOnRow = { key: 'shop', source: 'shared', amount: 49_500, at: at(2) };
    expect(projectSpend([shop, old], 'VND').amount).toBe(50_000);
  });
});

describe('mergeProjected', () => {
  const orders = [
    [bankAlert, siteMail],
    [siteMail, bankAlert],
  ];
  it.each(orders)('makes the bank’s charge the amount, told %#', (...order) => {
    expect(arrive(order)).toMatchObject({
      amount: 1_217_400,
      merchant: 'Khách sạn Đồi Thông',
      categoryId: 'category-of-mail-1',
    });
  });

  it('keeps an amount the person typed on the row', () => {
    const row = { ...firstRow(siteMail), amount: 1_150_000 };
    expect(mergeProjected(row, [siteMail], bankAlert, 'x', 'VND').amount).toBe(1_150_000);
  });

  it('keeps a name the person gave, and the category they kept', () => {
    const row = { ...firstRow(bankAlert), merchant: 'Dalat trip', status: 'kept' as const };
    expect(mergeProjected(row, [bankAlert], siteMail, 'travel', 'VND')).toMatchObject({
      merchant: 'Dalat trip',
      categoryId: 'category-of-alert-1',
      namedByIncoming: false,
    });
  });

  it('keeps the category of a spend the person kept, whatever names it', () => {
    const row = { ...firstRow(bankAlert), status: 'kept' as const };
    expect(mergeProjected(row, [bankAlert], siteMail, 'travel', 'VND')).toMatchObject({
      merchant: 'Khách sạn Đồi Thông',
      categoryId: 'category-of-alert-1',
    });
  });

  it('gives a Wallet tap with no amount the amount of the alert that joins it, either order', () => {
    expect(arrive([walletTap, bankAlert]).amount).toBe(1_217_400);
    expect(arrive([bankAlert, walletTap]).amount).toBe(1_217_400);
  });

  it('gives a priced charge abroad the bank’s home amount', () => {
    const abroad = { ...siteMail, amount: 4_900, currency: 'USD' };
    const row = { ...firstRow(abroad), amount: 124_950, foreignAmount: { currency: 'USD' } };
    expect(mergeProjected(row, [abroad], bankAlert, 'x', 'VND').amount).toBe(1_217_400);
  });

  it('ends at the projection of every sighting, whatever order they arrive in', () => {
    const all = [bankAlert, siteMail, bankMail, walletTap];
    const want = projectSpend(all, 'VND');
    fc.assert(
      fc.property(fc.shuffledSubarray(all, { minLength: 4, maxLength: 4 }), (order) => {
        const row = arrive(order);
        expect(row.amount).toBe(want.amount);
        expect(row.merchant).toBe(want.payee);
        expect(row.at).toBe(want.at);
      }),
    );
  });

  it('ends the same whatever order any sightings arrive in', () => {
    const sighting = fc.record({
      witness: fc.constantFrom('bank', 'wallet', 'shop', 'person'),
      channel: fc.constantFrom('alert', 'email', 'shared', 'wallet', 'typed', 'qr'),
      amount: fc.option(fc.integer({ min: 1, max: 9 }).map((n) => n * 10_000)),
      minute: fc.integer({ min: 0, max: 59 }),
      atKind: fc.option(
        fc.constantFrom('printed', 'delivered', 'sent', 'now') as fc.Arbitrary<
          NonNullable<SeenOnRow['atKind']>
        >,
      ),
      payee: fc.option(fc.constantFrom('PHO HOA', 'Phở Hòa', 'CHUYEN TIEN', 'Circle K', '')),
    });
    const told = fc.array(sighting, { minLength: 1, maxLength: 5 }).map((drawn) =>
      drawn.map((d, i): SeenOnRow => ({
        key: `s${i}`,
        source: 'alert',
        channel: d.channel,
        witness: d.witness,
        amount: d.amount,
        currency: 'VND',
        at: at(d.minute),
        atKind: d.atKind,
        payee: d.payee,
      })),
    );
    const twice = told.chain((all) =>
      fc.tuple(
        fc.constant(all),
        fc.shuffledSubarray(all, { minLength: all.length, maxLength: all.length }),
      ),
    );
    fc.assert(
      fc.property(twice, ([all, shuffled]) => {
        const [x, y] = [arrive(all), arrive(shuffled)];
        expect(y.amount).toBe(x.amount);
        expect(y.merchant).toBe(x.merchant);
        expect(y.at).toBe(x.at);
      }),
    );
  });
});

describe('splitProjected', () => {
  it('gives the row back what its other sightings say', () => {
    const row = arrive([siteMail, bankAlert]);
    expect(splitProjected(row, [siteMail, bankAlert], 'alert-1', 'VND')).toEqual({
      amount: 1_200_000,
      merchant: 'Khách sạn Đồi Thông',
      at: at(34),
    });
  });

  it('keeps what the person set on the row', () => {
    const row = { ...arrive([siteMail, bankAlert]), amount: 1_000_000 };
    expect(splitProjected(row, [siteMail, bankAlert], 'alert-1', 'VND').amount).toBe(1_000_000);
  });
});

describe('sightingKey', () => {
  it('is the capture’s id, else its source and instant', () => {
    expect(sightingKey({ captureId: 'cap-1', source: 'alert', at: at(1) })).toBe('cap-1');
    expect(sightingKey({ source: 'alert', at: at(1) })).toBe(`alert@${at(1)}`);
  });
});
