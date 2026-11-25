import { getLocales } from 'expo-localization';

import { guessHomeCurrency, type HomeGuess, type PhoneNumberStyle } from '@6pm/domain';

import { readDeviceRegion } from '../features/banks/device-region';

/**
 * The currency the person picked before there was a plan to keep it in (onboarding). Kept only
 * while the app runs: onboarding's other answers live no longer than that either.
 */
let chosen: string | null = null;
const listeners = new Set<() => void>();

/** The currency chosen ahead of the plan, for `useSyncExternalStore`. */
export const startingCurrency = {
  get: (): string | null => chosen,
  set: (code: string | null): void => {
    const next = code === null ? null : code.toUpperCase();
    if (next === chosen) return;
    chosen = next;
    for (const listener of listeners) listener();
  },
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

/** What the phone's settings point at: its region's currency, or đồng for a clock in Vietnam. */
export function deviceCurrencyGuess(): HomeGuess {
  const device = readDeviceRegion();
  return guessHomeCurrency({
    regionCurrency: device.currency,
    languageTags: getLocales().map((l) => l.languageTag),
    timeZone: device.timeZone,
  });
}

/**
 * The currency a plan made now would be in (ISO 4217): the one the person picked, else the
 * phone's own ("VND" in Vietnam, "USD" in the US).
 */
export function deviceCurrencyCode(): string {
  return chosen ?? deviceCurrencyGuess().code;
}

/** How the phone writes numbers: its first locale, its region and its separators. */
export function phoneNumberStyle(): PhoneNumberStyle {
  const locale = getLocales()[0];
  return {
    languageTag: locale?.languageTag ?? null,
    region: locale?.regionCode ?? null,
    decimal: locale?.decimalSeparator ?? null,
    group: locale?.digitGroupingSeparator ?? null,
  };
}
