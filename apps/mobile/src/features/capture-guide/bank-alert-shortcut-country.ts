import { bankCountry, countrySignals, type DeviceRegion } from '../banks/bank-ranking';

/** The key of the shortcut for a country 6pm has no list for. */
export const WORLD_SHORTCUT = 'world';

/**
 * The published "Catch a bank alert" shortcut for this phone, from the links by country (ISO
 * 3166-1 alpha-2, and `world`): the same country whose banks the bank picker offers. Vietnam's when
 * the phone points at Vietnam at all (its region, currency or clock); otherwise the country it
 * points at most strongly that has a list, a tie going to its region; otherwise the world's.
 * Vietnam's stands in for any link not yet published, and null only when there is none at all.
 */
export function bankAlertShortcutFor(
  device: DeviceRegion,
  links: Readonly<Record<string, string>>,
): string | null {
  const vietnam = links.VN ?? null;
  if (countrySignals(device).has('VN')) return vietnam;
  const country = bankCountry(device);
  const own = country === null ? undefined : links[country];
  return own ?? links[WORLD_SHORTCUT] ?? vietnam;
}
