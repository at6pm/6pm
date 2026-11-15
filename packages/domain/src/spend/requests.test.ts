import { describe, expect, it } from 'vitest';

import { parseVietQR } from '../vietqr/parse-vietqr';
import { moneyInAsk } from './money-in';
import {
  owedByPerson,
  owedPaybackFor,
  REQUEST_NOTE_MAX,
  requestPayload,
  type OwedLine,
} from './owed';
import {
  asksByHand,
  isRequestCode,
  landsLessHeldBack,
  payersOf,
  REMIND_AFTER_DAYS,
  remindOffered,
  reminderTone,
  REQUEST_CODE_ALPHABET,
  requestByCode,
  requestCandidates,
  requestCode,
  requestCodeNote,
} from './requests';

type Request = OwedLine & { readonly job: string | null };

/** Vy's open strips on 24 Nov: two clients' jobs and Linh's share of a dinner. */
const gio: Request = {
  id: 'gio',
  spendId: 'gio',
  name: 'Nhà sách Gió',
  amount: 6_000_000,
  day: '2026-11-16',
  code: 'K3PA',
  work: true,
  job: 'Cover, part 2',
};
const diep: Request = {
  id: 'diep',
  spendId: 'diep',
  name: 'Cô Diệp',
  amount: 1_800_000,
  day: '2026-10-27',
  code: 'K7Q2',
  work: true,
  job: 'Menu, quán Lá',
};
const linh: Request = {
  id: 'linh',
  spendId: 'lau',
  name: 'Linh',
  amount: 300_000,
  day: '2026-10-03',
  job: null,
};
const open = [gio, diep, linh];

/** A random source that walks a fixed list of draws. */
function draws(...values: number[]) {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
}
const at = (char: string) => REQUEST_CODE_ALPHABET.indexOf(char) / REQUEST_CODE_ALPHABET.length;

describe('a request’s code', () => {
  it('uses no 0, O, 1 or I', () => {
    for (const char of '0O1I') expect(REQUEST_CODE_ALPHABET).not.toContain(char);
    expect(REQUEST_CODE_ALPHABET).toHaveLength(32);
  });

  it('is four characters with a letter and a digit, so it never reads as a word', () => {
    expect(isRequestCode('K7Q2')).toBe(true);
    expect(isRequestCode('K3PA')).toBe(true);
    expect(isRequestCode('TIEN')).toBe(false);
    expect(isRequestCode('2345')).toBe(false);
    expect(isRequestCode('K0Q2')).toBe(false);
    expect(isRequestCode('K7Q')).toBe(false);
  });

  it('is unique among the open strips’ codes', () => {
    const k7q2 = [at('K'), at('7'), at('Q'), at('2')];
    expect(requestCode([], draws(...k7q2))).toBe('K7Q2');
    // K7Q2 is taken, and TIEN has no digit: both are drawn again.
    const random = draws(
      ...k7q2,
      at('T'),
      at('I') + 0.001,
      at('E'),
      at('N'),
      ...k7q2,
      ...[at('K'), at('3'), at('P'), at('A')],
    );
    expect(requestCode(['k7q2'], random)).toBe('K3PA');
  });

  it('rides in the transfer note ahead of the job, in plain ASCII', () => {
    expect(requestCodeNote('K7Q2', 'Menu, quán Lá')).toBe('K7Q2 MENU QUAN LA');
    expect(requestCodeNote('K3PA', 'Bìa sách, đợt 2')).toBe('K3PA BIA SACH DOT 2');
    expect(requestCodeNote('K3PA', null)).toBe('K3PA');
    const long = requestCodeNote('K3PA', 'Bộ nhận diện thương hiệu, phần hai');
    expect(long.length).toBeLessThanOrEqual(REQUEST_NOTE_MAX);
    expect(long).toBe('K3PA BO NHAN DIEN THUONG');
  });

  it('is in the VietQR’s additional data a bank reads back', () => {
    const note = requestCodeNote('K7Q2', diep.job);
    const payload = requestPayload({ bin: '970407', account: '19036118866012' }, 1_800_000, note);
    expect(payload).not.toBeNull();
    expect(parseVietQR(payload ?? '')).toMatchObject({
      ok: true,
      amount: 1_800_000,
      note: 'K7Q2 MENU QUAN LA',
    });
  });
});

