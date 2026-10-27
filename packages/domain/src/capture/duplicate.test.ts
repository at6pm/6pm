import { describe, expect, it } from 'vitest';

import {
  DUPLICATE_WINDOW_MS,
  FEE_SLACK_RATIO,
  findDuplicate,
  mayBeSamePayment,
  mergedStatus,
  NOTICE_LATE_WINDOW_MS,
  QR_RECEIPT_WINDOW_MS,
  type SightedSpend,
} from './duplicate';

const base: SightedSpend = {
  id: 'a',
  amount: 45_000,
  source: 'qr',
  status: 'pending',
  at: '2026-10-11T05:10:00.000Z',
};
const at = (ms: number) => new Date(Date.parse(base.at) + ms).toISOString();

describe('findDuplicate', () => {
  it('finds the same amount from another source within three minutes', () => {
    const hit = findDuplicate({ amount: 45_000, source: 'email', at: at(2 * 60_000) }, [base]);
    expect(hit?.id).toBe('a');
  });

  it('includes exactly three minutes, in either direction', () => {
    const kept = { ...base, status: 'kept' as const };
    expect(
      findDuplicate({ amount: 45_000, source: 'shared', at: at(DUPLICATE_WINDOW_MS) }, [kept]),
    ).not.toBeNull();
    expect(
      findDuplicate({ amount: 45_000, source: 'email', at: at(-DUPLICATE_WINDOW_MS) }, [kept]),
    ).not.toBeNull();
    expect(
      findDuplicate({ amount: 45_000, source: 'shared', at: at(DUPLICATE_WINDOW_MS + 1) }, [kept]),
    ).toBeNull();
    expect(
      findDuplicate({ amount: 45_000, source: 'email', at: at(-DUPLICATE_WINDOW_MS - 1) }, [kept]),
    ).toBeNull();
  });

  it('matches a bank’s email or alert up to fifteen minutes after the payment, never earlier', () => {
    const tapped = { ...base, source: 'applePay' as const, status: 'caught' as const };
    for (const source of ['email', 'alert'] as const) {
      expect(
        findDuplicate({ amount: 45_000, source, at: at(NOTICE_LATE_WINDOW_MS) }, [tapped])?.id,
      ).toBe('a');
      expect(
        findDuplicate({ amount: 45_000, source, at: at(NOTICE_LATE_WINDOW_MS + 1) }, [tapped]),
      ).toBeNull();
      expect(
        findDuplicate({ amount: 45_000, source, at: at(-DUPLICATE_WINDOW_MS - 1) }, [tapped]),
      ).toBeNull();
    }
    // The tap caught after the bank's late email still finds it: the email came after the tap.
    const emailed = { ...base, source: 'email' as const, status: 'caught' as const };
    expect(
      findDuplicate({ amount: 45_000, source: 'applePay', at: at(-10 * 60_000) }, [emailed])?.id,
    ).toBe('a');
    expect(
      findDuplicate({ amount: 45_000, source: 'applePay', at: at(10 * 60_000) }, [emailed]),
    ).toBeNull();
    // Two notices: the bank's alert, then its email ten minutes later.
    const alerted = { ...base, source: 'alert' as const, status: 'caught' as const };
    expect(
      findDuplicate({ amount: 45_000, source: 'email', at: at(10 * 60_000) }, [alerted])?.id,
    ).toBe('a');
  });

  it('matches a waiting scan with its bank receipt up to twenty minutes after the tap', () => {
    for (const source of ['email', 'shared', 'applePay'] as const) {
      expect(
        findDuplicate({ amount: 45_000, source, at: at(QR_RECEIPT_WINDOW_MS) }, [base])?.id,
      ).toBe('a');
      expect(
        findDuplicate({ amount: 45_000, source, at: at(QR_RECEIPT_WINDOW_MS + 1) }, [base]),
      ).toBeNull();
    }
  });

  it('looks only forward from the tap for a waiting scan', () => {
    expect(
      findDuplicate({ amount: 45_000, source: 'email', at: at(-DUPLICATE_WINDOW_MS) }, [base]),
    ).not.toBeNull();
    expect(
      findDuplicate({ amount: 45_000, source: 'email', at: at(-DUPLICATE_WINDOW_MS - 1) }, [base]),
    ).toBeNull();
  });

  it('keeps three minutes for a scan that is no longer waiting', () => {
    for (const status of ['kept', 'caught'] as const) {
      expect(
        findDuplicate({ amount: 45_000, source: 'applePay', at: at(10 * 60_000) }, [
          { ...base, status },
        ]),
      ).toBeNull();
    }
  });

  it('matches a waiting scan arriving after a receipt it may have paid', () => {
    const receipt = { ...base, source: 'shared' as const, status: 'caught' as const };
    const scan = { amount: 45_000, source: 'qr' as const, status: 'pending' as const };
    expect(findDuplicate({ ...scan, at: at(-10 * 60_000) }, [receipt])?.id).toBe('a');
    expect(findDuplicate({ ...scan, at: at(10 * 60_000) }, [receipt])).toBeNull();
    expect(
      findDuplicate({ ...scan, status: 'caught', at: at(-10 * 60_000) }, [receipt]),
    ).toBeNull();
  });

  it('needs the same amount and a different source', () => {
    expect(findDuplicate({ amount: 46_000, source: 'email', at: at(0) }, [base])).toBeNull();
    expect(findDuplicate({ amount: 45_000, source: 'qr', at: at(0) }, [base])).toBeNull();
  });

  it('ignores skipped and deleted spends', () => {
    for (const status of ['skipped', 'deleted'] as const) {
      expect(
        findDuplicate({ amount: 45_000, source: 'email', at: at(0) }, [{ ...base, status }]),
      ).toBeNull();
    }
  });

  it('never merges something the user typed with a capture, or with another typed spend', () => {
    const typed = { ...base, source: 'manual' as const, status: 'kept' as const };
    expect(findDuplicate({ amount: 45_000, source: 'voice', at: at(0) }, [typed])).toBeNull();
    expect(findDuplicate({ amount: 45_000, source: 'applePay', at: at(0) }, [typed])).toBeNull();
    expect(findDuplicate({ amount: 45_000, source: 'manual', at: at(0) }, [base])).toBeNull();
    expect(findDuplicate({ amount: 45_000, source: 'voice', at: at(0) }, [base])).toBeNull();
  });

  it('merges any two different capture sources', () => {
    const sources = ['qr', 'shared', 'email', 'applePay', 'alert'] as const;
    for (const first of sources) {
      for (const second of sources) {
        const hit = findDuplicate({ amount: 45_000, source: second, at: at(0) }, [
          { ...base, source: first },
        ]);
        expect(hit !== null).toBe(first !== second);
      }
    }
  });

  it('merges the bank’s email with the shop’s email for one payment, never two from one sender', () => {
    const alert = {
      ...base,
      source: 'email' as const,
      status: 'caught' as const,
      detail: 'info@info.vietcombank.com.vn',
    };
    const fromShop = { amount: 45_000, source: 'email' as const, at: at(4_000) };
    expect(findDuplicate({ ...fromShop, detail: 'info@mail.shopee.vn' }, [alert])?.id).toBe('a');
    expect(findDuplicate({ ...fromShop, detail: 'INFO@info.vietcombank.com.vn' }, [alert])).toBe(
      null,
    );
    expect(findDuplicate({ ...fromShop, detail: null }, [alert])).toBeNull();
  });

  it('merges a wallet’s alert with the bank’s it drew from, never two alerts from one app', () => {
    const momo = { ...base, source: 'alert' as const, status: 'caught' as const, detail: 'MoMo' };
    const fromBank = { amount: 45_000, source: 'alert' as const, at: at(5_000) };
    expect(findDuplicate({ ...fromBank, detail: 'MB Bank' }, [momo])?.id).toBe('a');
    expect(findDuplicate({ ...fromBank, detail: 'momo' }, [momo])).toBeNull();
    expect(findDuplicate({ ...fromBank, detail: null }, [momo])).toBeNull();
  });

  it('never lets a payment absorb a second sighting from a witness that already saw it', () => {
    // The first coffee: tapped, then the bank's email merged into it.
    const first = {
      ...base,
      source: 'applePay' as const,
      status: 'caught' as const,
      seenBy: [
        { source: 'applePay' as const, detail: null },
        { source: 'email' as const, detail: 'alert@techcombank.com.vn' },
      ],
    };
    // The second coffee's email, from the same bank, before its own tap is in.
    const second = {
      amount: 45_000,
      source: 'email' as const,
      at: at(6 * 60_000),
      detail: 'alert@techcombank.com.vn',
    };
    expect(findDuplicate(second, [first])).toBeNull();
    // The shop's own receipt is a witness the first coffee has not had.
    expect(findDuplicate({ ...second, detail: 'no-reply@grab.com' }, [first])?.id).toBe('a');
    // And the nearest payment still wins when the second tap is in.
    const tap2 = { ...base, id: 'b', source: 'applePay' as const, at: at(6 * 60_000) };
    expect(findDuplicate(second, [first, tap2])?.id).toBe('b');
  });

  it('merges a ride and the bank’s receipt for it a 300₫ fee apart, six minutes later', () => {
    // A ride read from one bank email at 09:47, the bank's transaction receipt at 09:53.
    const ride = {
      ...base,
      amount: 32_000,
      source: 'alert' as const,
      status: 'caught' as const,
      merchant: 'GREENSM',
    };
    const receipt = { amount: 32_300, source: 'email' as const, at: at(6 * 60_000) };
    expect(findDuplicate({ ...receipt, merchant: '' }, [ride])?.id).toBe('a');
    expect(findDuplicate({ ...receipt, merchant: 'Green SM' }, [ride])?.id).toBe('a');
    // A payee that is someone else is another payment.
    expect(findDuplicate({ ...receipt, merchant: 'Phúc Long' }, [ride])).toBeNull();
  });

  it('allows a fee of at most one percent of the payment, never two different prices', () => {
    expect(FEE_SLACK_RATIO).toBe(0.01);
    const coffee = { ...base, source: 'applePay' as const, status: 'caught' as const };
    const notice = (amount: number) => ({ amount, source: 'alert' as const, at: at(30_000) });
    // 450₫ on 45.000₫ is a fee; 1.000₫ is another coffee; 455₫ is past one percent of 45.455₫.
    expect(findDuplicate(notice(45_450), [coffee])?.id).toBe('a');
    expect(findDuplicate(notice(46_000), [coffee])).toBeNull();
    expect(findDuplicate(notice(45_455), [coffee])).toBeNull();
    // Typed spends and the same source never take a fee match either.
    expect(findDuplicate(notice(45_450), [{ ...coffee, source: 'manual' as const }])).toBeNull();
    expect(findDuplicate({ ...notice(45_450), source: 'applePay' }, [coffee])).toBeNull();
    // Outside the windows a fee apart is still two payments.
    expect(
      findDuplicate({ ...notice(45_450), source: 'applePay', at: at(10 * 60_000) }, [
        { ...coffee, source: 'alert' as const },
      ]),
    ).toBeNull();
  });

  it('prefers the payment of the same amount over one a fee apart', () => {
    const near = { ...base, id: 'fee', amount: 45_400, source: 'alert' as const, at: at(10_000) };
    const exact = { ...base, id: 'exact', source: 'alert' as const, at: at(120_000) };
    expect(findDuplicate({ amount: 45_000, source: 'email', at: at(0) }, [near, exact])?.id).toBe(
      'exact',
    );
  });

  it('looks for a twin among spends of the same amount, a fee apart, or paid abroad', () => {
    expect(mayBeSamePayment({ amount: 32_000 }, 32_300)).toBe(true);
    expect(mayBeSamePayment({ amount: 32_000 }, 32_000)).toBe(true);
    expect(mayBeSamePayment({ amount: 32_000 }, 33_000)).toBe(false);
    expect(mayBeSamePayment({ amount: 0, foreignAmount: { currency: 'USD', amount: 10 } }, 0)).toBe(
      true,
    );
    expect(mayBeSamePayment({ amount: 0 }, 0)).toBe(false);
  });

  it('never merges money in with money out, nor a refund with the spend it gives back', () => {
    const spent = { ...base, source: 'alert' as const, status: 'caught' as const };
    const refund = { amount: 45_000, source: 'email' as const, at: at(30_000) };
    expect(findDuplicate({ ...refund, direction: 'in' }, [spent])).toBeNull();
    expect(findDuplicate(refund, [{ ...spent, direction: 'in' }])).toBeNull();
    expect(findDuplicate({ ...refund, direction: 'out' }, [spent])?.id).toBe('a');
    // Money in seen twice (the bank's alert and its email) is one movement.
    expect(findDuplicate({ ...refund, direction: 'in' }, [{ ...spent, direction: 'in' }])?.id).toBe(
      'a',
    );
  });

  it('matches two sightings of one charge abroad by the amount paid, before either is priced', () => {
    const tapped = {
      ...base,
      source: 'applePay' as const,
      status: 'caught' as const,
      amount: 0,
      foreignAmount: { currency: 'USD', amount: 99 },
    };
    const emailed = { amount: 0, source: 'email' as const, at: at(30_000) };
    const usd = (amount: number) => ({ ...emailed, foreignAmount: { currency: 'USD', amount } });
    expect(findDuplicate(usd(99), [tapped])?.id).toBe('a');
    expect(findDuplicate(usd(99.5), [tapped])).toBeNull();
    expect(
      findDuplicate({ ...emailed, foreignAmount: { currency: 'SGD', amount: 99 } }, [tapped]),
    ).toBe(null);
    expect(findDuplicate(emailed, [tapped])).toBeNull();
  });

  it('never merges cash, which no other source can have seen', () => {
    expect(findDuplicate({ amount: 45_000, source: 'cash', at: at(0) }, [base])).toBeNull();
    const cash = { ...base, source: 'cash' as const, status: 'kept' as const };
    expect(findDuplicate({ amount: 45_000, source: 'qr', at: at(0) }, [cash])).toBeNull();
    expect(findDuplicate({ amount: 45_000, source: 'email', at: at(0) }, [cash])).toBeNull();
  });

  it('picks the nearest in time', () => {
    const near = { ...base, id: 'near', at: at(60_000) };
    const far = { ...base, id: 'far', at: at(-150_000) };
    expect(findDuplicate({ amount: 45_000, source: 'email', at: at(0) }, [far, near])?.id).toBe(
      'near',
    );
  });

  it('refuses a zero amount or an unreadable time', () => {
    expect(
      findDuplicate({ amount: 0, source: 'email', at: at(0) }, [{ ...base, amount: 0 }]),
    ).toBeNull();
    expect(findDuplicate({ amount: 45_000, source: 'email', at: 'nope' }, [base])).toBeNull();
  });
});

describe('mergedStatus', () => {
  it('is confirmed once either side was', () => {
    expect(mergedStatus('pending', 'kept')).toBe('kept');
    expect(mergedStatus('kept', 'caught')).toBe('kept');
  });
  it('otherwise stays as the first sighting was', () => {
    expect(mergedStatus('pending', 'caught')).toBe('pending');
  });
});
