import { describe, expect, it } from 'vitest';

import { findDuplicate, type NewSighting, type SightedSpend } from '../capture/duplicate';
import type { InboxSpend } from '../contracts/surfaces';
import { buildBankAlert } from './log-bank-alert';

// Every name, account and amount here is made up.

const NOW = new Date('2026-11-24T05:15:09.100Z');
/** One MB notification, as two copies of the shortcut (Keep Both) both pass it on. */
const ALERT = {
  app: 'MB Bank',
  title: 'MB Bank',
  subtitle: '',
  body: 'TK 0123xxx789|GD: -45,000VND 24/11/26 12:15|SD: 1,234,000VND|ND: PHUC LONG COFFEE thanh toan',
  // The notification's own delivered time: both runs are handed the very same instant.
  date: '2026-11-24T05:15:08.768Z',
};

const caught = (id: string): InboxSpend => {
  const { item } = buildBankAlert(ALERT, null, NOW, id);
  if (item === null) throw new Error('the alert was not read');
  return item;
};

/** What the import matches with, from an inbox item. */
const sightingOf = (item: InboxSpend): NewSighting => ({
  amount: item.amount,
  source: item.source,
  status: item.status,
  at: item.at,
  detail: item.receipt?.bank ?? null,
  direction: item.direction ?? null,
  merchant: item.merchant,
  atKind: item.atKind ?? null,
  bank: item.receipt?.bank ?? null,
  accountTail: item.accountTail ?? null,
});

describe('one bank alert passed on by two automations', () => {
  it('is read twice into two items that differ only in their ids', () => {
    const first = caught('0b0e7c5e-3f0a-4c1d-9a51-2f6f2f1f7a10');
    const second = caught('7d9c2a44-6f1b-4a3e-8f55-0c1d2e3f4a5b');
    expect({ ...second, id: first.id }).toEqual(first);
  });

  it('is one payment: the second is matched to the row the first saved', () => {
    const first = caught('0b0e7c5e-3f0a-4c1d-9a51-2f6f2f1f7a10');
    const second = caught('7d9c2a44-6f1b-4a3e-8f55-0c1d2e3f4a5b');
    const saved: SightedSpend = { id: first.id, ...sightingOf(first) };
    expect(findDuplicate(sightingOf(second), [saved])?.id).toBe(first.id);
  });

  it('is still two payments when the bank sends a second alert a moment later', () => {
    const first = caught('0b0e7c5e-3f0a-4c1d-9a51-2f6f2f1f7a10');
    const saved: SightedSpend = { id: first.id, ...sightingOf(first) };
    const { item: later } = buildBankAlert(
      { ...ALERT, date: '2026-11-24T05:15:40.112Z' },
      null,
      NOW,
      '7d9c2a44-6f1b-4a3e-8f55-0c1d2e3f4a5b',
    );
    expect(later).not.toBeNull();
    if (later) expect(findDuplicate(sightingOf(later), [saved])).toBeNull();
  });
});
