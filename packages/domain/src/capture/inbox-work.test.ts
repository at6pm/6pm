import { describe, expect, it } from 'vitest';

import type { InboxSpend } from '../contracts/surfaces';
import { inboxItemToNewSpend, type InboxFiling } from './inbox';

const thao: InboxSpend = {
  v: 1,
  id: '5d3c1a2b-7e4f-4a60-9b8c-2f1e0d9c8b7a',
  kind: 'spend',
  source: 'alert',
  status: 'caught',
  at: '2026-11-13T04:26:00.000Z',
  amount: 850_000,
  merchant: 'Chị Thảo',
  categoryId: null,
  direction: 'in',
  receipt: { bank: 'Techcombank', namingLines: [] },
};
const filing: InboxFiling = {
  ruleCategoryId: null,
  fallbackCategoryId: 'food',
  categoryIds: new Set(['food']),
};

describe('money in and the bank it came into', () => {
  it('keeps the bank for someone who turned work on, so its answer can stamp it', () => {
    expect(inboxItemToNewSpend(thao, { ...filing, walletIn: true }).wallet).toBe('Techcombank');
  });

  it('keeps none for anyone else, as before', () => {
    expect(inboxItemToNewSpend(thao, filing).wallet).toBeNull();
    expect(inboxItemToNewSpend(thao, { ...filing, walletIn: false }).wallet).toBeNull();
  });
});
