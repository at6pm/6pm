import { describe, expect, it } from 'vitest';

import { currencyOf, VND } from '../money/currency';
import { payCycleOn } from '../plan/pay-cycle';
import { addDays } from '../time/local-date';
import { crc16CcittFalse } from '../vietqr/crc16';
import { parseVietQR } from '../vietqr/parse-vietqr';
import { moneyInAsk } from './money-in';
import {
  coveredSpend,
  holderName,
  namesPerson,
  OWED_NAMED_DAYS,
  owedByPerson,
  owedPaybackFor,
  owedTotal,
  PAYBACK_DAYS,
  requestNote,
  REQUEST_NOTE_MAX,
  requestPayload,
  splitByAmount,
  splitEqually,
  type OwedLine,
} from './owed';

const USD = currencyOf('USD');
const DINNER = '2026-10-03';

/** The acceptance story: a 1,2tr Lẩu Manwah dinner split four ways with Linh, Nam and Huy. */
const dinner: OwedLine[] = [
  { id: 'linh', spendId: 'lau', name: 'Linh', amount: 300_000, day: DINNER },
  { id: 'nam', spendId: 'lau', name: 'Nam', amount: 300_000, day: DINNER },
  { id: 'huy', spendId: 'lau', name: 'Huy', amount: 300_000, day: DINNER },
];
const payback = (day: string, amount: number, merchant: string) => ({ day, amount, merchant });

describe('splitting a spend', () => {
  it('splits equally, the user keeping a quarter of a 1,2tr dinner', () => {
    expect(splitEqually(1_200_000, 4, VND)).toEqual({
      mine: 300_000,
      others: [300_000, 300_000, 300_000],
    });
  });

  it('rounds the others down to a thousand and puts the đồng left over on the user', () => {
    const split = splitEqually(1_000_000, 3, VND);
    expect(split).toEqual({ mine: 334_000, others: [333_000, 333_000] });
    const odd = splitEqually(1_234_567, 4, VND);
    expect(odd.others).toEqual([308_000, 308_000, 308_000]);
    expect(odd.mine).toBe(310_567);
    expect(odd.mine + owedTotal(odd.others.map((amount) => ({ amount })))).toBe(1_234_567);
  });

  it('rounds to the cent in other currencies', () => {
    expect(splitEqually(10_000, 3, USD)).toEqual({ mine: 3_334, others: [3_333, 3_333] });
  });

  it('is the whole bill for one person', () => {
    expect(splitEqually(450_000, 1, VND)).toEqual({ mine: 450_000, others: [] });
  });

  it('by amount, gives the user what the others leave', () => {
    expect(splitByAmount(1_200_000, [300_000, 250_000, 300_000])).toEqual({
      mine: 350_000,
      others: [300_000, 250_000, 300_000],
    });
    expect(splitByAmount(1_200_000, [600_000, 600_000])).toEqual({
      mine: 0,
      others: [600_000, 600_000],
    });
  });

  it('by amount, refuses shares above the bill or at nothing', () => {
    expect(splitByAmount(1_200_000, [800_000, 500_000])).toBeNull();
    expect(splitByAmount(1_200_000, [0, 300_000])).toBeNull();
    expect(splitByAmount(1_200_000, [300_000.5])).toBeNull();
  });
});

describe('matching money in to who owes', () => {
  it('finds the sender’s line by name, as the bank prints it', () => {
    expect(namesPerson('NGUYEN THU LINH', 'Linh')).toBe(true);
    expect(namesPerson('Trần Văn Nam', 'nam')).toBe(true);
    expect(namesPerson('NGUYEN THU LINH', 'Thu Linh')).toBe(true);
    expect(namesPerson('NGUYEN VAN HUY', 'Linh')).toBe(false);
    expect(namesPerson('NGUYEN THU LINH', null)).toBe(false);
    expect(owedPaybackFor(payback(addDays(DINNER, 2), 300_000, 'TRAN VAN NAM'), dinner)).toEqual({
      ids: ['nam'],
      name: 'Nam',
      spendId: 'lau',
    });
  });

  it('asks about a line of that amount when the sender is nobody on the list', () => {
    expect(owedPaybackFor(payback(addDays(DINNER, 2), 300_000, 'MOMO'), dinner)?.ids).toHaveLength(
      1,
    );
  });

  it('asks only about the sender’s own lines when they have some', () => {
    const lines: OwedLine[] = [
      { id: 'linh', spendId: 'lau', name: 'Linh', amount: 150_000, day: DINNER },
      { id: 'nam', spendId: 'lau', name: 'Nam', amount: 300_000, day: DINNER },
    ];
    expect(owedPaybackFor(payback(addDays(DINNER, 1), 300_000, 'NGUYEN THU LINH'), lines)).toBe(
      null,
    );
  });

  it('needs the exact amount', () => {
    expect(owedPaybackFor(payback(addDays(DINNER, 2), 299_000, 'NGUYEN THU LINH'), dinner)).toBe(
      null,
    );
  });

  it('pays every line of one person when it is their total', () => {
    const lines: OwedLine[] = [
      { id: 'lau', spendId: 'lau', name: 'Linh', amount: 300_000, day: DINNER },
      { id: 'grab', spendId: 'grab', name: 'linh ', amount: 150_000, day: '2026-10-05' },
    ];
    expect(owedPaybackFor(payback('2026-10-07', 450_000, 'NGUYEN THU LINH'), lines)).toEqual({
      ids: ['grab', 'lau'],
      name: 'linh ',
      spendId: 'grab',
    });
  });

  it('reaches back 60 days for a named line, 21 for one with no name', () => {
    const named = dinner[0] as OwedLine;
    const unnamed: OwedLine = { ...named, id: 'someone', name: null };
    const at = (days: number) => payback(addDays(DINNER, days), 300_000, 'NGUYEN THU LINH');
    expect(owedPaybackFor(at(OWED_NAMED_DAYS), [named])?.ids).toEqual(['linh']);
    expect(owedPaybackFor(at(OWED_NAMED_DAYS + 1), [named])).toBeNull();
    expect(owedPaybackFor(at(PAYBACK_DAYS), [unnamed])?.ids).toEqual(['someone']);
    expect(owedPaybackFor(at(PAYBACK_DAYS + 1), [unnamed])).toBeNull();
    expect(owedPaybackFor(at(-1), [named])).toBeNull();
  });

  it('prefers the newest line', () => {
    const lines: OwedLine[] = [
      { id: 'old', spendId: 'a', name: null, amount: 100_000, day: '2026-10-01' },
      { id: 'new', spendId: 'b', name: null, amount: 100_000, day: '2026-10-08' },
    ];
    expect(owedPaybackFor(payback('2026-10-09', 100_000, 'X'), lines)?.ids).toEqual(['new']);
  });

  it('is the close’s payback question, naming the person, before a spend with a note', () => {
    const cycle = payCycleOn('2026-10-05', { kind: 'lastDay' });
    const ask = moneyInAsk(
      { day: '2026-10-05', amount: 300_000, merchant: 'NGUYEN THU LINH' },
      {
        income: 17_400_000,
        cycle,
        spends: [
          {
            id: 'lau',
            day: DINNER,
            amount: 300_000,
            merchant: 'Lẩu Manwah',
            status: 'kept',
            note: 'Split 4 ways',
          },
        ],
        owed: dinner,
      },
    );
    expect(ask).toEqual({ kind: 'payback', spendId: 'lau', owed: ['linh'], name: 'Linh' });
  });
});

