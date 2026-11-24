import { describe, expect, it } from 'vitest';

import {
  bankAlertResultSchema,
  inboxHeardSchema,
  inboxItemSchema,
  inboxSpendSchema,
  inboxUnreadSchema,
} from '../contracts/surfaces';
import { testAlertResultSchema } from '../contracts/test-alert';
import { logTestAlert } from './entry';
import { buildTestAlert } from './log-test-alert';

const NOW = new Date(2026, 10, 22, 9, 30);
const ID = '0b0e7c5e-3f0a-4c1d-9a51-2f6f2f1f7a10';
const TOKEN = '7d9c2a44-6f1b-4a3e-8f55-0c1d2e3f4a5b';

describe('a test alert', () => {
  it('becomes an inbox item of its own kind, carrying its token and nothing of a payment', () => {
    const { item } = buildTestAlert(TOKEN, NOW, ID);
    expect(item).toEqual({ v: 1, id: ID, kind: 'test', at: NOW.toISOString(), token: TOKEN });
    const parsed = inboxItemSchema.parse(item);
    expect(parsed.kind).toBe('test');
  });

  it('is refused by every shape money or an alert’s words travel in', () => {
    const { item } = buildTestAlert(TOKEN, NOW, ID);
    expect(inboxSpendSchema.safeParse(item).success).toBe(false);
    expect(inboxHeardSchema.safeParse(item).success).toBe(false);
    expect(inboxUnreadSchema.safeParse(item).success).toBe(false);
    // What reading a bank alert returns has no place for it either.
    expect(bankAlertResultSchema.safeParse({ item, last: null }).success).toBe(false);
  });

  it('loses an amount, a payee, a source or words someone put on it', () => {
    const dressed = {
      ...buildTestAlert(TOKEN, NOW, ID).item,
      source: 'alert',
      status: 'caught',
      amount: 1000,
      merchant: 'Phở Hòa',
      categoryId: 'food',
      direction: 'out',
      alertWords: { app: '6pm', title: '6pm · test alert', subtitle: '', body: '1.000₫' },
    };
    const parsed = inboxItemSchema.parse(dressed);
    expect(parsed).toEqual({ v: 1, id: ID, kind: 'test', at: NOW.toISOString(), token: TOKEN });
  });

  it('leaves nothing without a token, or with one too long to be the app’s', () => {
    expect(buildTestAlert('', NOW, ID).item).toBeNull();
    expect(buildTestAlert('   ', NOW, ID).item).toBeNull();
    expect(buildTestAlert('x'.repeat(65), NOW, ID).item).toBeNull();
  });

  it('answers the listener in JSON with a fresh id, and never throws', () => {
    const read = testAlertResultSchema.parse(JSON.parse(logTestAlert(TOKEN, NOW.toISOString())));
    expect(read.item).toMatchObject({ kind: 'test', token: TOKEN, at: NOW.toISOString() });
    const again = testAlertResultSchema.parse(JSON.parse(logTestAlert(TOKEN, NOW.toISOString())));
    expect(again.item?.id).not.toBe(read.item?.id);
    const garbage: unknown[] = [undefined, null, 7, {}, ''];
    for (const bad of garbage) {
      expect(JSON.parse(logTestAlert(bad as string, 'not a time'))).toEqual({
        item: null,
      });
    }
  });
});
