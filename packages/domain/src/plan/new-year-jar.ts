import type { PotRow } from '../contracts/local-rows';
import { designAmount, VND, type Currency } from '../money/currency';
import type { Vnd } from '../money/format';
import { addDays, makeDate, type LocalDate } from '../time/local-date';
import {
  inNewYearWindow,
  nextNewYearWindow,
  type LunarTradition,
  type NewYearWindow,
} from '../time/lunar';
import { hasTet } from './jar-presets';
import { FUTURE_YOU_POT_ID } from './pots';

/**
 * Whose Lunar New Year the person keeps, or null for no season at all. Tết for a home in đồng or
 * a phone set to Vietnam (`hasTet`); otherwise Seollal for a phone in Korean and the Spring
 * Festival for one in Simplified Chinese, each with its own words. Everyone else is shown nothing.
 */
export function newYearTradition(input: {
  readonly currency: string | null | undefined;
  readonly region: string | null | undefined;
  readonly language: string | null | undefined;
}): LunarTradition | null {
  if (hasTet(input)) return 'tet';
  if (input.language === 'ko') return 'seollal';
  if (input.language === 'zh-Hans') return 'chunjie';
  return null;
}

/** The season's jar: the first live jar marked `newYear`, or null. */
export function newYearJarOf<T extends Pick<PotRow, 'id' | 'archivedAt' | 'season'>>(
  pots: readonly T[],
): T | null {
  return pots.find((p) => p.season === 'newYear' && p.archivedAt === null) ?? null;
}

/** Whether a jar is the season's: it never counts against the free jars. */
export function isNewYearJar(pot: Pick<PotRow, 'season'>): boolean {
  return pot.season === 'newYear';
}

/** The three taps that build the goal, each a row of amounts in đồng (scaled elsewhere). */
export type NewYearAsk = 'lixi' | 'gifts' | 'trip';

const ASKS: Readonly<Record<NewYearAsk, readonly Vnd[]>> = {
  lixi: [2_000_000, 3_000_000, 5_000_000],
  gifts: [1_000_000, 2_000_000, 3_000_000],
  trip: [0, 1_000_000, 2_000_000],
};

/** What each row starts on: 3tr of lì xì, 2tr of gifts home, 2tr for the trip home (7tr). */
export const NEW_YEAR_ASK_START: Readonly<Record<NewYearAsk, number>> = {
  lixi: 1,
  gifts: 1,
  trip: 2,
};

/** One row's amounts in the home currency: the design's đồng, worth the same elsewhere. */
export function newYearAskOptions(ask: NewYearAsk, currency: Currency = VND): Vnd[] {
  return ASKS[ask].map((dong) =>
    currency.code === 'VND' || dong === 0 ? dong : designAmount(dong, currency),
  );
}

/** The goal the three answers add up to. */
export function newYearJarGoal(
  picks: Readonly<Record<NewYearAsk, number>>,
  currency: Currency = VND,
): Vnd {
  return (Object.keys(ASKS) as NewYearAsk[]).reduce((sum, ask) => {
    const options = newYearAskOptions(ask, currency);
    return sum + (options[picks[ask]] ?? options[0] ?? 0);
  }, 0);
}

/** The month the jar fills by: mùng 1's, so the last payday before the season fills it. */
export function newYearJarMonth(window: NewYearWindow): string {
  return window.newYear.slice(0, 7);
}

/** The offer's card shows from 1 December before the season. */
const OFFER_FROM_MONTH = 12;
const OFFER_FROM_DAY = 1;
/** Onboarding offers the jar when mùng 1 is at most ten weeks away. */
const ONBOARDING_DAYS = 70;

/** Where the jar offer stands: shown on Today, offered once at onboarding, or neither. */
export interface NewYearOffer {
  readonly window: NewYearWindow;
  /** Today's card: from 1 December to the day before the season, unless put off. */
  readonly card: boolean;
  /** Onboarding ends on the offer: mùng 1 is within ten weeks and the season has not begun. */
  readonly onboarding: boolean;
}

/**
 * The jar offer for the coming season (nobody gets a jar by default; it is offered): from 1
 * December, or at onboarding once mùng 1 is ten weeks away, until the season begins. Never when
 * the person keeps no Lunar New Year, already has the season's jar for it, or put the card off
 * ("Later") until a day still to come.
 */
export function newYearOffer(input: {
  readonly today: LocalDate;
  readonly tradition: LunarTradition | null;
  readonly pots: readonly Pick<PotRow, 'id' | 'archivedAt' | 'season' | 'neededBy'>[];
  /** "Later" put the card away until this day (the next payday); null when it never was. */
  readonly laterUntil: LocalDate | null;
}): NewYearOffer | null {
  const { today, tradition } = input;
  if (tradition === null) return null;
  const window = nextNewYearWindow(today, tradition);
  if (window === null || today >= window.start) return null;
  const jar = newYearJarOf(input.pots);
  if (jar !== null && jar.neededBy !== null && jar.neededBy >= newYearJarMonth(window)) return null;
  const from = makeDate(window.year - 1, OFFER_FROM_MONTH, OFFER_FROM_DAY);
  const putOff = input.laterUntil !== null && today < input.laterUntil;
  return {
    window,
    card: today >= from && !putOff,
    onboarding: today >= addDays(window.newYear, -ONBOARDING_DAYS),
  };
}

/** A new season's jar as a row: a dated jar by mùng 1's month, marked as the season's. */
export function newYearJarRow(input: {
  readonly id: string;
  readonly name: string;
  readonly goal: Vnd;
  readonly window: NewYearWindow;
  readonly createdAt: string;
}): PotRow {
  return {
    id: input.id,
    kind: 'occasion',
    name: input.name,
    icon: 'local_florist',
    hue: 20,
    goal: input.goal,
    neededBy: newYearJarMonth(input.window),
    share: null,
    monthly: null,
    season: 'newYear',
    paused: false,
    createdAt: input.createdAt,
    archivedAt: null,
  };
}

/**
 * The season's jar that arms itself (M13): inside the season's window, the jar asks "From your
 * {jar}?" without a spend taken from it by hand, until the person answers No in this season
 * (`declinedOn`, the day of their last No for it). Null outside the window or with no jar.
 */
export function newYearArmedJar<T extends Pick<PotRow, 'id' | 'archivedAt' | 'season'>>(input: {
  readonly pots: readonly T[];
  readonly day: LocalDate;
  readonly window: NewYearWindow | null;
  readonly declinedOn: Readonly<Record<string, LocalDate>>;
}): T | null {
  const jar = newYearJarOf(input.pots);
  if (jar === null || jar.id === FUTURE_YOU_POT_ID) return null;
  if (!inNewYearWindow(input.day, input.window) || input.window === null) return null;
  const no = input.declinedOn[jar.id];
  return no !== undefined && no >= input.window.start ? null : jar;
}
