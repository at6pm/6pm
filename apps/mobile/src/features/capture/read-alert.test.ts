import { describe, expect, it, jest } from '@jest/globals';

import { currencyOf, type HeardWords, type InboxSpend, type InboxUnread } from '@6pm/domain';

import type { ApiRequest } from '../api/api-client';
import { ApiRequestError } from '../api/api-error';
import type { AiMode } from '../privacy/ai-mode';
import { aiModeSettings } from '../privacy/ai-mode-stand-in';
import { createReadAlerts, READ_ALERT_TIMEOUT_MS } from './read-alert';

// Every name, account and amount here is made up.

const words = (body: string): HeardWords => ({
  app: 'MB Bank',
  title: 'Thông báo biến động số dư',
  subtitle: '',
  body,
});
const MB =
  'TK 0123456789012|GD: -50,000VND 18/11/26 09:41|SD: 1,250,000VND|ND: Thanh toan QR-PHO HOA';

let n = 0;
const id = () => {
  n += 1;
  return `0b6f3f8e-2a4c-8d7e-9f10-${String(n).padStart(12, '0')}`;
};

const caught = (over: Partial<InboxSpend> = {}): InboxSpend => ({
  v: 1,
  id: id(),
  kind: 'spend',
  source: 'alert',
  status: 'caught',
  at: '2026-11-18T02:41:00.000Z',
  amount: 50_000,
  merchant: 'PHO HOA',
  categoryId: 'transport',
  receipt: { bank: 'MB Bank', namingLines: [] },
  direction: 'out',
  atKind: 'delivered',
  alertWords: words(MB),
  ...over,
});

const unread = (body = 'Quý khách vừa quẹt 85.000đ ở The Coffee House'): InboxUnread => ({
  v: 1,
  id: id(),
  kind: 'unread',
  at: '2026-11-18T02:41:05.000Z',
  date: '2026-11-18T02:41:00.000Z',
  bank: 'MB Bank',
  alertWords: words(body),
});

const categories = [
  { id: 'food', name: 'Food' },
  { id: 'drinks', name: 'Drinks' },
  { id: 'transport', name: 'Transport' },
];

function setup(
  answer: (call: ApiRequest<unknown>) => Promise<unknown>,
  { ruled = null, mode = 'server' }: { ruled?: string | null; mode?: AiMode } = {},
) {
  const request = jest.fn((call: ApiRequest<unknown>) => answer(call));
  const read = createReadAlerts({
    request: request as never,
    settings: aiModeSettings(mode),
    ruleCategory: () => Promise.resolve(ruled),
    categories: () => categories,
    home: () => currencyOf('VND'),
  });
  return { read, request };
}

const phoHoa = () =>
  Promise.resolve({ moved: 'out', amount: 1, merchant: 'Phở Hòa', category: 'Food' });

