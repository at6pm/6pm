import { describe, expect, it } from '@jest/globals';

import {
  daysOfPeriod,
  isSubscriptionProduct,
  lookOfProduct,
  maxPlanOfProduct,
  maxSubscriptionOfProduct,
  playSubscriptionsUrl,
  storeProductOf,
} from './products';

describe('store identifiers', () => {
  it('reads a Google Play subscription named with its base plan as the product', () => {
    expect(storeProductOf('ai.sixpm.app.max.yearly:yearly')).toBe('ai.sixpm.app.max.yearly');
    expect(maxPlanOfProduct('ai.sixpm.app.max.yearly:yearly')).toBe('yearly');
    expect(maxPlanOfProduct('ai.sixpm.app.max.monthly:monthly')).toBe('monthly');
  });

  it('reads App Store and one-time identifiers as they are', () => {
    expect(maxPlanOfProduct('ai.sixpm.app.max.monthly')).toBe('monthly');
    expect(lookOfProduct('ai.sixpm.app.look.neon')).toBe('neon');
    expect(maxPlanOfProduct('ai.sixpm.app.look.neon')).toBeNull();
    expect(lookOfProduct('something.else')).toBeNull();
  });

  it('knows Max bought once from the plans that renew', () => {
    expect(maxPlanOfProduct('ai.sixpm.app.max.lifetime')).toBe('lifetime');
    expect(isSubscriptionProduct('ai.sixpm.app.max.lifetime')).toBe(false);
    expect(isSubscriptionProduct('ai.sixpm.app.max.yearly')).toBe(true);
    expect(isSubscriptionProduct('ai.sixpm.app.max.monthly:monthly')).toBe(true);
    expect(isSubscriptionProduct('ai.sixpm.app.look.neon')).toBe(false);
  });

  it('counts only the plans that renew as plans that are sold', () => {
    expect(maxSubscriptionOfProduct('ai.sixpm.app.max.yearly:yearly')).toBe('yearly');
    expect(maxSubscriptionOfProduct('ai.sixpm.app.max.monthly')).toBe('monthly');
    expect(maxSubscriptionOfProduct('ai.sixpm.app.max.lifetime')).toBeNull();
    expect(maxSubscriptionOfProduct('ai.sixpm.app.look.neon')).toBeNull();
  });
});

describe('free trial periods', () => {
  it('counts an ISO 8601 period in days', () => {
    expect(daysOfPeriod('P7D')).toBe(7);
    expect(daysOfPeriod('P1W')).toBe(7);
    expect(daysOfPeriod('P2W')).toBe(14);
    expect(daysOfPeriod('P1M')).toBe(30);
    expect(daysOfPeriod('P1Y')).toBe(365);
  });

  it('reads nothing it cannot parse', () => {
    expect(daysOfPeriod('')).toBeNull();
    expect(daysOfPeriod('P1W3D')).toBeNull();
    expect(daysOfPeriod('7 days')).toBeNull();
  });
});

describe('playSubscriptionsUrl', () => {
  it("opens this app among the customer's subscriptions on Google Play", () => {
    expect(playSubscriptionsUrl('app.at6pm')).toBe(
      'https://play.google.com/store/account/subscriptions?package=app.at6pm',
    );
  });

  it('opens the subscriptions page when the package is not known', () => {
    expect(playSubscriptionsUrl(null)).toBe('https://play.google.com/store/account/subscriptions');
  });
});
