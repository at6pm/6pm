import { describe, expect, it } from '@jest/globals';

import {
  anyTrialDays,
  maxOffersOf,
  quotedOffer,
  trialDaysFor,
  yearlySavingPercent,
  type StoreMaxProduct,
} from './max-pricing';
import { maxStatus } from './max-status';
import type { MaxOffer, Offerings } from './purchases-port';

const monthly: MaxOffer = {
  plan: 'monthly',
  productId: 'ai.sixpm.app.max.monthly',
  priceText: '99.000₫',
  price: 99_000,
  perMonthText: '99.000₫',
  perMonth: 99_000,
  trialDays: 7,
};
const yearly: MaxOffer = {
  plan: 'yearly',
  productId: 'ai.sixpm.app.max.yearly',
  priceText: '799.000₫',
  price: 799_000,
  perMonthText: '66.583₫',
  perMonth: 66_583,
  trialDays: 7,
};
const both: Offerings = { looks: {}, max: { monthly, yearly } };

describe('Max pricing from the store’s prices', () => {
  it('works the yearly saving out of the two prices', () => {
    expect(yearlySavingPercent(both)).toBe(33);
  });

  it('claims no saving without both plans, or when the yearly plan is not cheaper', () => {
    expect(yearlySavingPercent({ looks: {}, max: { yearly } })).toBeNull();
    expect(
      yearlySavingPercent({ looks: {}, max: { monthly, yearly: { ...yearly, price: 1_188_000 } } }),
    ).toBeNull();
  });

  it('quotes the yearly plan at its billed price, else the monthly one, else nothing', () => {
    expect(quotedOffer(both)).toBe(yearly);
    expect(quotedOffer({ looks: {}, max: { monthly } })).toBe(monthly);
    expect(quotedOffer({ looks: {}, max: {} })).toBeNull();
  });

  it('promises a trial only when the store offers this Apple ID one', () => {
    expect(trialDaysFor(both, 'yearly')).toBe(7);
    expect(
      trialDaysFor({ looks: {}, max: { yearly: { ...yearly, trialDays: null } } }, 'yearly'),
    ).toBeNull();
    expect(
      trialDaysFor({ looks: {}, max: { yearly: { ...yearly, trialDays: 0 } } }, 'yearly'),
    ).toBeNull();
    expect(anyTrialDays(both)).toBe(7);
    expect(anyTrialDays({ looks: {}, max: {} })).toBeNull();
  });
});

describe('the plans the Max sheet offers', () => {
  const listed = (identifier: string, price: number): StoreMaxProduct => ({
    identifier,
    priceString: `${price}₫`,
    price,
    pricePerMonthString: null,
    pricePerMonth: null,
  });
  const store = [
    listed('ai.sixpm.app.max.yearly:yearly', 299_000),
    listed('ai.sixpm.app.max.monthly:monthly', 49_000),
  ];

  it('offers the plans that renew, each with the trial this person can still take', () => {
    const max = maxOffersOf(store, (p) => (p.identifier.includes('yearly') ? 7 : null));
    expect(Object.keys(max).sort()).toEqual(['monthly', 'yearly']);
    expect(max.yearly).toMatchObject({
      plan: 'yearly',
      productId: 'ai.sixpm.app.max.yearly:yearly',
      priceText: '299000₫',
      price: 299_000,
      trialDays: 7,
    });
    expect(max.monthly?.trialDays).toBeNull();
  });

  it('never offers Max bought once, even when the store still lists it', () => {
    const max = maxOffersOf(
      [
        ...store,
        listed('ai.sixpm.app.max.lifetime', 799_000),
        listed('ai.sixpm.app.look.neon', 49_000),
      ],
      () => null,
    );
    expect(Object.keys(max).sort()).toEqual(['monthly', 'yearly']);
    expect(Object.values(max).map((offer) => offer.productId)).not.toContain(
      'ai.sixpm.app.max.lifetime',
    );
    expect(maxOffersOf([listed('ai.sixpm.app.max.lifetime', 799_000)], () => null)).toEqual({});
  });
});

describe('what a Max customer is told about their plan', () => {
  const active = {
    active: true,
    plan: 'yearly' as const,
    inTrial: false,
    trialEndsAt: null,
    renewsAt: 200,
    endsAt: null,
    willRenew: true,
  };
  it('tells a trial’s end first, then the renewal, then the end of a cancelled plan', () => {
    expect(maxStatus({ ...active, inTrial: true, trialEndsAt: 100 })).toEqual({
      kind: 'trialEnds',
      at: 100,
    });
    expect(maxStatus(active)).toEqual({ kind: 'renews', at: 200 });
    expect(maxStatus({ ...active, willRenew: false, renewsAt: null, endsAt: 300 })).toEqual({
      kind: 'ends',
      at: 300,
    });
  });
  it('tells someone who bought Max once that it is theirs, with no date', () => {
    const once = { ...active, plan: 'lifetime' as const, renewsAt: null, willRenew: false };
    expect(maxStatus(once)).toEqual({ kind: 'forGood' });
    expect(maxStatus({ ...once, active: false })).toBeNull();
  });
  it('says nothing when Max is off or the store gave no date', () => {
    expect(maxStatus({ ...active, active: false })).toBeNull();
    expect(maxStatus({ ...active, renewsAt: null })).toBeNull();
  });
});
