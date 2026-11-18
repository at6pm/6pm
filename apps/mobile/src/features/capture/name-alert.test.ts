import { describe, expect, it, jest } from '@jest/globals';

import type { InboxSpend } from '@6pm/domain';

import { alertNameKey, type AlertName } from '../../data/alert-names';
import type { ApiRequest } from '../api/api-client';
import { ApiRequestError } from '../api/api-error';
import type { AiMode } from '../privacy/ai-mode';
import { aiModeSettings } from '../privacy/ai-mode-stand-in';
import { createNameAlert, NAME_ALERT_TIMEOUT_MS } from './name-alert';

const lines = [
  'Thanh toán HIGHLANDS COFFEE thành công',
  'Bạn đã thực hiện thanh toán thành công cho HIGHLANDS COFFEE với số tiền',
];

const alert = (over: Partial<InboxSpend> = {}): InboxSpend => ({
  v: 1,
  id: '0b6f3f8e-2a4c-8d7e-9f10-8a1b2c3d4e5f',
  kind: 'spend',
  source: 'alert',
  status: 'caught',
  at: '2026-11-18T04:46:04.573Z',
  amount: 119_000,
  merchant: '',
  categoryId: 'food',
  receipt: { bank: 'MoMo', namingLines: lines, payeeSure: false },
  direction: 'out',
  atKind: 'delivered',
  ...over,
});

const categories = [
  { id: 'food', name: 'Food' },
  { id: 'drinks', name: 'Drinks' },
  { id: 'tet', name: 'Tết 2027' },
];

function setup(
  answer: () => Promise<unknown>,
  {
    ruled = null,
    mode = 'server',
    kept = new Map<string, AlertName>(),
  }: { ruled?: string | null; mode?: AiMode; kept?: Map<string, AlertName> } = {},
) {
  const request = jest.fn((call: ApiRequest<unknown>) => {
    void call;
    return answer();
  });
  const name = createNameAlert({
    request: request as never,
    settings: aiModeSettings(mode),
    ruleCategory: () => Promise.resolve(ruled),
    categories: () => categories,
    remembered: {
      get: (key) => Promise.resolve(kept.get(key) ?? null),
      put: (key, value) => {
        kept.set(key, value);
        return Promise.resolve();
      },
    },
  });
  return { name, request, kept };
}

const highlands = () => Promise.resolve({ merchant: 'Highlands Coffee', category: 'Drinks' });

describe('naming a bank alert the phone read no payee from', () => {
  it('asks the server once, briefly, with no digit, and takes its name and category', async () => {
    const { name, request } = setup(highlands);
    const named = await name(alert());
    expect(named).toMatchObject({ merchant: 'Highlands Coffee', categoryId: 'drinks' });
    expect(request).toHaveBeenCalledTimes(1);
    const call = request.mock.calls[0]?.[0];
    expect(call).toMatchObject({
      method: 'POST',
      path: '/v1/name-alert',
      timeoutMs: NAME_ALERT_TIMEOUT_MS,
      body: { name: '', lines, categories: ['Food', 'Drinks'] },
    });
    expect(JSON.stringify(call?.body)).not.toMatch(/\p{Nd}/u);
  });

  it('never sends a line that holds a digit', async () => {
    const { name, request } = setup(highlands);
    await name(
      alert({
        receipt: { bank: 'MoMo', namingLines: [...lines, 'TK 0123xxx456'], payeeSure: false },
      }),
    );
    expect(JSON.stringify(request.mock.calls[0]?.[0].body)).not.toMatch(/\p{Nd}/u);
  });

  it('remembers the wording: the next payment worded the same asks nobody', async () => {
    const { name, request, kept } = setup(highlands);
    await name(alert());
    const next = await name(alert({ id: '1c6f3f8e-2a4c-8d7e-9f10-8a1b2c3d4e5f', amount: 55_000 }));
    expect(next).toMatchObject({ merchant: 'Highlands Coffee', categoryId: 'drinks' });
    expect(request).toHaveBeenCalledTimes(1);
    expect(kept.get(alertNameKey('MoMo', lines))).toEqual({
      merchant: 'Highlands Coffee',
      category: 'Drinks',
    });
  });

  it('uses a remembered name in on-device mode, and asks nothing new there', async () => {
    const kept = new Map([
      [alertNameKey('MoMo', lines), { merchant: 'Highlands Coffee', category: 'Drinks' }],
    ]);
    const known = setup(highlands, { mode: 'device', kept });
    expect(await known.name(alert())).toMatchObject({ merchant: 'Highlands Coffee' });
    const fresh = setup(highlands, { mode: 'device' });
    expect(await fresh.name(alert())).toEqual(alert());
    expect(known.request).not.toHaveBeenCalled();
    expect(fresh.request).not.toHaveBeenCalled();
  });

  it("files it by the person's own rule for the name before the server's category", async () => {
    const { name } = setup(highlands, { ruled: 'tet' });
    expect(await name(alert())).toMatchObject({ merchant: 'Highlands Coffee', categoryId: 'tet' });
  });

  it('keeps the row as read when the server names nobody, and does not ask again', async () => {
    const { name, request } = setup(() => Promise.resolve({ merchant: ' ', category: 'Food' }));
    const item = alert({ merchant: 'BUI QUOC KHANH chuyen tien' });
    expect(await name(item)).toEqual(item);
    expect(await name(item)).toEqual(item);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('keeps the row as read when the server is offline, slow or refuses', async () => {
    const { name, kept } = setup(() =>
      Promise.reject(new ApiRequestError('network', 'Request failed', true)),
    );
    expect(await name(alert())).toEqual(alert());
    expect(kept.size).toBe(0);
  });

  it('leaves alone an alert whose payee the phone read, money in, and anything not an alert', async () => {
    const { name, request } = setup(highlands);
    const sure = alert({ merchant: 'Phúc Long', receipt: { bank: 'MoMo', namingLines: [] } });
    const into = alert({ direction: 'in' });
    const shared = alert({ source: 'shared' });
    expect(await name(sure)).toEqual(sure);
    expect(await name(into)).toEqual(into);
    expect(await name(shared)).toEqual(shared);
    expect(request).not.toHaveBeenCalled();
  });
});
