import { describe, expect, it } from '@jest/globals';

import { currencyOf } from '@6pm/domain';

import { billTotal, chosenBills, dealDeck, NO_BILL_ANSWERS, type BillAnswers } from './bill-deck';
import {
  billDigits,
  billFromTyped,
  billLeading,
  billMillionsItems,
  billOf,
  CLOSE_HOURS,
  CLOSE_MINUTES,
  firstDay,
  futureYouOf,
  futureYouOfAnswers,
  landedFutureStartSteps,
  landedFutureYouOf,
  LANDED_FUTURE_STEPS,
  incomeDigits,
  incomeFromTyped,
  incomeLeads,
  incomeMax,
  incomeMillionsItems,
  incomeOf,
  leadingMillionsItems,
  LEADING_DIGITS,
  markAfter,
  millionsPlace,
  PAYDAY_CELLS,
  paydayCell,
  paydayOfCell,
  startingIncome,
  zerosBelow,
} from './onboarding-maths';

const VND = currencyOf('VND');
const USD = currencyOf('USD');
const JPY = currencyOf('JPY');
const KRW = currencyOf('KRW');

describe('onboarding maths', () => {
  it('reads the wheels as the digits of a real amount', () => {
    expect(incomeDigits(15_500_000)).toEqual({ lead: 0, millions: 15, hundreds: 5 });
    expect(incomeOf(0, 15, 5)).toBe(15_500_000);
    expect(incomeDigits(0)).toEqual({ lead: 0, millions: 1, hundreds: 0 });
    expect(incomeDigits(250_300_000)).toEqual({ lead: 2, millions: 50, hundreds: 3 });
    expect(incomeOf(2, 50, 3)).toBe(250_300_000);
    expect(billDigits(3_520_000)).toEqual({ millions: 3, hundreds: 5, tens: 2 });
    expect(billOf(0, 2, 2)).toBe(220_000);
  });

  it('holds an amount that may be nothing, as what was spent before 6pm', () => {
    expect(incomeDigits(300_000, VND, 0)).toEqual({ lead: 0, millions: 0, hundreds: 3 });
    expect(incomeDigits(0, VND, 0)).toEqual({ lead: 0, millions: 0, hundreds: 0 });
    expect(incomeDigits(-5, VND, 0)).toEqual({ lead: 0, millions: 0, hundreds: 0 });
    expect(incomeOf(0, 0, 3, VND, 0)).toBe(300_000);
    expect(incomeOf(0, 0, 0, VND, 0)).toBe(0);
    expect(incomeOf(0, 2, 4, VND, 0)).toBe(2_400_000);
    expect(incomeFromTyped(40_000, VND, 0)).toBe(0);
    expect(incomeFromTyped(260_000, VND, 0)).toBe(300_000);
    // An estimate off the wheels' step goes to the nearest one, never to a blank 0.
    expect(incomeDigits(960_000, VND, 0)).toEqual({ lead: 0, millions: 1, hundreds: 0 });
    expect(incomeDigits(430_000, VND, 0)).toEqual({ lead: 0, millions: 0, hundreds: 4 });
    // Money in keeps its floor.
    expect(incomeDigits(300_000)).toEqual({ lead: 0, millions: 1, hundreds: 0 });
    expect(incomeFromTyped(40_000)).toBe(1_000_000);
  });

  it('leaves the millions blank under a million', () => {
    expect(leadingMillionsItems(0)[0]).toBe('');
    expect(leadingMillionsItems(0)[1]).toBe('1');
    expect(leadingMillionsItems(0)).toHaveLength(100);
    expect(leadingMillionsItems(2)[0]).toBe('00');
  });

  it('sets money in from 1.000.000₫ up to 1.000.000.000₫ a month', () => {
    expect(incomeOf(0, 0, 0)).toBe(1_000_000);
    expect(incomeOf(10, 0, 0)).toBe(1_000_000_000);
    expect(incomeOf(10, 42, 7)).toBe(1_000_000_000);
    expect(incomeDigits(2_000_000_000)).toEqual({ lead: 10, millions: 0, hundreds: 0 });
  });

  it('sets the wheels to a typed amount, to the nearest step they hold', () => {
    expect(incomeFromTyped(15_350_000)).toBe(15_400_000);
    expect(incomeFromTyped(15_320_000)).toBe(15_300_000);
    expect(incomeDigits(incomeFromTyped(15_960_000))).toEqual({
      lead: 0,
      millions: 16,
      hundreds: 0,
    });
    expect(incomeFromTyped(200_000)).toBe(1_000_000);
    expect(incomeFromTyped(5_000_000_000)).toBe(1_000_000_000);
    expect(incomeFromTyped(1_234_567, USD)).toBe(1_230_000);
    expect(billFromTyped(1_234_567)).toBe(1_230_000);
    expect(billFromTyped(4_000)).toBe(0);
    expect(billFromTyped(250_000_000)).toBe(99_990_000);
    expect(billFromTyped(12_345, USD)).toBe(12_000);
  });

  it('lays payday on one strip: the days, then the last day, then it varies', () => {
    expect(paydayCell({ kind: 'sameDay', day: 5 })).toBe(4);
    expect(paydayCell({ kind: 'sameDay', day: 31 })).toBe(30);
    expect(paydayCell({ kind: 'lastDay' })).toBe(31);
    expect(paydayCell({ kind: 'varies' })).toBe(32);
    expect(PAYDAY_CELLS).toBe(33);
    for (let cell = 0; cell < PAYDAY_CELLS; cell++) {
      expect(paydayCell(paydayOfCell(cell))).toBe(cell);
    }
    expect(paydayOfCell(0)).toEqual({ kind: 'sameDay', day: 1 });
    expect(paydayOfCell(31)).toEqual({ kind: 'lastDay' });
    expect(paydayOfCell(32)).toEqual({ kind: 'varies' });
  });

  it('rounds Future you to the nearest 100.000₫', () => {
    expect(futureYouOf(15_500_000, 12)).toBe(1_900_000);
    expect(futureYouOf(15_500_000, 0)).toBe(0);
  });

  it('starts money in at 15.500.000₫', () => {
    expect(startingIncome()).toBe(15_500_000);
    expect(incomeMax()).toBe(1_000_000_000);
  });

  it('writes the wheels and their zeros as đồng are written', () => {
    expect(millionsPlace()).toBe(6);
    expect(incomeLeads()).toEqual(['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '1.0']);
    expect(incomeMillionsItems(0).slice(0, 2)).toEqual(['0', '1']);
    expect(incomeMillionsItems(1).slice(0, 2)).toEqual(['00', '01']);
    expect(markAfter(6, '.')).toBe('.');
    expect(markAfter(5, '.')).toBe('');
    expect(zerosBelow(5, '.')).toBe('00.000');
    expect(zerosBelow(4, '.')).toBe('0.000');
  });

  it('counts the wheels in steps of another currency', () => {
    // Dollars: the "millions" wheel counts $1,000 and the next $100, in cents.
    expect(millionsPlace(USD)).toBe(3);
    expect(incomeOf(0, 15, 5, USD)).toBe(1_550_000);
    expect(incomeDigits(1_550_000, USD)).toEqual({ lead: 0, millions: 15, hundreds: 5 });
    expect(incomeOf(0, 0, 0, USD)).toBe(100_000);
    expect(incomeMax(USD)).toBe(100_000_000);
    expect(incomeLeads(USD, ',').at(-1)).toBe('1,0');
    expect(zerosBelow(2, ',')).toBe('00');
    expect(billOf(1, 2, 3, USD)).toBe(123_000);
    expect(billDigits(123_000, USD)).toEqual({ millions: 1, hundreds: 2, tens: 3 });
    expect(futureYouOf(1_550_000, 12, USD)).toBe(190_000);
    // Yen: ¥10,000 a "million", so the group mark falls after the lead digit and in the zeros.
    expect(millionsPlace(JPY)).toBe(4);
    expect(incomeLeads(JPY, ',')[1]).toBe('1,');
    expect(zerosBelow(3, ',')).toBe(',000');
    // Won: ₩100,000 a "million", so the mark falls inside the two-digit wheel.
    expect(billMillionsItems(KRW, ',').slice(9, 12)).toEqual(['9', '1,0', '1,1']);
  });

  it('leaves the bill wheels blank ahead of the first digit', () => {
    expect(billMillionsItems().slice(0, 2)).toEqual(['', '1']);
    // 380.000₫: the millions lead and are blank, the hundreds and tens are digits.
    expect(billLeading(0, 3)).toEqual({ millions: true, hundreds: true, tens: false });
    // 50.000₫: the tens wheel would be blank only at 0, so its 5 is drawn alone.
    expect(billLeading(0, 0)).toEqual({ millions: true, hundreds: true, tens: true });
    // 2.000.000₫: the zeros after the 2 are digits.
    expect(billLeading(2, 0)).toEqual({ millions: false, hundreds: false, tens: false });
    expect(LEADING_DIGITS[0]).toBe('');
    expect(LEADING_DIGITS[3]).toBe('3');
  });

  it('starts money in at about 15.500.000₫ worth, on the wheels', () => {
    for (const c of [USD, JPY, KRW]) {
      const start = startingIncome(c);
      const { lead, millions, hundreds } = incomeDigits(start, c);
      expect(incomeOf(lead, millions, hundreds, c)).toBe(start);
    }
    // About $600 is below the wheels' least, $1,000.
    expect(startingIncome(USD)).toBe(100_000);
  });

  it('offers close times 15:00 to 23:45 in quarter hours', () => {
    expect(CLOSE_HOURS).toEqual(['15', '16', '17', '18', '19', '20', '21', '22', '23']);
    expect(CLOSE_MINUTES).toEqual(['00', '15', '30', '45']);
  });

  it('computes the first day with the same engine as Today', () => {
    // 9 Oct with payday on the 31st: 22 days left, so the money covers 23 days. Joining today,
    // 23 of the cycle's 32 days are still ahead: 11,2tr × 23/32 = 8.050.000₫.
    const day = firstDay(
      {
        income: 17_400_000,
        payday: { kind: 'sameDay', day: 31 },
        bills: 4_200_000,
        futureYou: 2_000_000,
      },
      '2026-10-09',
    );
    expect(day.days).toBe(23);
    expect(day.free).toBe(8_050_000);
    expect(day.line).toBe(350_000);
  });

  it('floors the first day to the home currency step', () => {
    const day = firstDay(
      { income: 1_741_000, payday: { kind: 'sameDay', day: 31 }, bills: 0, futureYou: 0 },
      '2026-10-09',
      USD,
    );
    expect(day.line % 100).toBe(0);
    expect(day.line).toBeGreaterThan(0);
  });

  it('never reveals a negative number', () => {
    const day = firstDay(
      { income: 1_000_000, payday: { kind: 'lastDay' }, bills: 5_000_000, futureYou: 0 },
      '2026-10-10',
    );
    expect(day.line).toBe(0);
  });
});

describe('spent since payday on the first number', () => {
  const month = {
    income: 15_000_000,
    payday: { kind: 'sameDay', day: 31 },
    bills: 5_000_000,
    futureYou: 2_000_000,
  } as const;

  it('prefills the estimate, so leaving it gives the same number', () => {
    const day = firstDay(month, '2026-10-20');
    // 8tr free, 20 of the cycle's 32 days gone: 5tr went before.
    expect(day.joined).toBe(true);
    expect(day.since).toBe('2026-09-30');
    expect(day.spentSincePayday).toBe(5_000_000);
    expect(firstDay({ ...month, spentSincePayday: null }, '2026-10-20')).toEqual(day);
  });

  it('counts the answer: (15 − 5 − 2 − 6)tr over 12 days', () => {
    const day = firstDay({ ...month, spentSincePayday: 6_000_000 }, '2026-10-20');
    expect(day.free).toBe(2_000_000);
    expect(day.line).toBe(166_000);
    expect(day.offerFutureYouAtPayday).toBe(false);
  });

  it('offers to start Future you at payday only when the cycle starts overspent', () => {
    const over = firstDay({ ...month, spentSincePayday: 9_000_000 }, '2026-10-20');
    expect(over.overspent).toBe(true);
    expect(over.line).toBe(0);
    expect(over.offerFutureYouAtPayday).toBe(true);
    const skipped = firstDay(
      { ...month, spentSincePayday: 9_000_000, futureYouAtPayday: true },
      '2026-10-20',
    );
    expect(skipped.futureYouSkipped).toBe(true);
    expect(skipped.free).toBe(1_000_000);
    expect(skipped.overspent).toBe(false);
    // A smaller answer takes the offer away, and the choice with it.
    const fits = firstDay(
      { ...month, spentSincePayday: 1_000_000, futureYouAtPayday: true },
      '2026-10-20',
    );
    expect(fits.offerFutureYouAtPayday).toBe(false);
    expect(fits.futureYouSkipped).toBe(false);
  });

  it('asks nothing when joining on payday', () => {
    expect(firstDay(month, '2026-10-31').joined).toBe(false);
  });
});

describe('bill deck', () => {
  it('deals an amount card after each yes and each picked option', () => {
    const answers: BillAnswers = {
      asks: { rent: true, power: false },
      multis: { subs: { picked: ['spotify', 'icloud'], done: true } },
      amounts: {},
      dueDays: {},
    };
    const deck = dealDeck(answers);
    expect(deck.map((d) => (d.type === 'amount' ? d.key : d.type))).toEqual([
      'ask',
      'rent',
      'ask',
      'ask',
      'multi',
      'subs:spotify',
      'subs:icloud',
      'multi',
      'multi',
    ]);
    expect(dealDeck(NO_BILL_ANSWERS)).toHaveLength(6);
  });

  it('asks what is being paid off: a card is a card bill, a trả góp asks its months left', () => {
    const answers: BillAnswers = {
      asks: {},
      multis: { debts: { picked: ['card', 'instalment', 'owe'], done: true } },
      amounts: { 'debts:card': 2_000_000, 'debts:instalment': 1_000_000, 'debts:owe': 500_000 },
      dueDays: {},
      monthsLeft: { 'debts:instalment': 9 },
    };
    const bills = chosenBills(dealDeck(answers), answers);
    expect(bills.map((b) => [b.key, b.kind, b.monthsLeft])).toEqual([
      ['debts:card', 'card', undefined],
      ['debts:instalment', 'other', 9],
      ['debts:owe', 'other', undefined],
    ]);
  });

  it('keeps answered bills, including ones put off without an amount', () => {
    const answers: BillAnswers = {
      asks: { rent: true },
      multis: { subs: { picked: ['spotify'], done: true } },
      amounts: { rent: 5_000_000, 'subs:spotify': 0, 'subs:netflix': 260_000 },
      dueDays: { rent: 5 },
    };
    const bills = chosenBills(dealDeck(answers), answers);
    // Netflix was unpicked after its amount was set: it is not a bill any more.
    expect(bills.map((b) => [b.key, b.amount, b.deckIndex, b.dueDay])).toEqual([
      ['rent', 5_000_000, 1, 5],
      ['subs:spotify', 0, 5, 1],
    ]);
    expect(billTotal(bills)).toBe(5_000_000);
  });
});

describe('Future you for money that only lands', () => {
  it('is an amount a month: it starts at 500.000₫, goes to nothing, and stops at 3.000.000₫', () => {
    const start = landedFutureStartSteps();
    expect(landedFutureYouOf(start)).toBe(500_000);
    expect(landedFutureYouOf(0)).toBe(0);
    expect(landedFutureYouOf(LANDED_FUTURE_STEPS + 5)).toBe(3_000_000);
    const landed = { landed: true, monthIncome: 0, percent: 12, landedSteps: start };
    expect(futureYouOfAnswers(landed)).toBe(500_000);
    // A pay counted on keeps its share.
    expect(futureYouOfAnswers({ ...landed, landed: false, monthIncome: 15_500_000 })).toBe(
      1_900_000,
    );
  });
});