describe('who owes, by person', () => {
  it('groups lines by name, whoever owes most first', () => {
    const people = owedByPerson([
      { id: 'a', spendId: 's1', name: 'Linh', amount: 300_000, day: DINNER },
      { id: 'b', spendId: 's2', name: 'LINH', amount: 150_000, day: '2026-10-05' },
      { id: 'c', spendId: 's1', name: 'Tú', amount: 300_000, day: DINNER },
      { id: 'd', spendId: 's1', name: null, amount: 100_000, day: DINNER },
    ]);
    expect(people.map((p) => [p.name, p.total, p.lines.length])).toEqual([
      ['LINH', 450_000, 2],
      ['Tú', 300_000, 1],
      [null, 100_000, 1],
    ]);
  });
});

describe('covering a share', () => {
  it('becomes the user’s own spending today, never on the dinner’s day', () => {
    const today = addDays(DINNER, 9);
    expect(
      coveredSpend(dinner[1] as OwedLine, { categoryId: 'food', merchant: 'Lẩu Manwah' }, today),
    ).toEqual({ day: today, amount: 300_000, categoryId: 'food', merchant: 'Lẩu Manwah' });
  });
});

describe('asking with a VietQR', () => {
  it('is the published transfer QR for the account, made one-off with the amount and note', () => {
    // The vietqr_gen package's documented static QR for 9602091996 (see parse-vietqr.test).
    const published =
      '00020101021138540010A00000072701240006970407011096020919960208QRIBFTTA53037045802VN630434A0';
    const account = published.slice(12, published.indexOf('5303704'));
    const body =
      '000201010212' + account + '5303704540630000058' + '02VN62230819' + '6pm Lau Manwah Linh6304';
    expect(
      requestPayload({ bin: '970407', account: '9602091996' }, 300_000, '6pm Lau Manwah Linh'),
    ).toBe(body + crc16CcittFalse(body));
  });

  it('matches a one-off QR built by an independent encoder', () => {
    expect(
      requestPayload({ bin: '970436', account: '1023 334 821' }, 55_000, '2 suất bún chả'),
    ).toBe(
      '00020101021238540010A00000072701240006970436011010233348210208QRIBFTTA53037045405550005802VN621808142 suất bún chả63046507',
    );
  });

  it('asks for the share to the user’s account, with the note, as a bank reads it back', () => {
    const note = requestNote('Lẩu Manwah', 'Linh');
    expect(note).toBe('6pm Lau Manwah Linh');
    const payload = requestPayload({ bin: '970422', account: '0901234567' }, 300_000, note);
    expect(parseVietQR(payload ?? '')).toMatchObject({
      ok: true,
      bin: '970422',
      account: '0901234567',
      amount: 300_000,
      note: '6pm Lau Manwah Linh',
      dynamic: true,
    });
  });

  it('keeps the note short and plain', () => {
    const note = requestNote('Nhà hàng Hải sản Biển Đông Phú Quốc', 'Nguyễn Thu');
    expect(note.length).toBeLessThanOrEqual(REQUEST_NOTE_MAX);
    expect(note).toMatch(/^6pm [A-Za-z0-9 ]+ Nguyen Thu$/);
    expect(requestNote('Phở', null)).toBe('6pm Pho');
  });

  it('has no QR for an account NAPAS would refuse', () => {
    expect(requestPayload({ bin: '97042', account: '0901234567' }, 300_000, '6pm')).toBeNull();
    expect(requestPayload({ bin: '970422', account: '' }, 300_000, '6pm')).toBeNull();
  });

  it('writes the holder’s name as banks print it', () => {
    expect(holderName('Nguyễn Thu Hà')).toBe('NGUYEN THU HA');
  });
});
