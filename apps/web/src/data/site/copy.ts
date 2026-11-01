import { siteCopyEn } from './copy-en';
import { siteCopyVi } from './copy-vi';
import type { DuoCopy } from './duo-copy';
import type { SurfacesCopy } from './surfaces-copy';

export type SiteLang = 'en' | 'vi';

/** One receipt in the six o'clock close, as the card prints it. */
export interface CloseCard {
  readonly no: string;
  readonly source: string;
  readonly time: string;
  readonly icon: string;
  readonly hue: number;
  readonly name: string;
  readonly category: string;
  /** What the day had kept before this one, and with it. */
  readonly from: string;
  readonly to: string;
  readonly amount: string;
  readonly meta: string;
}

/** One caught spend in the capture inbox. */
export type CaptureRow = readonly [
  name: string,
  source: string,
  amount: string,
  time: string,
  icon: string,
  hue: number,
];

/** One question in Ask 6pm, and the answer the phone gives. */
export interface AskExchange {
  readonly q: string;
  readonly a: string;
  /** The number before, struck through; empty when there is none. */
  readonly old: string;
  readonly big: string;
  readonly unit: string;
}

/** Everything the home page says in one language. Amounts are written out, in that market's money. */
export interface SiteCopy {
  readonly meta: { readonly title: string; readonly description: string };
  readonly nav: {
    readonly capture: string;
    readonly close: string;
    readonly surfaces: string;
    readonly privacy: string;
    readonly pricing: string;
    readonly blog: string;
    readonly wait: string;
    readonly store: string;
    readonly langLabel: string;
  };
  readonly hero: {
    readonly kickWait: string;
    readonly kickStore: string;
    readonly a: string;
    readonly b: string;
    readonly sub: string;
  };
  readonly cta: {
    readonly wait: string;
    readonly badgeTop: string;
    readonly storeLabel: string;
    readonly emailPh: string;
    readonly emailLabel: string;
    readonly note: string;
    /** The public beta, offered under the waitlist until the app is out. */
    readonly beta: string;
    /**
     * The Android closed test on Google Play, under the App Store badge: a Google account is left
     * here, the founder adds it to the testers by hand, then the person opts in with the link.
     */
    readonly android: {
      /** The line that opens the signup. */
      readonly open: string;
      /** What happens, before the field. */
      readonly how: string;
      readonly emailLabel: string;
      readonly emailPh: string;
      readonly send: string;
      /** After the signup: what to do next. */
      readonly sentTitle: string;
      readonly sentSteps: readonly string[];
      /** The ask that gets 6pm onto Google Play for everyone. */
      readonly stay: string;
      /** For people already added: before the opt-in link, which is shown in full. */
      readonly optIn: string;
    };
  };
  /** The hero phone: Today at nine in the morning. */
  readonly phone: {
    readonly day: string;
    readonly date: string;
    readonly safe: string;
    readonly num: string;
    readonly numSize: string;
    readonly spent: string;
    readonly of: string;
    readonly buddy: string;
    readonly tonight: string;
    readonly tonightSub: string;
    readonly streak: string;
    readonly streakSub: string;
    readonly week: readonly string[];
  };
  readonly capture: {
    readonly mark: string;
    readonly title: string;
    readonly sub: string;
    /** Label, line and icon for each way in, in the order the list shows them. */
    readonly ways: readonly (readonly [label: string, line: string, icon: string])[];
    /** The spend each way catches, with its category's icon and hue. */
    readonly rows: readonly CaptureRow[];
    readonly inboxTitle: string;
    readonly inboxSub: string;
    readonly inboxBadge: string;
    readonly justNow: string;
    readonly inboxFoot: string;
    /** Shown only where the bank strip runs; empty hides it. */
    readonly bankStrip: string;
  };
  readonly surfaces: SurfacesCopy;
  readonly close: {
    readonly mark: string;
    readonly title: string;
    readonly sub: string;
    readonly cards: readonly CloseCard[];
    readonly cardNumSize: string;
    readonly keptSoFar: string;
    readonly withThis: string;
    readonly keepStamp: string;
    readonly keep: string;
    readonly keepLast: string;
    readonly undo: string;
    readonly closedStamp: string;
    readonly hint: string;
    readonly again: string;
    readonly tomorrowLabel: string;
    readonly tomorrow: string;
    readonly tomorrowNote: string;
  };
  readonly number: {
    readonly mark: string;
    readonly title: string;
    readonly rows: readonly (readonly [op: string, label: string, value: string])[];
    readonly label: string;
    readonly num: string;
    readonly perDay: string;
    readonly size: string;
    readonly sub: string;
  };
  readonly beliefs: { readonly phrases: readonly string[] };
  readonly ask: {
    readonly mark: string;
    readonly appTitle: string;
    readonly title: string;
    readonly sub: string;
    readonly placeholder: string;
    readonly asks: readonly AskExchange[];
  };
  readonly duo: DuoCopy;
  readonly privacy: {
    readonly mark: string;
    readonly title: string;
    readonly facts: readonly (readonly [title: string, line: string])[];
    readonly cloning: string;
    readonly app: string;
    readonly domain: string;
    readonly legal: string;
  };
  readonly together: {
    readonly mark: string;
    readonly title: string;
    readonly sub: string;
    readonly jar: string;
    readonly potSub: string;
    readonly have: string;
    readonly goal: string;
    readonly you: string;
    readonly youInitial: string;
    readonly partner: string;
    readonly partnerInitial: string;
    readonly fromYou: string;
    readonly fromPartner: string;
    readonly note: string;
  };
  readonly pricing: {
    readonly title: string;
    readonly monthly: string;
    readonly yearly: string;
    /** Yearly against twelve months, in that market's prices: −33% for 799.000₫, −42% for $34.99. */
    readonly freeName: string;
    readonly zero: string;
    readonly freeFor: string;
    readonly free: readonly string[];
    readonly trial: string;
    readonly perMonth: string;
    readonly perYear: string;
    readonly max: readonly string[];
  };
  readonly faq: {
    readonly title: string;
    readonly items: readonly (readonly [question: string, answer: string])[];
  };
  readonly final: {
    readonly a: string;
    readonly b: string;
    readonly sub: string;
    readonly storeKicker: string;
  };
  readonly foot: {
    readonly tag: string;
    readonly openSource: string;
    readonly madeBy: string;
    readonly blog: string;
    readonly privacy: string;
    readonly terms: string;
  };
}

export const siteCopy: Readonly<Record<SiteLang, SiteCopy>> = { en: siteCopyEn, vi: siteCopyVi };

/** The home page in each language, as site paths. */
export const homePath: Readonly<Record<SiteLang, string>> = { en: '/', vi: '/vi' };