describe('the code finds its strip', () => {
  it('in the alert’s memo: Cô Diệp’s 1,8tr for the menu', () => {
    expect(requestByCode(['PHAM THI DIEP chuyen tien K7Q2 MENU QUAN LA'], open)).toBe(diep);
  });

  it('in lower case, or glued to the job where a bank dropped the space', () => {
    expect(requestByCode(['ck k7q2 menu quan la'], open)).toBe(diep);
    expect(requestByCode(['K7Q2MENU QUAN LA'], open)).toBe(diep);
  });

  it('only for open strips, and never inside another word', () => {
    expect(requestByCode(['chuyen khoan'], open)).toBeNull();
    expect(requestByCode(['AK7Q2B'], open)).toBeNull();
    expect(requestByCode(['K9ZZ MENU'], open)).toBeNull();
    expect(requestByCode([null, undefined], open)).toBeNull();
  });

  it('places money at the close before anything else, with what a client held back', () => {
    const context = { income: 0, cycle: { start: '2026-11-01', payday: '2026-12-01' }, spends: [] };
    expect(
      moneyInAsk(
        {
          day: '2026-11-24',
          amount: 1_800_000,
          merchant: 'PHAM THI DIEP',
          memo: 'K7Q2 MENU QUAN LA',
        },
        { ...context, owed: open },
      ),
    ).toEqual({ kind: 'request', lineId: 'diep', heldBack: 0 });
    expect(
      moneyInAsk(
        { day: '2026-11-27', amount: 5_400_000, merchant: 'TRAN MINH LAM', memo: 'K3PA BIA SACH' },
        { ...context, owed: open },
      ),
    ).toEqual({ kind: 'request', lineId: 'gio', heldBack: 600_000 });
  });
});

describe('no code: match it by hand', () => {
  const money = { amount: 5_400_000, merchant: 'TRAN MINH LAM' };

  it('offers the strip that fits less 10% held back first, then the rest by age', () => {
    const candidates = requestCandidates(money, open);
    expect(candidates.map((c) => [c.line.id, c.fit, c.heldBack])).toEqual([
      ['gio', 'heldBack', 600_000],
      ['linh', null, 0],
      ['diep', null, 0],
    ]);
  });

  it('puts a strip of the amount itself first too, and a known payer’s ahead', () => {
    const twin: Request = {
      ...gio,
      id: 'twin',
      name: 'Agency Tre',
      day: '2026-11-01',
      code: 'H4MX',
    };
    const payers = payersOf([{ name: 'Nhà sách Gió', payer: 'Tran Minh Lam' }]);
    expect(
      requestCandidates({ ...money, amount: 6_000_000 }, [twin, gio, linh], payers).map(
        (c) => c.line.id,
      ),
    ).toEqual(['gio', 'twin', 'linh']);
  });

  it('is asked of an unknown sender with no code while a work request is open', () => {
    expect(asksByHand({ coded: false, knownSender: false, lines: open })).toBe(true);
    expect(asksByHand({ coded: true, knownSender: false, lines: open })).toBe(false);
    expect(asksByHand({ coded: false, knownSender: true, lines: open })).toBe(false);
    expect(asksByHand({ coded: false, knownSender: false, lines: [linh] })).toBe(false);
    const context = {
      income: 0,
      cycle: { start: '2026-11-01', payday: '2026-12-01' },
      spends: [],
      owed: open,
    };
    const day = '2026-11-27';
    expect(moneyInAsk({ day, ...money, memo: 'chuyen khoan' }, context)).toEqual({
      kind: 'byHand',
    });
    // A sender something is remembered about is known: no question by hand.
    expect(
      moneyInAsk({ day, ...money, memo: 'chuyen khoan' }, { ...context, knownSender: true }),
    ).toBeNull();
    // Nor is one who has a strip of their own open.
    expect(
      moneyInAsk({ day, ...money, merchant: 'NGUYEN THU LINH', memo: 'ck' }, context),
    ).toBeNull();
  });

  it('never matches a request on its amount alone, while a friend’s share still is', () => {
    const day = '2026-11-24';
    expect(owedPaybackFor({ day, amount: 1_800_000, merchant: 'PHAM THI DIEP' }, open)).toBeNull();
    expect(owedPaybackFor({ day: '2026-10-05', amount: 300_000, merchant: 'X' }, open)).toEqual({
      ids: ['linh'],
      name: 'Linh',
      spendId: 'lau',
    });
  });

  it('knows a tenth held back to the đồng', () => {
    expect(landsLessHeldBack(5_400_000, 6_000_000)).toBe(true);
    expect(landsLessHeldBack(18_000_000, 20_000_000)).toBe(true);
    expect(landsLessHeldBack(5_500_000, 6_000_000)).toBe(false);
    expect(landsLessHeldBack(6_000_000, 6_000_000)).toBe(false);
  });
});

describe('clients beside friends', () => {
  it('groups requests by person, by amount as today', () => {
    expect(owedByPerson(open).map((p) => [p.name, p.total])).toEqual([
      ['Nhà sách Gió', 6_000_000],
      ['Cô Diệp', 1_800_000],
      ['Linh', 300_000],
    ]);
  });
});

describe('a reminder', () => {
  it('is offered once a strip is older than 14 days', () => {
    expect(REMIND_AFTER_DAYS).toBe(14);
    expect(remindOffered('2026-10-27', '2026-11-10')).toBe(false);
    expect(remindOffered('2026-10-27', '2026-11-11')).toBe(true);
  });

  it('is drafted in one tone by the strip’s age', () => {
    expect(reminderTone('2026-10-27', '2026-11-23')).toBe('first');
    expect(reminderTone('2026-10-27', '2026-11-26')).toBe('month');
    expect(reminderTone('2026-10-27', '2026-12-26')).toBe('twoMonths');
  });
});
