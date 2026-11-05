import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';

import {
  newYearJarOf,
  newYearOffer,
  newYearTradition,
  nextNewYearWindow,
  seasonDay,
  type LunarTradition,
  type NewYearOffer,
  type NewYearWindow,
  type PotRow,
  type SeasonDay,
} from '@6pm/domain';

import { useMoney, useMoneyStore } from '../../data/money-provider';
import {
  readSeasonOffer,
  writeSeasonOffer,
  type SeasonOfferState,
} from '../../data/season-settings';
import { useI18n } from '../../i18n/i18n';
import { homeCurrencyOf } from '../../money/use-money-format';
import { readDeviceRegion } from '../banks/device-region';

// The offer's state on this phone, read once and shared by every screen that shows the offer.
let offerState: SeasonOfferState | null = null;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const setOfferState = (next: SeasonOfferState) => {
  offerState = next;
  for (const listener of listeners) listener();
};

/** Developer seeds: the offer starts unsaid ("Later" and onboarding's opening forgotten). */
export async function resetSeasonOffer(db: Parameters<typeof writeSeasonOffer>[0]): Promise<void> {
  setOfferState(await writeSeasonOffer(db, { laterUntil: null, onboardingShown: null }));
}

export interface NewYearSeason {
  /** Whose New Year the person keeps; null for none, and then nothing of the season shows. */
  readonly tradition: LunarTradition | null;
  /** The season holding today or coming next. */
  readonly window: NewYearWindow | null;
  /** Where today stands in it: counting down or the holiday; null outside it. */
  readonly day: SeasonDay | null;
  /** The season's jar, when there is one. */
  readonly jar: PotRow | null;
  /** The jar offer, when it is due. */
  readonly offer: NewYearOffer | null;
  /** The festival's name in the phone's language ("Tết", "설날"). */
  readonly festival: string;
  /** The envelope money's name ("Lì xì", "세뱃돈"): also the category's. */
  readonly envelope: string;
  /** "Later": Today's card waits until this day. */
  readonly putOff: (until: string) => Promise<void>;
  /** Onboarding's offer was opened for this season. */
  readonly markOnboardingShown: (year: number) => Promise<void>;
  readonly onboardingShown: number | null;
}

/**
 * The Lunar New Year season around today, for those who keep it (Tết with đồng or a phone in
 * Vietnam; Seollal in Korean; the Spring Festival in Simplified Chinese), and nothing for anyone
 * else.
 */
export function useNewYear(): NewYearSeason {
  const snap = useMoney();
  const store = useMoneyStore();
  const { t, language } = useI18n();
  const state = useSyncExternalStore(subscribe, () => offerState);
  useEffect(() => {
    if (offerState !== null) return;
    void readSeasonOffer(store.db).then(setOfferState);
  }, [store]);
  const currency = homeCurrencyOf(snap.plan).code;
  const tradition = useMemo(
    () => newYearTradition({ currency, region: readDeviceRegion().region, language }),
    [currency, language],
  );
  const today = snap.today;
  const window = tradition === null ? null : nextNewYearWindow(today, tradition);
  const jar = newYearJarOf(snap.pots);
  const offer =
    state === null
      ? null
      : newYearOffer({ today, tradition, pots: snap.pots, laterUntil: state.laterUntil });
  const putOff = useCallback(
    async (until: string) => setOfferState(await writeSeasonOffer(store.db, { laterUntil: until })),
    [store],
  );
  const markOnboardingShown = useCallback(
    async (year: number) =>
      setOfferState(await writeSeasonOffer(store.db, { onboardingShown: year })),
    [store],
  );
  return {
    tradition,
    window,
    day: seasonDay(today, tradition),
    jar,
    offer,
    festival: tradition === null ? '' : t(`season.festival.${tradition}`),
    envelope: tradition === null ? '' : t(`season.envelope.${tradition}`),
    putOff,
    markOnboardingShown,
    onboardingShown: state?.onboardingShown ?? null,
  };
}

/** The Lì xì category's id: made the first time a lì xì is kept, in the phone's language. */
export const ENVELOPE_CATEGORY_ID = 'lixi';
