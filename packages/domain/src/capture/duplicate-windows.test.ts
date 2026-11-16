import { describe, expect, it } from 'vitest';

import {
  DUPLICATE_WINDOW_MS,
  NOTICE_LATE_WINDOW_MS,
  SENT_WINDOW_MS,
  findDuplicate,
  sameAccount,
  sameReference,
  type NewSighting,
  type SightedSpend,
} from './duplicate';

// Every bank code, account and name here is made up.

const T0 = Date.parse('2026-11-12T03:00:00.000Z');
const at = (ms: number) => new Date(T0 + ms).toISOString();
const MIN = 60_000;

const alert = (over: Partial<SightedSpend> = {}): SightedSpend => ({
  id: 'alert',
  amount: 85_000,
  source: 'alert',
  status: 'caught',
  at: at(0),
  detail: 'MB Bank',
  merchant: 'TIEM BANH GIO',
  atKind: 'delivered',
  bank: 'MB Bank',
  accountTail: '456',
  ...over,
});

const mail = (over: Partial<NewSighting> = {}): NewSighting => ({
  amount: 85_000,
  source: 'email',
  at: at(0),
  detail: 'thongbao@mbmau.example',
  merchant: 'Tiem Banh Gio',
  bank: 'MB Bank',
  ...over,
});

describe('findDuplicate, windows by what each time is', () => {
  it('matches a printed or delivered time within three minutes, not after', () => {
    const shared = mail({ source: 'shared', detail: 'MB Bank', atKind: 'printed' });
    expect(findDuplicate({ ...shared, at: at(DUPLICATE_WINDOW_MS) }, [alert()])?.id).toBe('alert');
    expect(findDuplicate({ ...shared, at: at(DUPLICATE_WINDOW_MS + 1) }, [alert()])).toBeNull();
  });

  it('a delivered alert no longer waits fifteen minutes for a receipt that says its time', () => {
    const shared = mail({
      source: 'shared',
      detail: 'MB Bank',
      atKind: 'printed',
      at: at(8 * MIN),
    });
    expect(findDuplicate(shared, [alert()])).toBeNull();
    // Saying nothing of its time, the receipt keeps the windows by source.
    expect(findDuplicate({ ...shared, atKind: undefined, source: 'email' }, [alert()])?.id).toBe(
      'alert',
    );
  });

  it('gives a mail dated when it was sent six hours when the bank agrees, fifteen minutes when not', () => {
    const sent = mail({ atKind: 'sent', at: at(SENT_WINDOW_MS) });
    expect(findDuplicate(sent, [alert()])?.id).toBe('alert');
    expect(findDuplicate({ ...sent, at: at(SENT_WINDOW_MS + 1) }, [alert()])).toBeNull();
    const elsewhere = mail({ atKind: 'sent', bank: 'Vietcombank', detail: 'vcb@vcbmau.example' });
    expect(findDuplicate({ ...elsewhere, at: at(NOTICE_LATE_WINDOW_MS) }, [alert()])?.id).toBe(
      'alert',
    );
    expect(
      findDuplicate({ ...elsewhere, at: at(NOTICE_LATE_WINDOW_MS + 1) }, [alert()]),
    ).toBeNull();
  });

  it('measures from any sighting the spend already has, so the order they come in does not matter', () => {
    const joined = alert({
      at: at(0),
      seenBy: [{ source: 'shared', detail: 'MB Bank', at: at(2 * MIN), atKind: 'printed' }],
    });
    const late = mail({ source: 'applePay', detail: null, atKind: 'now', at: at(4 * MIN) });
    expect(findDuplicate(late, [joined])?.id).toBe('alert');
  });

  it('prefers a spend whose payee agrees over a nearer one that names another', () => {
    const near = alert({ id: 'near', merchant: 'QUAN CHAO MAU', at: at(30_000) });
    const named = alert({
      id: 'named',
      at: at(-2 * MIN),
      detail: 'Vietcombank',
      bank: 'Vietcombank',
    });
    const arriving = mail({
      source: 'shared',
      detail: 'MB Bank',
      atKind: 'printed',
      at: at(40_000),
    });
    expect(findDuplicate(arriving, [near, named])?.id).toBe('named');
  });

  it('never joins two sightings from one witness on amount and time', () => {
    const again = mail({ source: 'alert', detail: 'MB Bank', atKind: 'delivered', at: at(MIN) });
    expect(findDuplicate(again, [alert()])).toBeNull();
  });
});

describe('sameReference', () => {
  const code = { reference: 'FT26316XQ7', direction: 'out' as const, bank: 'MB Bank' };

  it('is one payment with the same code, bank and way, whatever the account tails print', () => {
    expect(sameReference(code, { ...code, reference: 'ft26316xq7', accountTail: '3456' })).toBe(
      true,
    );
    expect(sameReference({ ...code, accountTail: '456' }, { ...code, accountTail: '3456' })).toBe(
      true,
    );
  });

  it('is no key without its account and way', () => {
    expect(sameReference(code, { ...code, bank: 'Vietcombank' })).toBe(false);
    expect(sameReference(code, { ...code, bank: null })).toBe(false);
    expect(sameReference(code, { ...code, direction: 'in' })).toBe(false);
    expect(sameReference({ ...code, accountTail: '456' }, { ...code, accountTail: '789' })).toBe(
      false,
    );
    expect(sameReference(code, { ...code, reference: 'FT26316XQ8' })).toBe(false);
  });

  it('reads an account as the same only with the same bank', () => {
    expect(sameAccount({ bank: 'MB Bank' }, { bank: 'mb bank' })).toBe(true);
    expect(sameAccount({ bank: null }, { bank: null })).toBe(false);
  });
});