describe('having the server read a bank alert a second time', () => {
  it('sends the words with the account dotted out and each amount marked, and takes what it reads', async () => {
    const { read, request } = setup(phoHoa);
    const item = caught();
    const answers = await read([item]);
    expect(answers.get(item.id)).toEqual({
      kind: 'spend',
      item: { ...item, merchant: 'Phở Hòa', categoryId: 'food' },
    });
    expect(request).toHaveBeenCalledTimes(1);
    const call = request.mock.calls[0]?.[0];
    expect(call).toMatchObject({
      method: 'POST',
      path: '/v1/read-alert',
      timeoutMs: READ_ALERT_TIMEOUT_MS,
    });
    expect(call?.body).toEqual({
      app: 'MB Bank',
      text: 'Thông báo biến động số dư\nTK •••••••••••••|GD: «1: -50,000VND» 18/11/26 09:41|SD: «2: 1,250,000VND»|ND: Thanh toan QR-PHO HOA',
      amounts: 2,
      home: 'VND',
      categories: ['Food', 'Drinks', 'Transport'],
    });
    expect(JSON.stringify(call?.body)).not.toMatch(/\d{9}/);
  });

  it('files by the person’s own rule before the server’s category', async () => {
    const { read } = setup(phoHoa, { ruled: 'drinks' });
    const item = caught();
    expect((await read([item])).get(item.id)).toMatchObject({ item: { categoryId: 'drinks' } });
  });

  it('keeps where the phone filed it when the server names a category that is not theirs', async () => {
    const { read } = setup(() =>
      Promise.resolve({ moved: 'out', amount: 1, merchant: 'Phở Hòa', category: 'Eating out' }),
    );
    const item = caught();
    expect((await read([item])).get(item.id)).toMatchObject({ item: { categoryId: 'transport' } });
  });

  it('takes the server’s amount and way over the phone’s', async () => {
    const { read } = setup(() =>
      Promise.resolve({ moved: 'in', amount: 1, merchant: 'Nguyễn Văn An', category: '' }),
    );
    const item = caught({ amount: 1_250_000 });
    expect((await read([item])).get(item.id)).toMatchObject({
      item: { amount: 50_000, direction: 'in', categoryId: null, merchant: 'Nguyễn Văn An' },
    });
  });

  it('leaves a caught row as the phone read it when the server says no money moved', async () => {
    const { read } = setup(() =>
      Promise.resolve({ moved: 'none', amount: 0, merchant: '', category: '' }),
    );
    const item = caught();
    expect((await read([item])).has(item.id)).toBe(false);
  });

  it('finds the payment in an alert the phone could not read', async () => {
    const { read } = setup(() =>
      Promise.resolve({
        moved: 'out',
        amount: 1,
        merchant: 'The Coffee House',
        category: 'Drinks',
      }),
    );
    const item = unread();
    expect((await read([item])).get(item.id)).toEqual({
      kind: 'spend',
      item: {
        v: 1,
        id: item.id,
        kind: 'spend',
        source: 'alert',
        status: 'caught',
        at: '2026-11-18T02:41:00.000Z',
        amount: 85_000,
        merchant: 'The Coffee House',
        categoryId: 'drinks',
        receipt: { bank: 'MB Bank', namingLines: [] },
        direction: 'out',
        atKind: 'delivered',
      },
    });
  });

  it('lets go of an unread alert the server finds no money in, or that prints no amount', async () => {
    const { read, request } = setup(() =>
      Promise.resolve({ moved: 'none', amount: 0, merchant: '', category: '' }),
    );
    const promo = unread();
    const birthday = unread('Chúc mừng sinh nhật bạn ngày 18/11');
    const answers = await read([promo, birthday]);
    expect(answers.get(promo.id)).toEqual({ kind: 'none' });
    expect(answers.get(birthday.id)).toEqual({ kind: 'none' });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('sends nothing in on-device mode: caught rows stay as read, unread alerts are let go', async () => {
    const { read, request } = setup(phoHoa, { mode: 'device' });
    const item = caught();
    const missed = unread();
    const answers = await read([item, missed]);
    expect(request).not.toHaveBeenCalled();
    expect(answers.has(item.id)).toBe(false);
    expect(answers.get(missed.id)).toEqual({ kind: 'none' });
  });

  it('stops asking after the first failure, leaving every alert unanswered', async () => {
    const { read, request } = setup(() =>
      Promise.reject(new ApiRequestError('network', 'Request failed', true)),
    );
    const items = [caught(), unread(), ...Array.from({ length: 12 }, () => caught())];
    const answers = await read(items);
    expect(answers.size).toBe(0);
    // The first few are already out when the first one fails; none is started after it.
    expect(request.mock.calls.length).toBeLessThanOrEqual(6);
  });

  it('asks nothing about an item that carries no words', async () => {
    const { read, request } = setup(phoHoa);
    const { alertWords: _none, ...bare } = caught();
    expect((await read([bare])).size).toBe(0);
    expect(request).not.toHaveBeenCalled();
  });
});
