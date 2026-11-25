import type { LookId } from '@6pm/theme';

/** The six classic looks, 49.000₫ each, bought once. */
export const CLASSIC_LOOKS = ['lacquer', 'glaze', 'riso', 'monsoon', 'cafe', 'neon'] as const;
/** The three living scenes, 99.000₫ each, bought once. */
export const SCENE_LOOKS = ['expo', 'paper', 'lantern'] as const;
/** Every look that is sold: the rest of the catalogue (Basic, Golden Hour) is free. */
export const PAID_LOOKS = [...CLASSIC_LOOKS, ...SCENE_LOOKS] as const satisfies readonly LookId[];
export type PaidLookId = (typeof PAID_LOOKS)[number];

export function isPaidLook(id: string): id is PaidLookId {
  return (PAID_LOOKS as readonly string[]).includes(id);
}

/**
 * Product identifiers as they exist in App Store Connect and Google Play. One set for every build:
 * the dev app resolves them through the sandbox (or a Play testing track) like the production app.
 */
const STORE_PREFIX = 'ai.sixpm.app';

/** A look's one-time purchase (a non-consumable). */
export function lookProductId(look: PaidLookId): string {
  return `${STORE_PREFIX}.look.${look}`;
}

/** The RevenueCat entitlement a look's purchase grants. */
export function lookEntitlementId(look: PaidLookId): string {
  return `look_${look}`;
}

/** Every plan that can hold Max, including Max bought once, which is no longer sold. */
export const MAX_PLANS = ['monthly', 'yearly', 'lifetime'] as const;
export type MaxPlan = (typeof MAX_PLANS)[number];

/**
 * The plans that renew: subscriptions in the existing "Premium Subscriptions" group. They are the
 * only plans the Max sheet offers.
 */
export const MAX_SUBSCRIPTIONS = ['monthly', 'yearly'] as const satisfies readonly MaxPlan[];
export type MaxSubscription = (typeof MAX_SUBSCRIPTIONS)[number];

/**
 * Max by the month or the year, and Max bought once: a one-time purchase (a non-consumable) that
 * never renews. Max bought once is off sale; its identifier stays so that whoever bought it is
 * still read as Max. The store decides where each plan that renews is sold; a plan it does not
 * list is not offered.
 */
export const MAX_PRODUCTS: Readonly<Record<MaxPlan, string>> = {
  monthly: `${STORE_PREFIX}.max.monthly`,
  yearly: `${STORE_PREFIX}.max.yearly`,
  lifetime: `${STORE_PREFIX}.max.lifetime`,
};

/**
 * The one entitlement Max is. RevenueCat grants it for every Max product and for the earlier
 * subscriptions, so the app only ever asks for this and never for a product identifier.
 */
export const MAX_ENTITLEMENT = 'max';

/** The plan the Max sheet opens on. */
export const PRESELECTED_MAX_PLAN: MaxSubscription = 'yearly';

export const LOOK_PRODUCT_IDS: readonly string[] = PAID_LOOKS.map(lookProductId);

/**
 * The product a store identifier names. Google Play names a subscription with its base plan
 * (`ai.sixpm.app.max.yearly:yearly`); the App Store and one-time products name the product alone.
 */
export function storeProductOf(identifier: string): string {
  const colon = identifier.indexOf(':');
  return colon === -1 ? identifier : identifier.slice(0, colon);
}

export function lookOfProduct(productId: string): PaidLookId | null {
  const product = storeProductOf(productId);
  return PAID_LOOKS.find((look) => lookProductId(look) === product) ?? null;
}

export function maxPlanOfProduct(productId: string): MaxPlan | null {
  const product = storeProductOf(productId);
  return MAX_PLANS.find((plan) => MAX_PRODUCTS[plan] === product) ?? null;
}

/** The plan that renews a store identifier names; null for Max bought once and anything else. */
export function maxSubscriptionOfProduct(productId: string): MaxSubscription | null {
  const plan = maxPlanOfProduct(productId);
  return MAX_SUBSCRIPTIONS.find((sold) => sold === plan) ?? null;
}

/** Whether the store sells this product as a subscription; everything else is bought once. */
export function isSubscriptionProduct(productId: string): boolean {
  return maxSubscriptionOfProduct(productId) !== null;
}

const DAYS_IN: Readonly<Record<string, number>> = { D: 1, W: 7, M: 30, Y: 365 };

/** An ISO 8601 period (`P1W`, `P7D`, `P1M`) in days, as the store counts a free trial; null if unread. */
export function daysOfPeriod(iso: string): number | null {
  const match = /^P(\d+)([DWMY])$/.exec(iso);
  if (!match) return null;
  const perUnit = DAYS_IN[match[2] ?? ''];
  return perUnit === undefined ? null : Number(match[1]) * perUnit;
}

/** The pages a subscription screen must link to. */
export const LEGAL_LINKS = {
  terms: 'https://at6pm.app/terms',
  privacy: 'https://at6pm.app/privacy',
  /** 6pm's source, open under the Apache License 2.0. */
  source: 'https://github.com/at6pm/6pm',
} as const;

/** Google Play's own page for the subscriptions of one app, where one is changed or cancelled. */
export function playSubscriptionsUrl(packageName: string | null): string {
  const base = 'https://play.google.com/store/account/subscriptions';
  return packageName ? `${base}?package=${encodeURIComponent(packageName)}` : base;
}
