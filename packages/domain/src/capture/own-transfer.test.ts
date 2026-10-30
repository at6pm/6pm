import { describe, expect, it } from 'vitest';

import { OWN_TRANSFER_WINDOW_MS, ownTransferPair, type SavedAlert } from './own-transfer';

const at = (ms: number) => new Date(Date.parse('2026-10-28T08:23:44.120Z') + ms).toISOString();

// MB says 1.000.000₫ left; Techcombank says it arrived.
const out: SavedAlert = {
  id: 'mb',
  source: 'alert',
  status: 'caught',
  at: at(0),
  amount: 1_000_000,
  detail: 'MB Bank',
  direction: 'out',
};
const arrived = {
  source: 'alert' as const,
  at: at(4_000),
  amount: 1_000_000,
  detail: 'Techcombank',
  direction: 'in' as const,
};

describe('ownTransferPair', () => {
  it('pairs money out of one bank with the same money into another, either order', () => {
    expect(ownTransferPair(arrived, [out])?.id).toBe('mb');
    const saved = { ...arrived, id: 'tcb', status: 'caught' as const };
    expect(ownTransferPair({ ...out, at: at(-30_000) }, [saved])?.id).toBe('tcb');
    // Spending is written without a way: it is money out.
    expect(ownTransferPair(arrived, [{ ...out, direction: null }])?.id).toBe('mb');
  });

  it('pairs within a minute, and no further', () => {
    expect(ownTransferPair({ ...arrived, at: at(OWN_TRANSFER_WINDOW_MS) }, [out])?.id).toBe('mb');
    expect(ownTransferPair({ ...arrived, at: at(-OWN_TRANSFER_WINDOW_MS) }, [out])?.id).toBe('mb');
    expect(ownTransferPair({ ...arrived, at: at(61_000) }, [out])).toBeNull();
  });

  it('keeps two when both sides are one bank, the same way, or another amount', () => {
    expect(ownTransferPair({ ...arrived, detail: 'mb bank' }, [out])).toBeNull();
    expect(ownTransferPair({ ...arrived, direction: 'out' }, [out])).toBeNull();
    expect(ownTransferPair({ ...arrived, amount: 999_000 }, [out])).toBeNull();
    expect(ownTransferPair({ ...arrived, detail: null }, [out])).toBeNull();
    expect(ownTransferPair(arrived, [{ ...out, detail: null }])).toBeNull();
  });

  it('never touches an alert the user answered', () => {
    for (const status of ['kept', 'skipped', 'deleted', 'pending'] as const) {
      expect(ownTransferPair(arrived, [{ ...out, status }])).toBeNull();
    }
  });

  it('only pairs alerts, in the home currency', () => {
    expect(ownTransferPair({ ...arrived, source: 'email' }, [out])).toBeNull();
    expect(ownTransferPair(arrived, [{ ...out, source: 'applePay' }])).toBeNull();
    expect(ownTransferPair(arrived, [{ ...out, source: 'manual' }])).toBeNull();
    const usd = { currency: 'USD', amount: 40 };
    expect(ownTransferPair({ ...arrived, foreignAmount: usd }, [out])).toBeNull();
    expect(ownTransferPair(arrived, [{ ...out, foreignAmount: usd }])).toBeNull();
  });

  it('takes the nearest', () => {
    const far = { ...out, id: 'far', at: at(-50_000), detail: 'VPBank' };
    expect(ownTransferPair(arrived, [far, out])?.id).toBe('mb');
  });
});
