import { describe, expect, it } from 'vitest';

import { inboxSpendSchema, type SurfaceContext } from '../contracts/surfaces';
import mbbank from '../capture/fixtures/receipts/synthetic-mbbank.json';
import { shareCard, shareItem, shareLook } from './entry';

/**
 * What a shared receipt's inbox item says about how it was read, for the phone's own count of
 * receipts read right the first time.
 */
const context: SurfaceContext = {
  v: 1,
  language: 'en',
  host: '6pm.ai',
  categories: [],
  rules: [],
  safeToday: 245_000,
  strings: { today: 'Today', yesterday: 'Yesterday', safeAfter: 'Safe today is now {amount}' },
};
const contextJson = JSON.stringify(context);
const now = new Date(2026, 9, 9, 13, 10).toISOString();
const lines = JSON.stringify(mbbank);

const receiptOf = (cardJson: string, edits: object = {}) => {
  const { item } = JSON.parse(shareItem(cardJson, JSON.stringify(edits), contextJson)) as {
    item: unknown;
  };
  return inboxSpendSchema.parse(item).receipt;
};

describe('a shared receipt’s reading', () => {
  it('says nothing more when the card was saved as read', () => {
    const receipt = receiptOf(shareCard(lines, contextJson, now));
    expect(receipt?.read).toBeUndefined();
    expect(receipt?.looked).toBeUndefined();
  });

  it('keeps what was read when the amount or the shop was changed before saving', () => {
    const shown = shareCard(lines, contextJson, now);
    expect(receiptOf(shown, { amountText: '125' })?.read).toEqual({ amount: 120_000 });
    expect(receiptOf(shown, { payee: 'Circle K' })?.read).toEqual({ payee: 'CIRCLE K VN' });
  });

  it('does not count a category picked, or the same amount typed again', () => {
    const shown = shareCard(lines, contextJson, now);
    expect(receiptOf(shown, { categoryId: 'food' })?.read).toBeUndefined();
    expect(receiptOf(shown, { amountText: '120000' })?.read).toBeUndefined();
  });

  it('marks a receipt the server took a closer look at', () => {
    const looked = shareLook(lines, '{"receipt":null}', contextJson, now);
    expect(receiptOf(looked)?.looked).toBe(true);
  });

  it('counts an amount typed where none could be read as not read right', () => {
    const empty = shareCard('[]', contextJson, now);
    expect(receiptOf(empty, { amountText: '45k' })?.read).toEqual({ amount: null });
  });
});
