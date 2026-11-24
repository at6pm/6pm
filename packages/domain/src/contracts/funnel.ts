import { z } from 'zod';

/**
 * `POST /v1/funnel`: anonymous counts of how far new people get. A report says which steps this
 * copy of the app reached, with the platform, the app version and the language, and nothing else:
 * no device token, no install id, no amounts, merchants, banks or words. The server adds one to a
 * counter per step and keeps no row per phone, so two reports can never be tied together.
 *
 * Steps that happen over the first weeks carry `day`: whole days since the copy was first opened
 * (0 is that day). The window is the first 30 days; nothing later is counted by day.
 */
export const FUNNEL_LAST_DAY = 30;

/** At most this many steps in one report; a phone sends a longer backlog in turns. */
export const FUNNEL_BATCH_MAX = 40;

/** Onboarding's ten steps, in order, by what each asks. */
export const FUNNEL_ONBOARDING_STEPS = [
  'welcome',
  'privacy',
  'money_in',
  'bills',
  'future_you',
  'pay_with',
  'ai',
  'catching',
  'close_time',
  'first_number',
] as const;
export type FunnelOnboardingStep = (typeof FUNNEL_ONBOARDING_STEPS)[number];

/**
 * The way a spend was caught, as the phone stores it: `alert` is a bank or wallet notification
 * (Android's notification access, or the iPhone's Shortcuts automation), `applePay` the Wallet
 * automation, `shared` a shared receipt, `qr` a scan, `email` the receipt address.
 */
export const FUNNEL_WAYS = [
  'alert',
  'applePay',
  'email',
  'shared',
  'qr',
  'voice',
  'manual',
  'cash',
] as const;
export type FunnelWay = (typeof FUNNEL_WAYS)[number];

/** The ways that catch with nobody opening 6pm: a notification, a Wallet tap, an email. */
export const FUNNEL_AUTOMATIC_WAYS = [
  'alert',
  'applePay',
  'email',
] as const satisfies readonly FunnelWay[];

/** Where the Max sheet was opened from (the app's `MaxFrom`). */
export const FUNNEL_MAX_FROM = [
  'looks',
  'ask',
  'pots',
  'travel',
  'backup',
  'diary',
  'widgets',
  'icons',
  'buddy',
] as const;

export const FUNNEL_MAX_PLANS = ['monthly', 'yearly', 'lifetime'] as const;

/** Where a person said they heard of 6pm, as a Max code names it. */
export const FUNNEL_CHANNELS = [
  'threads',
  'youtube',
  'facebook',
  'tinhte',
  'friend',
  'other',
] as const;
export type FunnelChannel = (typeof FUNNEL_CHANNELS)[number];

/** A count over the first week, 0 to 7, as text so every step's detail is one column. */
export const FUNNEL_WEEK_COUNTS = ['0', '1', '2', '3', '4', '5', '6', '7'] as const;

export const FUNNEL_PLATFORMS = ['ios', 'android'] as const;

/** The app's languages (`@6pm/i18n`). */
export const FUNNEL_LANGUAGES = [
  'en',
  'vi',
  'zh-Hans',
  'ja',
  'ko',
  'th',
  'id',
  'es',
  'fr',
  'de',
] as const;

const day = z.number().int().min(0).max(FUNNEL_LAST_DAY);
const plain = <S extends string>(step: S) => z.strictObject({ step: z.literal(step) });
const onDay = <S extends string>(step: S) => z.strictObject({ step: z.literal(step), day });
const withDetail = <S extends string, D extends readonly [string, ...string[]]>(
  step: S,
  details: D,
) => z.strictObject({ step: z.literal(step), detail: z.enum(details) });
const wayOnDay = <S extends string>(step: S) =>
  z.strictObject({ step: z.literal(step), detail: z.enum(FUNNEL_WAYS), day });

/** Every step, each with only the fields it may carry. Anything else is refused. */
export const funnelEventSchema = z.discriminatedUnion('step', [
  /** The first time this copy of the app opened. */
  plain('first_open'),
  /** An onboarding step shown. */
  withDetail('onboarding_step', FUNNEL_ONBOARDING_STEPS),
  /** Onboarding finished: the month is set up. */
  plain('onboarding_done'),
  /** The app opened on this day (sent once a day, days 1 to 30). */
  onDay('open'),
  /** The first spend this copy caught, by the way it came. */
  wayOnDay('first_capture'),
  /** Something was caught this way on this day (once per way and day). */
  wayOnDay('capture'),
  /** Something was caught, any way, on this day. */
  onDay('capture_day'),
  /** Something was caught on this day with nobody opening 6pm (`FUNNEL_AUTOMATIC_WAYS`). */
  onDay('auto_capture_day'),
  onDay('first_close'),
  /** A day was closed on this day. */
  onDay('close'),
  /** At the end of the first week: on how many of its days something was caught. */
  withDetail('week_capture_days', FUNNEL_WEEK_COUNTS),
  /** At the end of the first week: how many days were closed. */
  withDetail('week_closes', FUNNEL_WEEK_COUNTS),
  /** The Max sheet opened, by where from. */
  withDetail('max_shown', FUNNEL_MAX_FROM),
  /** Max bought, by plan. */
  withDetail('max_bought', FUNNEL_MAX_PLANS),
  /** Max bought by someone who said where they heard of 6pm. */
  withDetail('max_bought_from', FUNNEL_CHANNELS),
]);
export type FunnelEvent = z.infer<typeof funnelEventSchema>;
export type FunnelStep = FunnelEvent['step'];

export const funnelReportSchema = z.strictObject({
  platform: z.enum(FUNNEL_PLATFORMS),
  /** The store version, "2.2.2". */
  version: z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}$/),
  language: z.enum(FUNNEL_LANGUAGES),
  events: z.array(funnelEventSchema).min(1).max(FUNNEL_BATCH_MAX),
});
export type FunnelReport = z.infer<typeof funnelReportSchema>;

export const funnelResponseSchema = z.object({ counted: z.number().int().nonnegative() });

/** One step's identity: the same step reached twice is one key, so it is counted once. */
export function funnelKey(event: FunnelEvent): string {
  const detail = 'detail' in event ? event.detail : '';
  const at = 'day' in event ? String(event.day) : '';
  return `${event.step}:${detail}:${at}`;
}
